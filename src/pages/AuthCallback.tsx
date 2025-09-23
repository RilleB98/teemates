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
      console.log('🔗 AuthCallback: Current URL:', window.location.href);
      
      try {
        // Check if tokens were already processed early in main.tsx
        const earlyAuthHandled = sessionStorage.getItem('early_auth_handled');
        if (earlyAuthHandled) {
          console.log('✅ AuthCallback: Early auth was handled, checking session...');
          sessionStorage.removeItem('early_auth_handled');
          
          // Verify we have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            console.log('✅ AuthCallback: Valid session found, redirecting to welcome');
            setStatus('success');
            setTimeout(() => navigate('/welcome', { replace: true }), 500);
            return;
          }
        }

        // Handle both custom scheme and HTTPS callback URLs, and URL params from WebAuthPlugin
        const currentUrl = window.location.href;
        console.log('🔍 AuthCallback: Full URL:', currentUrl);
        
        let hash = '';
        let params = new URLSearchParams();
        
        // First check if URL is passed as a query parameter (from WebAuthPlugin)
        const urlSearchParams = new URLSearchParams(window.location.search);
        const passedUrl = urlSearchParams.get('url');
        
        // Check for direct query parameters (Swift fallback case)
        const directAccessToken = urlSearchParams.get('access_token');
        const directRefreshToken = urlSearchParams.get('refresh_token');
        const fallbackMode = urlSearchParams.get('fallback');
        
        if (directAccessToken && fallbackMode === 'swift_error') {
          console.log('🍎 AuthCallback: Processing Swift fallback tokens from query params');
          console.log('🎫 AuthCallback: Found direct tokens:', { 
            hasAccessToken: !!directAccessToken, 
            hasRefreshToken: !!directRefreshToken,
            tokenPreview: directAccessToken.substring(0, 20) + '...'
          });
          
          console.log('🔑 AuthCallback: Setting session with Swift fallback tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: directAccessToken,
            refresh_token: directRefreshToken || ''
          });

          // Clean up URL
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          if (error) {
            console.error('❌ AuthCallback: Error setting session with Swift fallback tokens:', error);
            if (isMounted) {
              setStatus('error');
              setErrorMessage(error.message);
            }
            return;
          }

          if (data.session?.user && isMounted) {
            console.log('✅ AuthCallback: Swift fallback session set successfully, redirecting to welcome');
            setStatus('success');
            setTimeout(() => navigate('/welcome', { replace: true }), 500);
            return;
          }
        }
        
        if (passedUrl) {
          console.log('🔗 AuthCallback: Processing URL from parameter:', passedUrl);
          const decodedUrl = decodeURIComponent(passedUrl);
          console.log('🔗 AuthCallback: Decoded URL:', decodedUrl);
          
          try {
            // Handle both custom scheme and HTTPS URLs from WebAuthPlugin
            if (decodedUrl.startsWith('https://')) {
              const url = new URL(decodedUrl);
              // For HTTPS URLs, tokens are typically in the fragment
              if (url.hash) {
                hash = url.hash.substring(1);
                params = new URLSearchParams(hash);
              } else if (url.search) {
                params = new URLSearchParams(url.search);
              }
            } else if (decodedUrl.startsWith('teemates://')) {
              // Handle custom scheme URLs
              const url = new URL(decodedUrl);
              if (url.hash) {
                hash = url.hash.substring(1);
                params = new URLSearchParams(hash);
              } else if (url.search) {
                params = new URLSearchParams(url.search);
              }
            } else {
              // Fallback: try to extract tokens directly from the string
              const hashIndex = decodedUrl.indexOf('#');
              const queryIndex = decodedUrl.indexOf('?');
              
              if (hashIndex !== -1) {
                hash = decodedUrl.substring(hashIndex + 1);
                params = new URLSearchParams(hash);
              } else if (queryIndex !== -1) {
                params = new URLSearchParams(decodedUrl.substring(queryIndex + 1));
              }
            }
          } catch (urlError) {
            console.error('❌ Failed to parse passed URL:', urlError);
            console.log('🔄 Attempting manual token extraction from:', decodedUrl);
            // Manual token extraction as fallback
            const accessTokenMatch = decodedUrl.match(/access_token=([^&]+)/);
            const refreshTokenMatch = decodedUrl.match(/refresh_token=([^&]+)/);
            if (accessTokenMatch) {
              params.set('access_token', accessTokenMatch[1]);
              if (refreshTokenMatch) {
                params.set('refresh_token', refreshTokenMatch[1]);
              }
            }
          }
        }
        // Check if this is a custom scheme URL (teemates://auth-callback)
        else if (currentUrl.startsWith('teemates://')) {
          console.log('📱 AuthCallback: Processing custom scheme URL');
          const url = new URL(currentUrl);
          // For custom schemes, tokens might be in search params or hash
          if (url.hash) {
            hash = url.hash.substring(1);
            params = new URLSearchParams(hash);
          } else if (url.search) {
            params = new URLSearchParams(url.search);
          }
        } else {
          // Standard HTTPS callback
          console.log('🌐 AuthCallback: Processing HTTPS callback');
          const url = new URL(currentUrl);
          hash = url.hash.substring(1);
          params = new URLSearchParams(hash);
        }
        
        console.log('🔍 AuthCallback: Extracted hash/params:', hash || params.toString());
        
        // Extract tokens from params (works for both custom scheme and HTTPS)
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        console.log('🎫 AuthCallback: Found tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
        });
        
        if (accessToken) {
          console.log('🔑 AuthCallback: Setting session with extracted tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          // Clean up URL
          if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          if (error) {
            console.error('❌ AuthCallback: Error setting session with tokens:', error);
            if (isMounted) {
              setStatus('error');
              setErrorMessage(error.message);
            }
            return;
          }

        if (data.session?.user && isMounted) {
          console.log('✅ AuthCallback: Session set successfully, redirecting to welcome');
          setStatus('success');
          setTimeout(() => navigate('/welcome', { replace: true }), 500);
          return;
        }
        }

        // Fallback: Try to get session from Supabase (standard OAuth flow)
        console.log('🔄 AuthCallback: Fallback to getSession...');
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
            console.log('✅ AuthCallback: OAuth successful via fallback, redirecting to welcome');
            setStatus('success');
            setTimeout(() => navigate('/welcome', { replace: true }), 500);
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