import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client'

console.log('TeeMates: main.tsx loaded');
console.log('TeeMates: DOM ready state:', document.readyState);

// Early token processing for iOS OAuth callbacks BEFORE React initialization
const processEarlyTokens = async () => {
  // First check for iOS fallback tokens in sessionStorage
  const storedAccessToken = sessionStorage.getItem('access_token');
  const storedRefreshToken = sessionStorage.getItem('refresh_token');
  
  if (storedAccessToken) {
    console.log('🍎 EARLY: Found iOS fallback tokens in sessionStorage');
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: storedAccessToken,
        refresh_token: storedRefreshToken || ''
      });
      
      if (data.session) {
        console.log('✅ EARLY: Session established from iOS fallback tokens');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.setItem('early_auth_handled', 'true');
        return; // Exit early since we handled auth
      } else if (error) {
        console.error('❌ EARLY: Error setting session from iOS fallback:', error);
      }
    } catch (error) {
      console.error('❌ EARLY: Exception setting session from iOS fallback:', error);
    }
    
    // Clean up tokens even if session failed
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  // Then check URL hash for OAuth tokens
  const hash = window.location.hash;
  console.log('🚀 EARLY: Checking for OAuth tokens in URL:', hash);
  
  if (hash.includes('access_token=')) {
    console.log('✅ EARLY: Found access_token in URL fragment');
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken) {
      console.log('🔥 EARLY: Setting session immediately via setSession');
      try {
        // Use setSession directly instead of storing tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
        
        if (data.session) {
          console.log('✅ EARLY: Session established successfully via setSession!');
          console.log('✅ EARLY: User ID:', data.session.user?.id);
          
          // Clean URL immediately after successful session
          window.history.replaceState({}, document.title, window.location.pathname);
          console.log('🧹 EARLY: URL cleaned after successful session');
          
          // Set flag that we handled auth early
          sessionStorage.setItem('early_auth_handled', 'true');
        } else if (error) {
          console.error('❌ EARLY: Error setting session:', error);
          // Store tokens as fallback for useAuth
          sessionStorage.setItem('early_auth_tokens', JSON.stringify({
            accessToken,
            refreshToken
          }));
        }
      } catch (error) {
        console.error('❌ EARLY: Exception setting session:', error);
        // Store tokens as fallback for useAuth
        sessionStorage.setItem('early_auth_tokens', JSON.stringify({
          accessToken,
          refreshToken
        }));
      }
    }
  }
};

// Process tokens before React initialization (wrapped in async IIFE)
(async () => {
  await processEarlyTokens();

  const rootElement = document.getElementById("root");
  console.log('TeeMates: Root element found:', !!rootElement);

  if (rootElement) {
    console.log('TeeMates: Creating React root');
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } else {
    console.error('TeeMates: Root element not found!');
  }
})();

