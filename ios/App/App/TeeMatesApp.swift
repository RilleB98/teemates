import SwiftUI

@main
struct TeeMatesApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    print("🍎 APP: Received URL: \(url)")
                    
                    if url.scheme == "com.teemates.app" {
                        NotificationCenter.default.post(
                            name: .didReceiveOAuthCallbackURL,
                            object: nil,
                            userInfo: ["url": url]
                        )
                    }
                }
        }
    }
}