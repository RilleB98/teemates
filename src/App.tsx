import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Profile } from "./pages/Profile";
import { Courses } from "./pages/Courses";
import { Friends } from "./pages/Friends";
import { SwipeMatch } from "./pages/SwipeMatch";
import { Messages } from "./pages/Messages";
import { Auth } from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import { PublicLanding } from "./pages/PublicLanding";
import { AuthProvider } from "./hooks/useAuth";

import { AdminGolf } from "./pages/AdminGolf";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminOnlyRoute } from "./components/AdminOnlyRoute";
import NotFound from "./pages/NotFound";
import WebViewGuard from "./components/WebViewGuard";
import BrowserGuard from "./components/BrowserGuard";
import { useNotificationProcessor } from "./hooks/useNotificationProcessor";
import { usePushNotifications } from "./hooks/usePushNotifications";

// Component to handle notifications
const NotificationHandler = () => {
  usePushNotifications(); // Initialize push notifications
  useNotificationProcessor(); // Process notification queue
  return null;
};

// Create QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('TeeMates: App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <NotificationHandler />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - always accessible */}
              <Route path="/" element={<PublicLanding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              
              {/* Protected app routes - only accessible via WebView/iOS app */}
              <Route path="/app" element={
                <BrowserGuard>
                  <WebViewGuard>
                    <ProtectedRoute>
                      <SwipeMatch />
                    </ProtectedRoute>
                  </WebViewGuard>
                </BrowserGuard>
              } />
              <Route path="/courses" element={
                <BrowserGuard>
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                </BrowserGuard>
              } />
              <Route path="/friends" element={
                <BrowserGuard>
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                </BrowserGuard>
              } />
              <Route path="/messages" element={
                <BrowserGuard>
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                </BrowserGuard>
              } />
              <Route path="/profile" element={
                <BrowserGuard>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </BrowserGuard>
              } />
              <Route path="/admin/golf" element={
                <BrowserGuard>
                  <AdminOnlyRoute>
                    <AdminGolf />
                  </AdminOnlyRoute>
                </BrowserGuard>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
