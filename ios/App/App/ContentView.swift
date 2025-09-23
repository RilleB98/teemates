import SwiftUI
import WebKit
import AuthenticationServices

extension Notification.Name {
    static let didReceiveOAuthCallbackURL = Notification.Name("didReceiveOAuthCallbackURL")
}

struct ContentView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        let coordinator = context.coordinator
        
        webView.navigationDelegate = coordinator
        webView.configuration.userContentController.add(coordinator, name: "appleOAuth")
        
        // Set up observer for OAuth callback
        NotificationCenter.default.addObserver(
            coordinator,
            selector: #selector(Coordinator.handleOAuthCallback(_:)),
            name: .didReceiveOAuthCallbackURL,
            object: nil
        )
        
        coordinator.webView = webView
        
        if let url = URL(string: "https://teemates.app/auth") {
            webView.load(URLRequest(url: url))
        }
        
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, WKNavigationDelegate, ASWebAuthenticationPresentationContextProviding, WKScriptMessageHandler {
        weak var webView: WKWebView?
        
        deinit {
            NotificationCenter.default.removeObserver(self)
        }
        
        @objc func handleOAuthCallback(_ notification: Notification) {
            guard let userInfo = notification.userInfo,
                  let url = userInfo["url"] as? URL else {
                print("🍎 OAUTH: Invalid callback notification")
                return
            }
            
            print("🍎 OAUTH: Processing callback URL: \(url)")
            
            func checkWebViewReady(attempt: Int = 0) {
                guard let webView = self.webView else {
                    print("🍎 OAUTH: WebView not available")
                    return
                }
                
                let maxAttempts = 10
                if attempt >= maxAttempts {
                    print("🍎 OAUTH: Max attempts reached, giving up")
                    return
                }
                
                let testScript = "typeof window !== 'undefined' && typeof window.supabase !== 'undefined'"
                webView.evaluateJavaScript(testScript) { result, error in
                    if let result = result as? Bool, result {
                        print("🍎 OAUTH: WebView ready, processing tokens")
                        self.processTokens(from: url, webView: webView)
                    } else {
                        print("🍎 OAUTH: WebView not ready, retry \(attempt + 1)/\(maxAttempts)")
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                            checkWebViewReady(attempt: attempt + 1)
                        }
                    }
                }
            }
            
            checkWebViewReady()
        }
        
        private func processTokens(from url: URL, webView: WKWebView) {
            let urlString = url.absoluteString
            
            guard let accessTokenRange = urlString.range(of: "access_token=") else {
                print("🍎 OAUTH: No access token found")
                return
            }
            
            let accessTokenStart = accessTokenRange.upperBound
            let accessTokenEnd = urlString[accessTokenStart...].firstIndex(of: "&") ?? urlString.endIndex
            let accessToken = String(urlString[accessTokenStart..<accessTokenEnd])
            
            let refreshTokenRange = urlString.range(of: "refresh_token=")
            let refreshToken: String
            
            if let refreshRange = refreshTokenRange {
                let refreshTokenStart = refreshRange.upperBound
                let refreshTokenEnd = urlString[refreshTokenStart...].firstIndex(of: "&") ?? urlString.endIndex
                refreshToken = String(urlString[refreshTokenStart..<refreshTokenEnd])
            } else {
                refreshToken = ""
                print("🍎 OAUTH: No refresh token found")
            }
            
            print("🍎 OAUTH: Extracted tokens - access: \(accessToken.prefix(20))..., refresh: \(refreshToken.prefix(20))...")
            
            let jsCode = """
                (function() {
                    console.log('🍎 JS: Setting Supabase session with native tokens');
                    
                    if (typeof window.supabase === 'undefined') {
                        console.error('🍎 JS: Supabase not available');
                        return;
                    }
                    
                    const session = {
                        access_token: '\(accessToken)',
                        refresh_token: '\(refreshToken)',
                        expires_in: 3600,
                        token_type: 'bearer',
                        user: null
                    };
                    
                    window.supabase.auth.setSession(session)
                        .then(function(result) {
                            console.log('🍎 JS: Session set successfully', result);
                            sessionStorage.setItem('early_auth_handled', 'true');
                            
                            if (window.location.pathname === '/auth') {
                                console.log('🍎 JS: Redirecting from auth page');
                                window.location.href = '/';
                            }
                        })
                        .catch(function(error) {
                            console.error('🍎 JS: Failed to set session', error);
                            window.location.href = '/auth?error=session_failed';
                        });
                })();
            """
            
            webView.evaluateJavaScript(jsCode) { result, error in
                if let error = error {
                    print("🍎 OAUTH: JavaScript error: \(error)")
                } else {
                    print("🍎 OAUTH: Successfully injected session")
                }
            }
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "appleOAuth" {
                print("🍎 OAUTH: Received Apple OAuth request from web")
                startAppleOAuth()
            }
        }
        
        private func startAppleOAuth() {
            guard let url = URL(string: "https://fzhmvraztypgemyrguxw.supabase.co/auth/v1/authorize?provider=apple") else {
                print("🍎 OAUTH: Invalid Supabase Apple OAuth URL")
                return
            }
            
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "com.teemates.app") { callbackURL, error in
                if let error = error {
                    print("🍎 OAUTH: Apple OAuth error: \(error)")
                    return
                }
                
                guard let callbackURL = callbackURL else {
                    print("🍎 OAUTH: No callback URL received")
                    return
                }
                
                print("🍎 OAUTH: Apple OAuth success, posting notification")
                NotificationCenter.default.post(
                    name: .didReceiveOAuthCallbackURL,
                    object: nil,
                    userInfo: ["url": callbackURL]
                )
            }
            
            session.presentationContextProvider = self
            session.start()
        }
        
        func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
            if #available(iOS 15.0, *) {
                return ASPresentationAnchor()
            } else {
                return UIApplication.shared.windows.first ?? ASPresentationAnchor()
            }
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(WKNavigationActionPolicy.allow)
        }
        
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            print("🌐 WebView started loading: \(webView.url?.absoluteString ?? "unknown")")
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("🌐 WebView finished loading: \(webView.url?.absoluteString ?? "unknown")")
        }
    }
}
