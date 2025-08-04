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
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/auth">
                Logga in
              </Link>
            </Button>
            <Button onClick={onBack} variant="outline">
              Tillbaka
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Instagram style */}
      <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={player1} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">GG</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">Golf Gruppen</h2>
            <p className="text-sm text-gray-500">Ahmed, Emma, Johan och du</p>
          </div>
        </div>
      </div>

      {/* Messages - Instagram style with better spacing */}
      <ScrollArea className="flex-1 px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">Inga meddelanden än.<br />Säg hej för att starta konversationen!</p>
          </div>
        ) : (
        <div className="space-y-1 py-4">
          {messages.map((message, index) => {
            const isOwn = message.user_id === user?.id;
            const nextMessage = messages[index + 1];
            const isLastInGroup = !nextMessage || nextMessage.user_id !== message.user_id;
            const prevMessage = messages[index - 1];
            const isFirstInGroup = !prevMessage || prevMessage.user_id !== message.user_id;
            
            return (
            <div
              key={message.id}
              className={`flex items-end space-x-2 ${isOwn ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-3" : "mb-1"}`}
            >
              {!isOwn && isLastInGroup && (
                <Avatar className="w-7 h-7 mb-1">
                  <AvatarImage src={player1} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                    {getUserDisplayName(message)[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              {!isOwn && !isLastInGroup && (
                <div className="w-7 h-7 mb-1" />
              )}
              
              <div className="flex flex-col max-w-[70%]">
                {!isOwn && isFirstInGroup && (
                  <p className="text-xs font-medium text-gray-600 mb-1 ml-3">{getUserDisplayName(message)}</p>
                )}
                
                <div
                  className={`px-4 py-2 relative ${
                    isOwn
                      ? `bg-gradient-to-br from-primary to-primary/90 text-white ${
                          isFirstInGroup && isLastInGroup 
                            ? "rounded-2xl" 
                            : isFirstInGroup 
                              ? "rounded-2xl rounded-br-md" 
                              : isLastInGroup 
                                ? "rounded-2xl rounded-tr-md" 
                                : "rounded-l-2xl rounded-r-md"
                        }`
                      : `bg-gray-100 text-gray-900 ${
                          isFirstInGroup && isLastInGroup 
                            ? "rounded-2xl" 
                            : isFirstInGroup 
                              ? "rounded-2xl rounded-bl-md" 
                              : isLastInGroup 
                                ? "rounded-2xl rounded-tl-md" 
                                : "rounded-r-2xl rounded-l-md"
                        }`
                  } animate-fade-in`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                
                {isLastInGroup && (
                  <p className={`text-xs mt-1 ${isOwn ? "text-right text-gray-500" : "text-left text-gray-500 ml-3"}`}>
                    {formatTime(message.created_at)}
                  </p>
                )}
              </div>
              
              {isOwn && isLastInGroup && (
                <Avatar className="w-7 h-7 mb-1">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                    {user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {isOwn && !isLastInGroup && (
                <div className="w-7 h-7 mb-1" />
              )}
            </div>
            );
          })}
        </div>
        )}
      </ScrollArea>

      {/* Input - Instagram style */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Meddelande..."
              className="rounded-full border-gray-300 bg-gray-50 pr-12 py-2 focus:bg-white focus:border-primary transition-all duration-200"
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              disabled={!newMessage.trim()}
              className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 p-0 transition-all duration-200 ${
                newMessage.trim() 
                  ? "bg-primary hover:bg-primary/90 text-white shadow-md" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};