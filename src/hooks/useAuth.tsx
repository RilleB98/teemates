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
    console.log("🚀 useAuth useEffect STARTED - mounting auth logic");
    let isMounted = true;

    const checkForSession = async () => {
      try {
        console.log("🚀 Starting session check...");
        
        // First clear any potentially corrupted session
        console.log("🧹 Clearing any existing auth state...");
        await supabase.auth.signOut({ scope: 'local' });
        
        // Check URL for Apple OAuth tokens
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        
        console.log("🔍 URL params:", urlParams.toString());
        console.log("🔍 Hash:", hash);
        
        const accessToken = urlParams.get('access_token') || 
                           (hash.includes('access_token=') ? 
                            hash.split('access_token=')[1]?.split('&')[0] : null);
        
        const refreshToken = urlParams.get('refresh_token') ||
                            (hash.includes('refresh_token=') ? 
                             hash.split('refresh_token=')[1]?.split('&')[0] : null);
        
        if (accessToken && refreshToken) {
          console.log("🎯 Found tokens in URL - setting session...");
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("❌ Error setting session from URL tokens:", error);
          } else if (data.session) {
            console.log("✅ Successfully set session from URL tokens");
            if (isMounted) {
              setSession(data.session);
              setUser(data.session.user);
            }
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
            return;
          }
        }
        
        // Check for existing session
        console.log("🔄 Checking for existing Supabase session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        }
        
        if (data.session && isMounted) {
          console.log("✅ Found existing Supabase session");
          console.log("👤 User ID:", data.session.user?.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("❌ No session found - user needs to login");
          if (isMounted) {
            setSession(null);
            setUser(null);
          }
        }
        
      } catch (error) {
        console.error("❌ Session check error:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("✅ Session check complete");
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", event, !!session);
      if (session) {
        console.log("👤 New session user ID:", session.user?.id);
      }
      
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session && loading) {
          setLoading(false);
        }
      }
    });

    checkForSession();

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