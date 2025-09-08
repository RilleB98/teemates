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
    let isInitialized = false;

    const initAuth = async () => {
      try {
        console.log("🚀 Starting auth initialization...");
        
        // Check for auth tokens in URL (iOS redirect pattern)
        const urlParams = new URLSearchParams(window.location.search);
        const urlHash = window.location.hash;
        
        console.log("🔗 URL search:", window.location.search);
        console.log("🔗 URL hash:", urlHash);
        console.log("📱 All localStorage keys:", Object.keys(localStorage));
        
        let sessionRestored = false;
        
        // Method 1: Check URL hash for tokens (standard OAuth)
        if (urlHash && urlHash.includes('access_token')) {
          console.log("🎯 Found auth tokens in URL hash");
          const hashParams = new URLSearchParams(urlHash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log("🔧 Setting session from URL hash tokens...");
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (!error && data.session) {
              console.log("✅ Session restored from URL hash");
              setSession(data.session);
              setUser(data.session.user);
              sessionRestored = true;
              
              // Clean URL
              window.history.replaceState({}, document.title, window.location.pathname);
            } else {
              console.error("❌ Failed to set session from URL hash:", error);
            }
          }
        }
        
        // Method 2: Check localStorage (iOS injection)
        if (!sessionRestored) {
          console.log("🔍 Checking localStorage for iOS session...");
          const savedSession = localStorage.getItem('sb-fzhmvraztypgemyrguxw-auth-token');
          
          if (savedSession) {
            console.log("📱 Found iOS session in localStorage");
            try {
              const parsed = JSON.parse(savedSession);
              if (parsed?.currentSession) {
                console.log("🔧 Restoring iOS localStorage session...");
                const { data, error } = await supabase.auth.setSession(parsed.currentSession);
                
                if (!error && data.session) {
                  console.log("✅ iOS localStorage session restored");
                  setSession(data.session);
                  setUser(data.session.user);
                  sessionRestored = true;
                } else {
                  console.error("❌ Failed to restore iOS session:", error);
                }
              }
            } catch (e) {
              console.error("❌ Failed to parse iOS session:", e);
            }
          } else {
            console.log("📭 No iOS session in localStorage");
          }
        }
        
        // Method 3: Check existing Supabase session
        if (!sessionRestored) {
          console.log("🔄 Checking existing Supabase session...");
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            console.log("✅ Found existing Supabase session");
            setSession(data.session);
            setUser(data.session.user);
            sessionRestored = true;
          } else {
            console.log("❌ No existing session found");
          }
        }
        
        // Final state
        if (!sessionRestored) {
          console.log("❌ No session restored - user needs to login");
          setSession(null);
          setUser(null);
        }
        
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setSession(null);
        setUser(null);
      } finally {
        if (!isInitialized) {
          setLoading(false);
          isInitialized = true;
          console.log("✅ Auth initialization complete");
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", event, !!session);
      if (isInitialized) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};