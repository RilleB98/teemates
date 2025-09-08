import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WebViewGuardProps {
  children: React.ReactNode;
}

const WebViewGuard = ({ children }: WebViewGuardProps) => {
  const [isWebView, setIsWebView] = useState<boolean | null>(null);

  useEffect(() => {
    const checkiOSDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = window.location.href;
      
      console.log('🍎 iOS WebView Check:');
      console.log('🍎 User Agent:', userAgent);
      console.log('🍎 Current URL:', currentUrl);
      
      // Check for iOS device (iPhone, iPod, iPad)
      const isIOS = /iphone|ipod|ipad/.test(userAgent) && !(window as any).MSStream;
      
      // Check if running in Capacitor environment
      const isCapacitorApp = userAgent.includes('capacitor') || 
                            window.location.protocol === 'capacitor:' ||
                            (window as any).Capacitor !== undefined;
      
      // Check for our specific app domain or forceHideBadge parameter
      const urlParams = new URLSearchParams(window.location.search);
      const hasForceHideBadge = urlParams.has('forceHideBadge');
      const isOurDomain = currentUrl.includes('teemates.app');
      
      // For iOS-only app: Allow iOS devices, Capacitor app, or our domain
      const isiOSApp = isIOS || isCapacitorApp || hasForceHideBadge || isOurDomain;
      
      console.log('🍎 iOS Detection Results:');
      console.log('🍎 Is iOS Device:', isIOS);
      console.log('🍎 Is Capacitor App:', isCapacitorApp);
      console.log('🍎 Has ForceHideBadge:', hasForceHideBadge);
      console.log('🍎 Is Our Domain:', isOurDomain);
      console.log('🍎 Final iOS App Access:', isiOSApp);
      
      setIsWebView(isiOSApp);
    };

    checkiOSDevice();
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
            <CardTitle className="text-2xl">🍎 Endast iOS</CardTitle>
            <CardDescription>
              TeeMates är optimerad för iOS-enheter.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Denna app är endast tillgänglig för iPhone och iPad. Ladda ner appen från App Store.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-xs text-muted-foreground">
                🍎 iOS App Store
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