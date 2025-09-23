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

                // Anropa Supabase JS SDK i webview för att etablera sessionen korrekt
                let js = """
                (async () => {
                  const { data, error } = await window.supabase.auth.setSession({
                    access_token: "\(accessToken)",
                    refresh_token: "\(refreshToken)"
                  });
                  if (error) {
                    console.error('[Auth] setSession error:', error);
                  } else {
                    console.log('[Auth] setSession success:', data);
                    window.location.href = '/app';
                  }
                })();
                """

                webView.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("❌ [WebView] JS error: \(error)")
                    } else {
                        print("✅ [Auth] setSession körd i webview")
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
