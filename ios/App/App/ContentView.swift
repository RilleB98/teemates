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
            guard let url = note.object as? URL,
                  let fragment = url.fragment else { return }

            var accessToken = ""
            var refreshToken = ""

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

            // Injicera session i webview
            let js = """
            (async () => {
              try {
                console.log('🍎 [iOS] Setting session with tokens');
                const { data, error } = await window.supabase.auth.setSession({
                  access_token: "\(accessToken)",
                  refresh_token: "\(refreshToken)"
                });
                if (error) {
                  console.error('❌ [iOS] setSession error:', error);
                } else {
                  console.log('✅ [iOS] setSession success, redirecting to app');
                  window.location.href = '/app';
                }
              } catch (err) {
                console.error('❌ [iOS] Session setup error:', err);
              }
            })();
            """
            webView.evaluateJavaScript(js) { result, error in
                if let error = error {
                    print("❌ [WebView] JS error: \(error)")
                } else {
                    print("✅ [Auth] Session tokens injected successfully")
                }
            }
        }

        // Ladda start-URL
        if let url = URL(string: "https://teemates.app/app") {
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
