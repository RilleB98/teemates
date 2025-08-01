import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import player1 from "@/assets/player1.jpg";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ChatRoomProps {
  onBack: () => void;
}

export const ChatRoom = ({ onBack }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'chat_room_id=eq.golf-group'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .eq('chat_room_id', 'golf-group')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error("Kunde inte ladda meddelanden");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Meddelandet kan inte vara tomt");
      return;
    }
    
    if (!user) {
      toast.error("Du måste vara inloggad för att skicka meddelanden");
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          chat_room_id: 'golf-group'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      setNewMessage("");
      toast.success("Meddelande skickat!");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Kunde inte skicka meddelandet");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("sv-SE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getUserDisplayName = (message: Message) => {
    if (message.user_id === user?.id) return "Du";
    return "Golfkompis";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Laddar meddelanden...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-golf-premium mb-4">Du måste logga in</h2>
          <p className="text-muted-foreground mb-6">För att delta i chatten behöver du vara inloggad.</p>
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">
              Tillbaka
            </Button>
            <Button asChild>
              <Link to="/auth">
                Logga in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Inga meddelanden än. Skriv det första!</p>
          </div>
        ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={player1} />
                    <AvatarFallback>{getUserDisplayName(message)[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    isOwn
                      ? "bg-golf-green text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-medium text-golf-green mb-1">{getUserDisplayName(message)}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}
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