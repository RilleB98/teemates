import Foundation
import Capacitor
import AuthenticationServices

@objc(WebAuthPlugin)
public class WebAuthPlugin: CAPPlugin, ASWebAuthenticationPresentationContextProviding {
    
    @objc func startWebAuth(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("Invalid URL")
            return
        }
        
        let session = ASWebAuthenticationSession(url: url, callbackURLScheme: nil) { callbackURL, error in
            if let error = error {
                call.reject("Authentication failed", error.localizedDescription)
                return
            }
            
            if let callbackURL = callbackURL {
                call.resolve(["url": callbackURL.absoluteString])
            } else {
                call.reject("No callback URL received")
            }
        }
        
        session.presentationContextProvider = self
        session.prefersEphemeralWebBrowserSession = false
        session.start()
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