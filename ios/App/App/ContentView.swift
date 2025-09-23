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

            // Improved JavaScript injection with retry logic
            let injectTokens = {
                let js = """
                (async () => {
                  try {
                    // Wait for Supabase to be available
                    let retries = 0;
                    while (!window.supabase && retries < 50) {
                      await new Promise(resolve => setTimeout(resolve, 100));
                      retries++;
                    }
                    
                    if (!window.supabase) {
                      console.error('❌ [iOS] Supabase not available after waiting');
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)';
                      return;
                    }
                    
                    console.log('🍎 [iOS] Setting session with tokens');
                    const { data, error } = await window.supabase.auth.setSession({
                      access_token: "\(accessToken)",
                      refresh_token: "\(refreshToken)"
                    });
                    
                    if (error) {
                      console.error('❌ [iOS] setSession error:', error);
                      window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)';
                    } else {
                      console.log('✅ [iOS] setSession success, redirecting to app');
                      window.location.href = '/app';
                    }
                  } catch (err) {
                    console.error('❌ [iOS] Session setup error:', err);
                    window.location.href = '/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)';
                  }
                })();
                """
                
                webView.evaluateJavaScript(js) { result, error in
                    if let error = error {
                        print("❌ [WebView] JS error: \(error)")
                        // Fallback to auth-callback page
                        DispatchQueue.main.async {
                            let fallbackURL = "https://teemates.app/auth-callback?access_token=\(accessToken)&refresh_token=\(refreshToken)"
                            webView.load(URLRequest(url: URL(string: fallbackURL)!))
                        }
                    } else {
                        print("✅ [Auth] Session tokens injected successfully")
                    }
                }
            }
            
            // Wait a bit for the page to load before injecting
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                injectTokens()
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
