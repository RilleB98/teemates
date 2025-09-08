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
    const restoreIOSSession = async () => {
      try {
        console.log("🔍 Kollar efter iOS-session i localStorage...");
        const raw = localStorage.getItem("sb-fzhmvraztypgemyrguxw-auth-token");

        if (raw) {
          const parsed = JSON.parse(raw);
          console.log("📥 Hittade iOS-session:", parsed);

          if (parsed.currentSession) {
            console.log("🔧 Återställer iOS-session med setSession...");
            const { data, error } = await supabase.auth.setSession(parsed.currentSession);
            if (error) {
              console.error("❌ Kunde inte återställa iOS-session:", error);
            } else {
              console.log("✅ Återställde iOS-session:", data);
              setSession(data.session);
              setUser(data.session?.user ?? null);
            }
          }
        } else {
          console.log("📭 Ingen iOS-session hittades i localStorage");
          // Fallback to regular session check
          const { data } = await supabase.auth.getSession();
          console.log("🔄 Fallback getSession result:", !!data.session);
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        console.error("❌ Fel vid parsing av iOS-session:", err);
        // Fallback to regular session check on error
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } finally {
        setLoading(false);
        console.log("✅ Auth initialization complete");
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 onAuthStateChange:", event, !!session);
      setSession(session);
      setUser(session?.user ?? null);
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