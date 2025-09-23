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
  const [lastAuthCheck, setLastAuthCheck] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    let mounted = true;
    let authStateSubscription: any = null;

    // Rate limiting check - prevent too frequent auth checks
    const canCheckAuth = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastAuthCheck;
      const minInterval = 1000; // Minimum 1 second between auth checks

      if (timeSinceLastCheck < minInterval) {
        console.log('🍎 MAIN: Rate limiting auth check, too frequent');
        return false;
      }
      
      setLastAuthCheck(now);
      return true;
    };

    const handleAuthError = (error: any) => {
      console.error('🍎 MAIN: Auth error:', error);
      
      // Handle rate limiting
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        console.log('🍎 MAIN: Rate limited, backing off');
        setIsRateLimited(true);
        
        // Clear rate limit after 30 seconds
        setTimeout(() => {
          setIsRateLimited(false);
          console.log('🍎 MAIN: Rate limit cleared');
        }, 30000);
        
        return;
      }
    };

    const cleanupAuthStorage = () => {
      // Clean up potentially stale session data
      try {
        sessionStorage.removeItem('early_auth_data');
        sessionStorage.removeItem('early_auth_handled');
        sessionStorage.removeItem('early_auth_tokens');
        
        // Clear URL tokens if present
        if (window.location.hash.includes('access_token') || window.location.search.includes('access_token')) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (e) {
        console.error('🍎 MAIN: Error cleaning auth storage:', e);
      }
    };

    const parseTokensFromURL = () => {
      const urlHash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for tokens in URL hash (OAuth redirect)
      if (urlHash) {
        const hashParams = new URLSearchParams(urlHash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          return { accessToken, refreshToken };
        }
      }
      
      // Check for tokens in URL params (backup)
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      
      return null;
    };

    const establishSessionFromTokens = async (tokens: { accessToken: string; refreshToken: string }) => {
      if (!canCheckAuth() || isRateLimited) {
        console.log('🍎 MAIN: Skipping auth due to rate limiting');
        return;
      }

      try {
        console.log('🍎 MAIN: Setting session from tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken
        });

        if (error) {
          handleAuthError(error);
          return;
        }

        if (data.session && mounted) {
          setSession(data.session);
          setUser(data.session.user);
          console.log('🍎 MAIN: Session established successfully');
          cleanupAuthStorage();
        }
      } catch (error) {
        handleAuthError(error);
      }
    };

    const checkForExistingSession = async () => {
      if (!canCheckAuth() || isRateLimited) {
        console.log('🍎 MAIN: Skipping session check due to rate limiting');
        if (mounted) setLoading(false);
        return;
      }

      try {
        console.log('🍎 MAIN: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleAuthError(error);
          return;
        }
        
        if (session && mounted) {
          setSession(session);
          setUser(session.user);
          console.log('🍎 MAIN: Found existing session');
        }
      } catch (error) {
        handleAuthError(error);
      }
    };

    const initializeAuth = async () => {
      try {
        // Clean up any stale data first
        cleanupAuthStorage();
        
        // Check for tokens first
        const tokens = parseTokensFromURL();
        
        if (tokens) {
          await establishSessionFromTokens(tokens);
        } else {
          await checkForExistingSession();
        }
      } catch (error) {
        console.error('🍎 MAIN: Error during auth initialization:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with rate limiting protection
    const setupAuthListener = () => {
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🍎 MAIN: Auth state changed:', event, session?.user?.id);
          
          // Prevent excessive state changes
          if (!mounted || isRateLimited) {
            console.log('🍎 MAIN: Ignoring auth state change due to rate limiting');
            return;
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            cleanupAuthStorage();
            setLoading(false);
          }
        }
      );

      authStateSubscription = subscription;
    };

    // Initialize everything
    setupAuthListener();
    initializeAuth();

    return () => {
      mounted = false;
      if (authStateSubscription) {
        authStateSubscription.unsubscribe();
      }
    };
  }, [lastAuthCheck, isRateLimited]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};