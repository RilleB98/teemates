import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WebViewGuardProps {
  children: React.ReactNode;
}

const WebViewGuard = ({ children }: WebViewGuardProps) => {
  const [isWebView, setIsWebView] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebView = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for webview indicators
      const hasWebViewParam = urlParams.has('webview') || urlParams.has('forceHideBadge');
      const isCapacitorWebView = userAgent.includes('capacitor') || 
                                userAgent.includes('wkwebview') || 
                                userAgent.includes('ionic') ||
                                window.location.protocol === 'capacitor:';
      
      // Allow if it's a webview or has special parameters
      setIsWebView(hasWebViewParam || isCapacitorWebView);
    };

    checkWebView();
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