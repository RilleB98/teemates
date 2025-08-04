import { Navigation } from "@/components/Navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export const Messages = () => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatRoom onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-10 animate-scale-in px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-shadow-lg leading-tight">
              Golf Chat
            </h1>
            <p className="text-lg sm:text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-4 sm:px-6 py-2 inline-block max-w-full">
              Chatta med andra golfspelare
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Open Chat Button */}
            <div className="text-center">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-golf-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-golf-premium mb-3">Gå med i chatten</h3>
                    <p className="text-muted-foreground text-base sm:text-lg mb-6">
                      Chatta med andra golfspelare och våra virtuella vänner!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChat(true)}
                    className="bg-golf-green hover:bg-golf-green/90 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover-scale shadow-lg text-lg"
                  >
                    Öppna Chattrum
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};