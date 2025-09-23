import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BrowserGuardProps {
  children: React.ReactNode;
}

const BrowserGuard = ({ children }: BrowserGuardProps) => {
  const [isWebViewOrApp, setIsWebViewOrApp] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔒 BrowserGuard: useEffect running');
    
    const detectAppEnvironment = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = window.location.href;
      
      console.log('🔒 Browser Guard Check:');
      console.log('🔒 User Agent:', userAgent);
      console.log('🔒 Current URL:', currentUrl);
      console.log('🔒 Location pathname:', location.pathname);
      
      // Check for desktop browsers explicitly
      const isDesktopSafari = userAgent.includes('safari') && !userAgent.includes('mobile') && userAgent.includes('mac');
      const isChrome = userAgent.includes('chrome') && !userAgent.includes('mobile');
      const isFirefox = userAgent.includes('firefox') && !userAgent.includes('mobile');
      const isDesktopBrowser = isDesktopSafari || isChrome || isFirefox;
      
      // Check for iOS device
      const isIOS = /iphone|ipod|ipad/.test(userAgent) && !(window as any).MSStream;
      
      // Check if running in Capacitor environment
      const isCapacitorApp = userAgent.includes('capacitor') || 
                            window.location.protocol === 'capacitor:' ||
                            (window as any).Capacitor !== undefined;
      
      // Check for WebView indicators
      const isWebView = userAgent.includes('wkwebview') ||
                       (userAgent.includes('version/') && isIOS) ||
                       (!(window as any).chrome && isIOS);
      
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasForceHideBadge = urlParams.has('forceHideBadge');
      
      // Check if we're in Lovable development environment
      const isLovableDev = currentUrl.includes('lovableproject.com');
      
      // Allow access for:
      // - iOS/WebView/Capacitor (mobile app users)
      // - Special URL parameter
      // - Lovable development environment (for editing)
      const allowAccess = !isDesktopBrowser && (isIOS || isCapacitorApp || isWebView || hasForceHideBadge) || isLovableDev;
      
      console.log('🔒 Detection Results:');
      console.log('🔒 Is Desktop Safari:', isDesktopSafari);
      console.log('🔒 Is Chrome:', isChrome);
      console.log('🔒 Is Firefox:', isFirefox);
      console.log('🔒 Is Desktop Browser:', isDesktopBrowser);
      console.log('🔒 Is iOS:', isIOS);
      console.log('🔒 Is Capacitor:', isCapacitorApp);
      console.log('🔒 Is WebView:', isWebView);
      console.log('🔒 Has ForceHideBadge:', hasForceHideBadge);
      console.log('🔒 Is Lovable Dev:', isLovableDev);
      console.log('🔒 Allow Access:', allowAccess);
      
      setIsWebViewOrApp(allowAccess);
    };

    detectAppEnvironment();
  }, []); // Empty dependency array to run only once

  console.log('🔒 BrowserGuard render state:', { isWebViewOrApp, pathname: location.pathname });

  if (isWebViewOrApp === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isWebViewOrApp) {
    // For desktop browsers, instead of showing the block page on protected routes,
    // immediately redirect to home to prevent infinite loops
    if (location.pathname !== '/') {
      console.log('🔒 Desktop browser detected on protected route, redirecting to home');
      window.location.replace('/');
      return null;
    }
    
    // Only show the block page when already on home page
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