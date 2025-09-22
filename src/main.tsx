import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client'

console.log('TeeMates: main.tsx loaded');
console.log('TeeMates: DOM ready state:', document.readyState);

// Simplified early processing - only check for early auth flag
const processEarlyTokens = async () => {
  // Only check if auth was handled early and clean up
  const earlyAuthHandled = sessionStorage.getItem('early_auth_handled');
  if (earlyAuthHandled) {
    console.log('🍎 EARLY: Auth was handled early, cleaning up flag');
    sessionStorage.removeItem('early_auth_handled');
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

