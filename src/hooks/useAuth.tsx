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
    let checkCount = 0;

    const checkURLParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      console.log("🔗 Checking URL params for auth tokens...");
      console.log("🔗 Search params:", window.location.search);
      console.log("🔗 Hash:", hash);
      
      // Check for access_token in hash (common OAuth pattern)
      if (hash && hash.includes('access_token')) {
        console.log("🎯 Found access_token in URL hash!");
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken) {
          console.log("🔧 Setting session from URL tokens...");
          return { access_token: accessToken, refresh_token: refreshToken };
        }
      }
      
      return null;
    };

    const checkLocalStorageMultipleTimes = async () => {
      const maxChecks = 5;
      console.log("🔍 Starting iOS session check sequence...");
      
      // First check URL params
      const urlTokens = checkURLParams();
      if (urlTokens) {
        return { fromURL: true, tokens: urlTokens };
      }
      
      while (checkCount < maxChecks && isInitializing) {
        checkCount++;
        console.log(`🔍 Check #${checkCount}/${maxChecks} - Checking localStorage for iOS session...`);
        console.log("📱 All localStorage keys:", Object.keys(localStorage));
        console.log("🕐 Current timestamp:", Date.now());
        
        const raw = localStorage.getItem("sb-fzhmvraztypgemyrguxw-auth-token");
        if (raw) {
          console.log("🎉 Found iOS session data on check #" + checkCount);
          return raw;
        }
        
        if (checkCount < maxChecks) {
          console.log(`⏳ No session found, waiting 300ms before check #${checkCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      console.log("❌ No iOS session found after " + maxChecks + " attempts");
      return null;
    };

    const restoreIOSSession = async () => {
      try {
        const result = await checkLocalStorageMultipleTimes();

        if (result) {
          if (typeof result === 'object' && result.fromURL) {
            // Handle URL tokens
            console.log("🔧 Restoring session from URL tokens...");
            const { data, error } = await supabase.auth.setSession({
              access_token: result.tokens.access_token,
              refresh_token: result.tokens.refresh_token || ''
            });
            
            if (error) {
              console.error("❌ Failed to restore session from URL tokens:", error);
            } else {
              console.log("✅ Session restored from URL tokens");
              console.log("👤 User ID:", data.session?.user?.id);
              setSession(data.session);
              setUser(data.session?.user ?? null);
              setLoading(false);
              isInitializing = false;
              return true;
            }
          } else if (typeof result === 'string') {
            // Handle localStorage data
            console.log("📱 Found iOS session data - attempting to parse...");
            const parsed = JSON.parse(result);
            
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
                return true;
              }
            } else {
              console.log("⚠️ iOS session data found but no currentSession");
            }
          }
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
        
        return false;
        
      } catch (err) {
        console.error("❌ Error during iOS session restoration:", err);
        
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 onAuthStateChange:", event, !!session);
      
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