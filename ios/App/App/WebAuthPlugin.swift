import Foundation
import Capacitor
import AuthenticationServices

@objc(WebAuthPlugin)
public class WebAuthPlugin: CAPPlugin, ASWebAuthenticationPresentationContextProviding {
    
    @objc func startWebAuth(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            print("❌ WebAuthPlugin: Invalid URL provided")
            call.reject("Invalid URL")
            return
        }
        
        print("🍎 WebAuthPlugin: Starting auth session")
        print("🍎 WebAuthPlugin: OAuth URL: \(urlString)")
        print("🍎 WebAuthPlugin: Expected callback scheme: teemates://")
        
        let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "teemates") { callbackURL, error in
            if let error = error {
                let errorCode = (error as NSError).code
                print("❌ WebAuthPlugin: Auth session error code: \(errorCode)")
                print("❌ WebAuthPlugin: Auth session error: \(error.localizedDescription)")
                
                // Check for user cancellation (error code 1)
                if errorCode == 1 {
                    call.reject("User cancelled authentication", "USER_CANCELLED")
                } else {
                    call.reject("Authentication failed", error.localizedDescription)
                }
                return
            }
            
            if let callbackURL = callbackURL {
                print("✅ WebAuthPlugin: Auth session completed!")
                print("✅ WebAuthPlugin: Callback URL: \(callbackURL.absoluteString)")
                print("✅ WebAuthPlugin: URL scheme: \(callbackURL.scheme ?? "none")")
                print("✅ WebAuthPlugin: URL host: \(callbackURL.host ?? "none")")
                print("✅ WebAuthPlugin: URL path: \(callbackURL.path)")
                print("✅ WebAuthPlugin: URL query: \(callbackURL.query ?? "none")")
                print("✅ WebAuthPlugin: URL fragment: \(callbackURL.fragment ?? "none")")
                
                call.resolve(["url": callbackURL.absoluteString])
            } else {
                print("❌ WebAuthPlugin: No callback URL received despite no error")
                call.reject("No callback URL received")
            }
        }
        
        session.presentationContextProvider = self
        session.prefersEphemeralWebBrowserSession = false
        
        print("🍎 WebAuthPlugin: Starting ASWebAuthenticationSession...")
        let started = session.start()
        print("🍎 WebAuthPlugin: Session start result: \(started)")
        
        if !started {
            print("❌ WebAuthPlugin: Failed to start ASWebAuthenticationSession")
            call.reject("Failed to start authentication session")
        }
    }
    
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if #available(iOS 15.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow } ?? ASPresentationAnchor()
        } else {
            return UIApplication.shared.windows.first { $0.isKeyWindow } ?? ASPresentationAnchor()
        }
    }
}