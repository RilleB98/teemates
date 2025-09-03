import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WebViewGuardProps {
  children: React.ReactNode;
}

const WebViewGuard = ({ children }: WebViewGuardProps) => {
  const [isWebView, setIsWebView] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = window.location.href;
      
      console.log('🔍 WebViewGuard Debug:');
      console.log('🔍 User Agent:', userAgent);
      console.log('🔍 Current URL:', currentUrl);
      console.log('🔍 Window width:', window.innerWidth);
      console.log('🔍 Screen width:', screen.width);
      
      // Check if device is iOS mobile (iPhone or iPod only, not iPad)
      const isIOS = (/iphone|ipod/.test(userAgent)) && !(window as any).MSStream;
      
      // Check if device is Android mobile (not tablet)
      const isAndroid = /android/.test(userAgent) && /mobile/.test(userAgent);
      
      // Check if running in Capacitor environment (our mobile app)
      const isCapacitorApp = userAgent.includes('capacitor') || 
                            window.location.protocol === 'capacitor:' ||
                            (window as any).Capacitor !== undefined;
      
      // Additional check: if URL has forceHideBadge, it might be our mobile app
      const urlParams = new URLSearchParams(window.location.search);
      const hasForceHideBadge = urlParams.has('forceHideBadge');
      
      const isMobileDevice = isIOS || isAndroid || isCapacitorApp || hasForceHideBadge;
      
      console.log('🔍 Mobile Detection Results:');
      console.log('🔍 Is iOS:', isIOS);
      console.log('🔍 Is Android:', isAndroid);
      console.log('🔍 Is Capacitor App:', isCapacitorApp);
      console.log('🔍 Has ForceHideBadge:', hasForceHideBadge);
      console.log('🔍 Final Is Mobile Device:', isMobileDevice);
      
      // Block all non-mobile access
      setIsWebView(isMobileDevice);
    };

    checkMobileDevice();
  }, []);

  if (isWebView === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isWebView) {
    // Block regular browsers
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Åtkomst Nekad</CardTitle>
            <CardDescription>
              Denna applikation är endast tillgänglig via mobilappen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              För att använda TeeMates, ladda ner mobilappen från App Store eller Google Play.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-xs text-muted-foreground">
                📱 Endast mobil åtkomst
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default WebViewGuard;