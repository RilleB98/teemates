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
    let pollingActive = true;

    const waitForIOSSession = async (maxAttempts = 15, interval = 300) => {
      console.log(`🔍 Starting iOS session polling (${maxAttempts} attempts, ${interval}ms interval)...`);
      
      for (let attempt = 1; attempt <= maxAttempts && pollingActive && isMounted; attempt++) {
        console.log(`🔍 Attempt ${attempt}/${maxAttempts} - Checking for iOS session...`);
        
        // Check URL hash first (highest priority)
        const urlHash = window.location.hash;
        if (urlHash && urlHash.includes('access_token')) {
          console.log("🎯 Found auth tokens in URL hash on attempt " + attempt);
          const hashParams = new URLSearchParams(urlHash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log("🔧 Setting session from URL tokens...");
            
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (!error && data.session && isMounted) {
                console.log("✅ Session successfully set from URL tokens");
                console.log("👤 User ID:", data.session.user?.id);
                
                // Wait for session to be fully established
                await new Promise(resolve => setTimeout(resolve, 100));
                
                setSession(data.session);
                setUser(data.session.user);
                pollingActive = false;
                
                // Clean URL after successful auth
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log("🧹 URL cleaned after successful auth");
                console.log("✅ Auth complete via URL tokens - ready for routing");
                return true; // Success
              } else {
                console.error("❌ Failed to set session from URL tokens:", error);
              }
            } catch (e) {
              console.error("❌ Error setting session from URL tokens:", e);
            }
          }
        }
        
        // Check localStorage for iOS injection
        const savedSession = localStorage.getItem('sb-fzhmvraztypgemyrguxw-auth-token');
        console.log(`📱 localStorage keys on attempt ${attempt}:`, Object.keys(localStorage));
        
        if (savedSession) {
          console.log(`📱 Found iOS session in localStorage on attempt ${attempt}`);
          
          try {
            const parsed = JSON.parse(savedSession);
            console.log("📋 Parsed session keys:", Object.keys(parsed || {}));
            
            if (parsed?.currentSession) {
              console.log("🔧 Setting session from iOS localStorage...");
              
              const { data, error } = await supabase.auth.setSession(parsed.currentSession);
              
              if (!error && data.session && isMounted) {
                console.log("✅ Session successfully set from iOS localStorage");
                console.log("👤 User ID:", data.session.user?.id);
                
                // Wait for session to be fully established
                await new Promise(resolve => setTimeout(resolve, 100));
                
                setSession(data.session);
                setUser(data.session.user);
                pollingActive = false;
                
                console.log("✅ Auth complete via iOS localStorage - ready for routing");
                return true; // Success
              } else {
                console.error("❌ Failed to set session from iOS localStorage:", error);
              }
            } else {
              console.log("⚠️ iOS session data found but no currentSession property");
            }
          } catch (e) {
            console.error("❌ Failed to parse iOS session data:", e);
          }
        }
        
        // Wait before next attempt (unless it's the last one)
        if (attempt < maxAttempts && pollingActive) {
          console.log(`⏳ No session found, waiting ${interval}ms before attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
      
      console.log("❌ iOS session polling completed - no session found");
      return false; // No session found
    };

    const initAuth = async () => {
      console.log("🚀 Starting auth initialization...");
      
      try {
        // Step 1: Wait for iOS to inject session (with polling)
        const sessionFound = await waitForIOSSession();
        
        if (!sessionFound && isMounted) {
          // Step 2: Check for existing Supabase session as fallback
          console.log("🔄 Checking for existing Supabase session...");
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            console.log("✅ Found existing Supabase session");
            console.log("👤 User ID:", data.session.user?.id);
            setSession(data.session);
            setUser(data.session.user);
          } else {
            console.log("❌ No existing session found - user needs to login");
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
        // Always set loading to false at the end
        if (isMounted) {
          pollingActive = false;
          setLoading(false);
          console.log("✅ Auth initialization complete - ready for routing decisions");
        }
      }
    };

    // Set up auth state listener (but don't interfere with initial setup)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state change:", event, !!session);
      
      // Only update state after initial auth is complete (loading is false)
      if (!loading && isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
      } else {
        console.log("⏸️ Ignoring auth state change during initialization");
      }
    });

    initAuth();

    return () => {
      isMounted = false;
      pollingActive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};