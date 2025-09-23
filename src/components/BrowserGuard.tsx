import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BrowserGuardProps {
  children: React.ReactNode;
}

const BrowserGuard = ({ children }: BrowserGuardProps) => {
  const [isWebViewOrApp, setIsWebViewOrApp] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const detectAppEnvironment = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = window.location.href;
      
      console.log('🔒 Browser Guard Check:');
      console.log('🔒 User Agent:', userAgent);
      console.log('🔒 Current URL:', currentUrl);
      console.log('🔒 Location pathname:', location.pathname);
      
      // Check for iOS device
      const isIOS = /iphone|ipod|ipad/.test(userAgent) && !(window as any).MSStream;
      
      // Check if running in Capacitor environment
      const isCapacitorApp = userAgent.includes('capacitor') || 
                            window.location.protocol === 'capacitor:' ||
                            (window as any).Capacitor !== undefined;
      
      // Check for WebView indicators
      const isWebView = userAgent.includes('wkwebview') ||
                       userAgent.includes('version/') && isIOS ||
                       !(window as any).chrome && isIOS;
      
      // Check URL parameters and domain
      const urlParams = new URLSearchParams(window.location.search);
      const hasForceHideBadge = urlParams.has('forceHideBadge');
      const isOurDomain = currentUrl.includes('teemates.app');
      
      // Allow access if it's iOS, Capacitor, WebView, has special parameter, or from our production domain
      const allowAccess = isIOS || isCapacitorApp || isWebView || hasForceHideBadge || isOurDomain;
      
      console.log('🔒 Detection Results:');
      console.log('🔒 Is iOS:', isIOS);
      console.log('🔒 Is Capacitor:', isCapacitorApp);
      console.log('🔒 Is WebView:', isWebView);
      console.log('🔒 Has ForceHideBadge:', hasForceHideBadge);
      console.log('🔒 Is Our Domain:', isOurDomain);
      console.log('🔒 Allow Access:', allowAccess);
      
      setIsWebViewOrApp(allowAccess);
      
      // If not allowed and not on root path, redirect to landing
      if (!allowAccess && location.pathname !== '/') {
        console.log('🔒 Redirecting browser user to landing page');
        navigate('/', { replace: true });
      }
    };

    detectAppEnvironment();
  }, [location.pathname, navigate]);

  if (isWebViewOrApp === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isWebViewOrApp) {
    // Block regular browsers from accessing app routes
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">📱 Endast i appen</CardTitle>
            <CardDescription>
              Denna sida är endast tillgänglig i TeeMates-appen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              För att komma åt alla funktioner behöver du ladda ner TeeMates-appen från App Store.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Tillbaka till startsidan
            </Button>
            <div className="text-xs text-muted-foreground">
              🍎 Ladda ner från App Store
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default BrowserGuard;