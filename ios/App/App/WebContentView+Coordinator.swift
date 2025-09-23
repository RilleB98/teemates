import Foundation
import WebKit
import SwiftUI

class WebContentCoordinator: NSObject, WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        if let url = navigationAction.request.url, url.absoluteString.contains("#access_token=") {
            print("📥 [WebView] Fångade Supabase redirect: \(url)")

            // Plocka ut tokens ur fragmentet
            if let fragment = url.fragment {
                var accessToken = ""
                var refreshToken = ""

                fragment
                    .components(separatedBy: "&")
                    .forEach { param in
                        let parts = param.components(separatedBy: "=")
                        if parts.count == 2 {
                            let key = parts[0]
                            let value = parts[1]
                            switch key {
                            case "access_token": accessToken = value
                            case "refresh_token": refreshToken = value
                            default: break
                            }
                        }
                    }

                // Enhanced Supabase session setup with better error handling
                let js = """
                (async () => {
                  try {
                    console.log('🔧 [Coordinator] Setting up session with tokens');
                    
                    // Wait for Supabase to be available
                    let retries = 0;
                    while (!window.supabase && retries < 50) {
                      await new Promise(resolve => setTimeout(resolve, 100));
                      retries++;
                    }
                    
                    if (!window.supabase) {
                      console.error('❌ [Coordinator] Supabase not available, using fallback');
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=coordinator_timeout';
                      return;
                    }
                    
                    const { data, error } = await window.supabase.auth.setSession({
                      access_token: "\(accessToken)",
                      refresh_token: "\(refreshToken)"
                    });
                    
                    if (error) {
                      console.error('❌ [Coordinator] setSession error:', error);
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=coordinator_error';
                    } else {
                      console.log('✅ [Coordinator] setSession success:', data);
                      window.location.href = '/app';
                    }
                  } catch (err) {
                    console.error('❌ [Coordinator] Session setup error:', err);
                    window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=coordinator_exception';
                  }
                })();
                """

                webView.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("❌ [WebView] Coordinator JS error: \(error)")
                        // Navigate to fallback URL if JavaScript fails
                        DispatchQueue.main.async {
                            let fallbackURL = "teemates://auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=coordinator_js_error"
                            if let url = URL(string: fallbackURL) {
                                webView.load(URLRequest(url: url))
                            }
                        }
                    } else {
                        print("✅ [Auth] Coordinator setSession executed successfully")
                    }
                }

                decisionHandler(.cancel)
                return
            }
        }

        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("⏳ [WebView] Började ladda...")
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if let url = webView.url {
            print("✅ [WebView] Klar med laddning: \(url.absoluteString)")
        }
    }
}
