import React, { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 DEBUG: useAuth starting...");
    console.log("🚀 DEBUG: window.location.href:", window.location.href);
    console.log("🚀 DEBUG: window.location.hash:", window.location.hash);
    console.log("🚀 DEBUG: window.location.search:", window.location.search);
    let isMounted = true;

    // Parse tokens directly from URL fragments for iOS OAuth redirects
    const parseTokensFromURL = () => {
      console.log("🔍 DEBUG: parseTokensFromURL called");
      
      // Check if early auth was already handled in main.tsx
      const earlyHandled = sessionStorage.getItem('early_auth_handled');
      if (earlyHandled) {
        console.log("✅ DEBUG: Early auth already handled in main.tsx, skipping token parsing");
        sessionStorage.removeItem('early_auth_handled');
        return null; // Let normal session check proceed
      }
      
      // Check if we have early tokens from main.tsx (fallback)
      const earlyTokens = sessionStorage.getItem('early_auth_tokens');
      if (earlyTokens) {
        console.log("🚀 DEBUG: Found early auth tokens from main.tsx");
        const tokens = JSON.parse(earlyTokens);
        sessionStorage.removeItem('early_auth_tokens');
        return {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: '3600',
          tokenType: 'bearer'
        };
      }
      
      // Fallback: check URL directly (shouldn't happen if early processing worked)
      const hash = window.location.hash;
      const search = window.location.search;
      
      console.log("🔍 DEBUG: Hash:", hash);
      console.log("🔍 DEBUG: Search:", search);
      console.log("🔍 DEBUG: Full URL:", window.location.href);
      
      // Check for access_token in URL fragment (#access_token=...)
      if (hash.includes('access_token=')) {
        console.log("✅ DEBUG: Found access_token in URL fragment");
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        
        console.log("🔍 DEBUG: Parsed tokens:", { accessToken: !!accessToken, refreshToken: !!refreshToken, expiresIn, tokenType });
        
        if (accessToken) {
          console.log("🍎 DEBUG: Returning tokens for session establishment");
          return { accessToken, refreshToken, expiresIn, tokenType };
        }
      }
      
      console.log("❌ DEBUG: No tokens found in URL");
      return null;
    };

    const establishSessionFromTokens = async (tokens: any) => {
      try {
        console.log("🔥 DEBUG: establishSessionFromTokens called with:", { hasAccessToken: !!tokens.accessToken, hasRefreshToken: !!tokens.refreshToken });
        
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken || '',
        });
        
        console.log("🔥 DEBUG: setSession result:", { hasSession: !!data.session, hasUser: !!data.session?.user, error: error?.message });
        
        if (data.session && isMounted) {
          console.log("✅ DEBUG: Session established successfully!");
          console.log("✅ DEBUG: User ID:", data.session.user?.id);
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
          
          // Clean URL
          console.log("🧹 DEBUG: Cleaning URL...");
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
        
        if (error) {
          console.error("❌ DEBUG: Error setting session from tokens:", error);
        }
        
        return false;
      } catch (error) {
        console.error("❌ DEBUG: Exception in establishSessionFromTokens:", error);
        return false;
      }
    };

    const checkForExistingSession = async () => {
      try {
        console.log("🔍 DEBUG: checkForExistingSession called");
        
        const { data, error } = await supabase.auth.getSession();
        
        console.log("🔍 DEBUG: getSession result:", { hasSession: !!data.session, hasUser: !!data.session?.user, error: error?.message });
        
        if (data.session && isMounted) {
          console.log("✅ DEBUG: Found existing session!");
          console.log("✅ DEBUG: User ID:", data.session.user?.id);
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
          return true;
        }
        
        if (error) {
          console.error("❌ DEBUG: Error getting session:", error);
        }
        
        console.log("❌ DEBUG: No existing session found");
        return false;
      } catch (error) {
        console.error("❌ DEBUG: Exception in checkForExistingSession:", error);
        return false;
      }
    };

    const initializeAuth = async () => {
      console.log("🚀 DEBUG: initializeAuth starting...");
      
      // First: Check if there are tokens in the URL (iOS OAuth redirect)
      const urlTokens = parseTokensFromURL();
      if (urlTokens) {
        console.log("🔥 DEBUG: Found URL tokens, attempting to establish session...");
        const success = await establishSessionFromTokens(urlTokens);
        if (success) {
          console.log("✅ DEBUG: Session established from URL tokens - auth complete!");
          return;
        } else {
          console.log("❌ DEBUG: Failed to establish session from URL tokens");
        }
      }
      
      // Second: Check for existing session
      console.log("🔍 DEBUG: Checking for existing session...");
      const hasSession = await checkForExistingSession();
      if (hasSession) {
        console.log("✅ DEBUG: Found existing session - auth complete!");
        return;
      }
      
      // No session found - set loading to false
      if (isMounted) {
        console.log("❌ DEBUG: No session found - user needs to login");
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    // Set up auth state listener (simplified for iOS)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 DEBUG: Auth state change:", event, !!session);
      console.log("🔄 DEBUG: Session details:", { hasUser: !!session?.user, userId: session?.user?.id });
      
      if (!isMounted) {
        console.log("🚫 DEBUG: Component unmounted, ignoring auth state change");
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("🚪 DEBUG: User signed out");
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session) {
        console.log("✅ DEBUG: New session established via auth state change");
        setSession(session);
        setUser(session.user);
        setLoading(false);
      }
    });

    // Initialize authentication
    console.log("🚀 DEBUG: Calling initializeAuth...");
    initializeAuth();

    return () => {
      console.log("🧹 DEBUG: useAuth cleanup");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};