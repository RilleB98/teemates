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
import { PublicLanding } from "./pages/PublicLanding";
import { AuthProvider } from "./hooks/useAuth";
import { SubscriptionProvider } from "./hooks/useSubscription";
import { AdminGolf } from "./pages/AdminGolf";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminOnlyRoute } from "./components/AdminOnlyRoute";
import NotFound from "./pages/NotFound";
import WebViewGuard from "./components/WebViewGuard";
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
        <SubscriptionProvider>
          <NotificationHandler />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicLanding />} />
              <Route path="/app" element={
                <WebViewGuard>
                  <AdminOnlyRoute>
                    <SwipeMatch />
                  </AdminOnlyRoute>
                </WebViewGuard>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="/friends" element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/admin/golf" element={
                <ProtectedRoute>
                  <AdminGolf />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
