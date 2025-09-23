import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Show welcome message for 3 seconds, then check auth and navigate
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      
      // Give a bit more time for auth to settle, then navigate
      setTimeout(() => {
        if (user) {
          navigate('/app', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      }, 500);
    }, 3000);

    return () => clearTimeout(welcomeTimer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <img 
            src="/public/lovable-uploads/e94c05df-8c2c-4ed3-8d8e-f8eb3450f6ae.png" 
            alt="TeeMates Logo" 
            className="w-20 h-20 mx-auto mb-4 animate-pulse"
          />
        </div>
        
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-golf-premium mb-4">
            Välkommen till TeeMates!
          </h1>
          
          <p className="text-golf-text-light mb-8 text-lg">
            Vi förbereder din golfupplevelse...
          </p>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-gradient-golf rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gradient-golf rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-gradient-golf rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {!showWelcome && (
          <div className="animate-fade-in">
            <div className="w-16 h-16 bg-gradient-golf rounded-full flex items-center justify-center mx-auto animate-spin">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};