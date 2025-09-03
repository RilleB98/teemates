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
      
      console.log('WebViewGuard Debug:');
      console.log('User Agent:', userAgent);
      console.log('Current URL:', currentUrl);
      
      // Check if device is iOS mobile
      const isIOS = /iphone|ipod/.test(userAgent) && !(window as any).MSStream;
      
      // Check if device is Android mobile
      const isAndroid = /android/.test(userAgent) && /mobile/.test(userAgent);
      
      // Check if running in Capacitor environment (our mobile app)
      const isCapacitorApp = userAgent.includes('capacitor') || 
                            window.location.protocol === 'capacitor:' ||
                            (window as any).Capacitor !== undefined;
      
      const isMobileDevice = isIOS || isAndroid || isCapacitorApp;
      
      console.log('Mobile Detection Results:');
      console.log('Is iOS:', isIOS);
      console.log('Is Android:', isAndroid);
      console.log('Is Capacitor App:', isCapacitorApp);
      console.log('Is Mobile Device:', isMobileDevice);
      
      // Allow only if it's a mobile device (iOS or Android)
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