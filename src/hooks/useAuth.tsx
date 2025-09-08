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
    const initAuth = async () => {
      // 1. First, try to read iOS-injected session
      const savedSession = localStorage.getItem('sb-fzhmvraztypgemyrguxw-auth-token');
      
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          
          if (parsed?.currentSession) {
            console.log('🍎 Found iOS WebView session, restoring...', parsed);
            const { data, error } = await supabase.auth.setSession(parsed.currentSession);
            
            if (error) {
              console.error('❌ Failed to set iOS session:', error);
            } else {
              console.log('✅ iOS session set successfully');
              setSession(data.session);
              setUser(data.session?.user ?? null);
              setLoading(false);
              return; // Exit early, we have our session
            }
          }
        } catch (e) {
          console.error('❌ Could not parse iOS session:', e);
        }
      }

      // 2. Fallback - get current session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    // 3. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        // Don't set loading to false here, let initAuth handle it
      }
    );

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};