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
import { Landing } from "./pages/Landing";
import { AuthProvider } from "./hooks/useAuth";
import { AdminGolf } from "./pages/AdminGolf";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
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
