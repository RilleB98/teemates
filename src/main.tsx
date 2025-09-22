import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client'

console.log('TeeMates: main.tsx loaded');
console.log('TeeMates: DOM ready state:', document.readyState);

// Early token processing for iOS OAuth callbacks BEFORE React initialization
const processEarlyTokens = () => {
  const hash = window.location.hash;
  console.log('🚀 EARLY: Checking for OAuth tokens in URL:', hash);
  
  if (hash.includes('access_token=')) {
    console.log('✅ EARLY: Found access_token in URL fragment');
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    
    if (accessToken) {
      console.log('🔥 EARLY: Setting session immediately before React init');
      // Store tokens for useAuth to pick up
      sessionStorage.setItem('early_auth_tokens', JSON.stringify({
        accessToken,
        refreshToken
      }));
      
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('🧹 EARLY: URL cleaned');
    }
  }
};

// Process tokens before React initialization
processEarlyTokens();

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
