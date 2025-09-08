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
    let isInitComplete = false;

    const restoreIOSSession = async () => {
      try {
        console.log("🔍 Checking iOS session...");
        const raw = localStorage.getItem("sb-fzhmvraztypgemyrguxw-auth-token");

        if (raw) {
          console.log("📱 Found iOS session data in localStorage");
          const parsed = JSON.parse(raw);
          
          if (parsed.currentSession) {
            console.log("🔧 Restoring iOS session via supabase.auth.setSession()...");
            const { data, error } = await supabase.auth.setSession(parsed.currentSession);
            
            if (error) {
              console.error("❌ Failed to restore iOS session:", error);
              console.log("❌ No iOS session found, will redirect to /auth");
            } else {
              console.log("✅ iOS session restored via supabase.auth.setSession()");
              setSession(data.session);
              setUser(data.session?.user ?? null);
              isInitComplete = true;
              setLoading(false);
              return; // Early exit on success
            }
          } else {
            console.log("⚠️ iOS session data found but no currentSession");
          }
        } else {
          console.log("📭 No iOS session data found in localStorage");
        }

        // Fallback to regular session check
        console.log("🔄 Fallback: checking regular Supabase session...");
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("✅ Found existing Supabase session");
          setSession(data.session);
          setUser(data.session?.user ?? null);
        } else {
          console.log("❌ No iOS session found, redirecting to /auth");
          setSession(null);
          setUser(null);
        }
        
      } catch (err) {
        console.error("❌ Error during iOS session restoration:", err);
        console.log("❌ No iOS session found, redirecting to /auth");
        
        // Fallback to regular session check on error
        try {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          setUser(data.session?.user ?? null);
        } catch (fallbackError) {
          console.error("❌ Fallback session check also failed:", fallbackError);
          setSession(null);
          setUser(null);
        }
      } finally {
        if (!isInitComplete) {
          setLoading(false);
          console.log("✅ Auth initialization complete - ready for routing decisions");
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 onAuthStateChange:", event, !!session);
      // Only update state if initialization is complete to avoid race conditions
      if (!isInitComplete || event !== 'INITIAL_SESSION') {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    restoreIOSSession();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};