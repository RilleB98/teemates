import SwiftUI
import WebKit
import AuthenticationServices

struct ContentView: UIViewRepresentable {

    let webView = WKWebView()

    func makeUIView(context: Context) -> WKWebView {
        webView.navigationDelegate = context.coordinator
        webView.configuration.preferences.javaScriptEnabled = true
        
        // Add JavaScript message handler for Apple OAuth
        webView.configuration.userContentController.add(context.coordinator, name: "appleOAuth")

        // Lyssna på OAuth callback från AppDelegate
        NotificationCenter.default.addObserver(forName: .didReceiveOAuthCallbackURL,
                                               object: nil,
                                               queue: .main) { note in
            guard let url = note.object as? URL else { 
                print("❌ [Auth] Invalid callback URL")
                return 
            }

            print("✅ [Auth] Received callback URL: \(url)")
            
            var accessToken = ""
            var refreshToken = ""
            
            // Handle both fragment (#) and query (?) parameters
            if let fragment = url.fragment, !fragment.isEmpty {
                print("🔍 [Auth] Processing fragment: \(fragment)")
                fragment.split(separator: "&").forEach { pair in
                    let parts = pair.split(separator: "=", maxSplits: 1).map(String.init)
                    if parts.count == 2 {
                        switch parts[0] {
                        case "access_token": accessToken = parts[1]
                        case "refresh_token": refreshToken = parts[1]
                        default: break
                        }
                    }
                }
            } else if let query = url.query, !query.isEmpty {
                print("🔍 [Auth] Processing query: \(query)")
                query.split(separator: "&").forEach { pair in
                    let parts = pair.split(separator: "=", maxSplits: 1).map(String.init)
                    if parts.count == 2 {
                        switch parts[0] {
                        case "access_token": accessToken = parts[1]
                        case "refresh_token": refreshToken = parts[1]
                        default: break
                        }
                    }
                }
            }
            
            guard !accessToken.isEmpty else {
                print("❌ [Auth] No access token found in callback")
                DispatchQueue.main.async {
                    webView.load(URLRequest(url: URL(string: "https://teemates.app/auth")!))
                }
                return
            }
            
            print("✅ [Auth] Found tokens - access: \(accessToken.prefix(20))..., refresh: \(!refreshToken.isEmpty)")

            // Enhanced JavaScript injection with better debugging and fallback
            let injectTokensWithRetry = {
                print("🔄 [Auth] Starting token injection process")
                
                // First check current WebView URL
                webView.evaluateJavaScript("window.location.href") { result, error in
                    if let currentURL = result as? String {
                        print("📍 [WebView] Current URL: \(currentURL)")
                    }
                }
                
                let js = """
                (async () => {
                  try {
                    console.log('🍎 [iOS] Starting session setup...');
                    console.log('🌐 [iOS] Current URL:', window.location.href);
                    
                    // Store tokens in sessionStorage as backup
                    sessionStorage.setItem('ios_access_token', '\(accessToken)');
                    sessionStorage.setItem('ios_refresh_token', '\(refreshToken)');
                    console.log('💾 [iOS] Tokens stored in sessionStorage');
                    
                    // Wait for Supabase to be available with more detailed logging
                    let retries = 0;
                    while (!window.supabase && retries < 100) {
                      if (retries % 10 === 0) {
                        console.log(\`⏳ [iOS] Waiting for Supabase... attempt \${retries}\`);
                      }
                      await new Promise(resolve => setTimeout(resolve, 100));
                      retries++;
                    }
                    
                    if (!window.supabase) {
                      console.error('❌ [iOS] Supabase not available after 10 seconds');
                      console.log('🔄 [iOS] Redirecting to auth-callback fallback');
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=js_timeout';
                      return;
                    }
                    
                    console.log('✅ [iOS] Supabase client found, setting session...');
                    const { data, error } = await window.supabase.auth.setSession({
                      access_token: "\(accessToken)",
                      refresh_token: "\(refreshToken)"
                    });
                    
                    if (error) {
                      console.error('❌ [iOS] setSession error:', error);
                      console.log('🔄 [iOS] Redirecting to auth-callback fallback');
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=session_error';
                    } else {
                      console.log('✅ [iOS] Session established successfully');
                      console.log('🎯 [iOS] Session data:', data);
                      // Clean up sessionStorage
                      sessionStorage.removeItem('ios_access_token');
                      sessionStorage.removeItem('ios_refresh_token');
                      console.log('🏠 [iOS] Redirecting to /app');
                      window.location.href = '/app';
                    }
                  } catch (err) {
                    console.error('❌ [iOS] Session setup error:', err);
                    console.log('🔄 [iOS] Redirecting to auth-callback fallback');
                    window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=js_error';
                  }
                })();
                """
                
                webView.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("❌ [WebView] JavaScript execution failed: \(error)")
                        print("🔄 [Auth] Using Swift fallback navigation")
                        // Immediate fallback to auth-callback page
                        DispatchQueue.main.async {
                            let fallbackURL = "https://teemates.app/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)&fallback=swift_error"
                            print("🌐 [Auth] Loading fallback URL: \(fallbackURL)")
                            webView.load(URLRequest(url: URL(string: fallbackURL)!))
                        }
                    } else {
                        print("✅ [Auth] JavaScript injection completed successfully")
                    }
                }
            }
            
            // Check if WebView is ready and on correct domain before injecting
            let checkWebViewReady = {
                webView.evaluateJavaScript("document.readyState") { result, error in
                    if let readyState = result as? String {
                        print("📄 [WebView] Document ready state: \(readyState)")
                        
                        if readyState == "complete" || readyState == "interactive" {
                            print("✅ [WebView] Page ready, injecting tokens")
                            injectTokensWithRetry()
                        } else {
                            print("⏳ [WebView] Page not ready, waiting...")
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                checkWebViewReady()
                            }
                        }
                    } else {
                        print("⚠️ [WebView] Could not get ready state, proceeding anyway")
                        injectTokensWithRetry()
                    }
                }
            }
            
            // Start checking after a brief delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                print("🚀 [Auth] Starting WebView readiness check")
                checkWebViewReady()
            }
        }

        // Ladda start-URL - ändrat till /auth istället för /app
        if let url = URL(string: "https://teemates.app/auth") {
            print("🌍 [WebView] Laddar start-URL: \(url)")
            webView.load(URLRequest(url: url))
        }

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, WKNavigationDelegate, ASWebAuthenticationPresentationContextProviding, WKScriptMessageHandler {

        private var authSession: ASWebAuthenticationSession?
        
        // Handle JavaScript messages from React
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "appleOAuth" {
                guard let body = message.body as? [String: Any],
                      let urlString = body["url"] as? String,
                      let oauthURL = URL(string: urlString) else {
                    print("❌ [OAuth] Invalid message from React")
                    return
                }
                
                print("🍎 [OAuth] Starting Apple OAuth with URL: \(urlString)")
                startAppleOAuth(url: oauthURL)
            }
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            // Allow all navigation
            decisionHandler(.allow)
        }

        private func startAppleOAuth(url: URL) {
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: "teemates"
            ) { callbackURL, error in
                if let error = error {
                    print("❌ [OAuth] ASWebAuthenticationSession error: \(error)")
                    return
                }
                
                if let callbackURL = callbackURL {
                    print("✅ [OAuth] Callback received: \(callbackURL)")
                    // Tokens will be handled via Universal Links → NotificationCenter → ContentView
                }
            }

            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = true
            self.authSession = session
            
            DispatchQueue.main.async {
                _ = session.start()
            }
        }

        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow } ?? UIWindow()
        }
    }
}
