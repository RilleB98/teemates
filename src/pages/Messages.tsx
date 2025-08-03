import { Navigation } from "@/components/Navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { useState } from "react";

export const Messages = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatRoom onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24"> {/* Account for fixed bottom navigation */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">Golf Chat</h2>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Open Chat Button */}
            <div className="text-center">
              <button
                onClick={() => setShowChat(true)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Öppna Chattrum
              </button>
              <p className="text-sm text-muted-foreground mt-2">
                Chatta med andra golfspelare och våra virtuella vänner!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};