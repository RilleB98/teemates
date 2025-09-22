import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import teeMatesLogo from "@/assets/teemates-icon.png";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const handleOAuthCallback = async () => {
      console.log('🍎 AuthCallback: Processing OAuth callback...');
      
      try {
        // Check if tokens were already processed early in main.tsx
        const earlyAuthHandled = sessionStorage.getItem('early_auth_handled');
        if (earlyAuthHandled) {
          console.log('✅ AuthCallback: Early auth was handled, checking session...');
          sessionStorage.removeItem('early_auth_handled');
          
          // Verify we have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            console.log('✅ AuthCallback: Valid session found, redirecting to app');
            setStatus('success');
            setTimeout(() => navigate('/app', { replace: true }), 1000);
            return;
          }
        }

        // Try to get session from URL hash (standard OAuth flow)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthCallback: Error getting session:', error);
          if (isMounted) {
            setStatus('error');
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.session?.user && isMounted) {
          console.log('✅ AuthCallback: OAuth successful, redirecting to app');
          setStatus('success');
          // Small delay to show success state
          setTimeout(() => navigate('/app', { replace: true }), 1000);
        } else {
          console.log('⚠️ AuthCallback: No session found, redirecting to auth');
          if (isMounted) {
            setStatus('error');
            setErrorMessage('Ingen session hittades');
            setTimeout(() => navigate('/auth', { replace: true }), 2000);
          }
        }
      } catch (err) {
        console.error('❌ AuthCallback: Unexpected error:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Ett oväntat fel inträffade');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
        }
      }
    };

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Loggar in...';
      case 'success':
        return 'Inloggning lyckades!';
      case 'error':
        return 'Inloggning misslyckades';
      default:
        return 'Bearbetar...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-golf rounded-full flex items-center justify-center shadow-golf animate-float overflow-hidden">
              <img src={teeMatesLogo} alt="teeMates logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-golf-premium">TeeMates</h1>
          </div>
          <p className="text-muted-foreground">Välkommen tillbaka</p>
        </div>

        {/* Status Card */}
        <Card className="bg-card/95 backdrop-blur-sm border-golf-green-light shadow-golf">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              {status === 'processing' && (
                <Loader2 className="h-8 w-8 animate-spin text-golf-green" />
              )}
              
              {status === 'success' && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                </div>
              )}
              
              {status === 'error' && (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                </div>
              )}
              
              <div className="text-center">
                <p className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
                {errorMessage && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};