import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import player1 from "@/assets/player1.jpg";

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
}

interface ChatRoomProps {
  onBack: () => void;
}

export const ChatRoom = ({ onBack }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Ahmed",
      message: "Hej! Har ni lust att spela en runda på Bro Hof imorgon?",
      timestamp: "14:30",
    },
    {
      id: "2", 
      sender: "Emma",
      message: "Det låter bra! Vilken tid passar er?",
      timestamp: "14:32",
    },
    {
      id: "3",
      sender: "Du",
      message: "Jag kan vilken tid som helst efter lunch!",
      timestamp: "14:35",
      isOwn: true,
    },
    {
      id: "4",
      sender: "Johan",
      message: "Perfekt! Ska vi säga 15:00?",
      timestamp: "14:37",
    }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "Du",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-golf-green-light bg-white/95 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={player1} />
            <AvatarFallback>GG</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-golf-premium">Golf Gruppen</h2>
            <p className="text-sm text-muted-foreground">Ahmed, Emma, Johan och du</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                {!message.isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={player1} />
                    <AvatarFallback>{message.sender[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    message.isOwn
                      ? "bg-golf-green text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-medium text-golf-green mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-golf-green-light bg-white/95 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv ett meddelande..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm" className="bg-golf-green hover:bg-golf-green/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};