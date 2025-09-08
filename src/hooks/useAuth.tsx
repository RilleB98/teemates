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
    let isInitializing = true;

    const restoreIOSSession = async () => {
      console.log("🔍 Checking iOS session...");
      
      // Wait a bit to ensure iOS has injected the session
      await new Promise(resolve => setTimeout(resolve, 150));
      
      try {
        const raw = localStorage.getItem("sb-fzhmvraztypgemyrguxw-auth-token");

        if (raw) {
          console.log("📱 Found iOS session data in localStorage");
          const parsed = JSON.parse(raw);
          
          if (parsed.currentSession) {
            console.log("🔧 Restoring iOS session via supabase.auth.setSession()...");
            const { data, error } = await supabase.auth.setSession(parsed.currentSession);
            
            if (error) {
              console.error("❌ Failed to restore iOS session:", error);
            } else {
              console.log("✅ iOS session restored via supabase.auth.setSession()");
              console.log("👤 User ID:", data.session?.user?.id);
              setSession(data.session);
              setUser(data.session?.user ?? null);
              setLoading(false);
              isInitializing = false;
              return true; // Success
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
          console.log("❌ No session found anywhere - user needs to login");
          setSession(null);
          setUser(null);
        }
        
        return false; // No iOS session found
        
      } catch (err) {
        console.error("❌ Error during iOS session restoration:", err);
        
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
        return false;
      } finally {
        if (isInitializing) {
          setLoading(false);
          isInitializing = false;
          console.log("✅ Auth initialization complete - ready for routing decisions");
        }
      }
    };

    // Set up auth state listener - but ignore initial session during iOS restore
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 onAuthStateChange:", event, !!session);
      
      // Don't interfere during initial iOS session restoration
      if (!isInitializing) {
        setSession(session);
        setUser(session?.user ?? null);
      } else {
        console.log("⏸️ Ignoring auth state change during iOS session restoration");
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