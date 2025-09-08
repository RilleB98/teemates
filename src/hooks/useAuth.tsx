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
    console.log("🍎 iOS Auth: Starting initialization...");
    let isMounted = true;

    // Parse tokens directly from URL fragments for iOS OAuth redirects
    const parseTokensFromURL = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      console.log("🍎 Checking URL for auth tokens...");
      console.log("🔍 Hash:", hash);
      console.log("🔍 Search:", search);
      
      // Check for access_token in URL fragment (#access_token=...)
      if (hash.includes('access_token=')) {
        console.log("✅ Found access_token in URL fragment");
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        
        if (accessToken) {
          console.log("🍎 Setting session from URL tokens...");
          return { accessToken, refreshToken, expiresIn, tokenType };
        }
      }
      
      return null;
    };

    const establishSessionFromTokens = async (tokens: any) => {
      try {
        console.log("🍎 Establishing session from tokens...");
        
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken || '',
        });
        
        if (data.session && isMounted) {
          console.log("✅ Session established from tokens");
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
        
        if (error) {
          console.error("❌ Error setting session from tokens:", error);
        }
        
        return false;
      } catch (error) {
        console.error("❌ Error establishing session:", error);
        return false;
      }
    };

    const checkForExistingSession = async () => {
      try {
        console.log("🍎 Checking for existing session...");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session && isMounted) {
          console.log("✅ Found existing session");
          setSession(data.session);
          setUser(data.session.user);
          setLoading(false);
          return true;
        }
        
        if (error) {
          console.error("❌ Error getting session:", error);
        }
        
        return false;
      } catch (error) {
        console.error("❌ Session check error:", error);
        return false;
      }
    };

    const initializeAuth = async () => {
      // First: Check if there are tokens in the URL (iOS OAuth redirect)
      const urlTokens = parseTokensFromURL();
      if (urlTokens) {
        const success = await establishSessionFromTokens(urlTokens);
        if (success) return;
      }
      
      // Second: Check for existing session
      const hasSession = await checkForExistingSession();
      if (hasSession) return;
      
      // No session found - set loading to false
      if (isMounted) {
        console.log("❌ No session found - user needs to login");
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    // Set up auth state listener (simplified for iOS)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🍎 Auth state change:", event, !!session);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (session) {
        console.log("✅ New session established");
        setSession(session);
        setUser(session.user);
        setLoading(false);
      }
    });

    // Initialize authentication
    initializeAuth();

    return () => {
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