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

    const forceSessionRefresh = async () => {
      try {
        console.log("🔄 Forcing session refresh...");
        
        // Try to refresh the session
        const { data, error } = await supabase.auth.refreshSession();
        
        if (data.session && isMounted) {
          console.log("✅ Session refreshed successfully");
          setSession(data.session);
          setUser(data.session.user);
          return true;
        }
        
        if (error) {
          console.log("❌ Session refresh failed:", error.message);
        }
        
        return false;
      } catch (error) {
        console.error("❌ Session refresh error:", error);
        return false;
      }
    };

    const checkForSession = async () => {
      try {
        console.log("🚀 Starting comprehensive session check...");
        
        // First, try to get existing session
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
          return;
        }
        
        console.log("❌ No existing session - trying refresh...");
        const refreshed = await forceSessionRefresh();
        
        if (!refreshed) {
          console.log("❌ No session found after refresh - user needs to login");
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        console.log("🚪 User signed out");
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
        return;
      }
      
      if (session) {
        console.log("👤 New session user ID:", session.user?.id);
        if (isMounted) {
          setSession(session);
          setUser(session.user);
          if (loading) {
            setLoading(false);
          }
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        console.log("🔄 No initial session - trying refresh...");
        await forceSessionRefresh();
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