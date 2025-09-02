import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('TeeMates: main.tsx loaded');
console.log('TeeMates: DOM ready state:', document.readyState);

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
