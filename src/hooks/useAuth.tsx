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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for iOS WebView injected session first
    const checkIosSession = async () => {
      const savedSession = localStorage.getItem('sb-fzhmvraztypgemyrguxw-auth-token');
      
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          
          if (parsed.currentSession) {
            console.log('🍎 Found iOS WebView session, restoring...');
            const { data, error } = await supabase.auth.setSession(parsed.currentSession);
            
            if (error) {
              console.error('❌ setSession error', error);
              // Fall back to regular session check
              supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
              });
            } else {
              console.log('✅ Session restored from iOS WebView', data);
              // Session will be updated via onAuthStateChange
            }
          } else {
            // No currentSession in saved data, check regular session
            supabase.auth.getSession().then(({ data: { session } }) => {
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            });
          }
        } catch (e) {
          console.error('❌ Failed to parse savedSession', e);
          // Fall back to regular session check
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          });
        }
      } else {
        // No saved session, check for existing session normally
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });
      }
    };

    checkIosSession();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};