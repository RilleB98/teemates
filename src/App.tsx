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
import { AdminGolf } from "./pages/AdminGolf";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Create QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/app" element={
              <ProtectedRoute>
                <SwipeMatch />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin/golf" element={<AdminGolf />} />
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
