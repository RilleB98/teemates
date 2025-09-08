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

    const initAuth = async () => {
      try {
        console.log("🚀 Starting auth initialization...");
        
        // Check for existing Supabase session immediately
        console.log("🔄 Checking for existing Supabase session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        }
        
        if (data.session && isMounted) {
          console.log("✅ Found existing Supabase session");
          console.log("👤 User ID:", data.session.user?.id);
          console.log("🔑 Session expires at:", new Date(data.session.expires_at! * 1000));
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("❌ No existing session found - user needs to login");
          if (isMounted) {
            setSession(null);
            setUser(null);
          }
        }
        
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("✅ Auth initialization complete - ready for routing decisions");
        }
      }
    };

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", event, !!session);
      if (session) {
        console.log("👤 New session user ID:", session.user?.id);
      }
      
      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If we get a new session, make sure loading is false
        if (session && loading) {
          setLoading(false);
        }
      }
    });

    initAuth();

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