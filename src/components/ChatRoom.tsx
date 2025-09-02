import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Users, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { markMessagesAsRead } from "@/utils/messageUtils";
import { useGroupChats } from "@/hooks/useGroupChats";
import { ProfilePopover } from "@/components/ProfilePopover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import player1 from "@/assets/player1.jpg";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ChatRoomProps {
  friendId?: string; // If provided, creates a private chat
  groupChatId?: string; // If provided, creates a group chat
  onBack: () => void;
}

export const ChatRoom = ({ friendId, groupChatId, onBack }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [groupChat, setGroupChat] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { getGroupMembers, removeMemberFromGroup } = useGroupChats();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate chat room ID 
  const chatRoomId = groupChatId 
    ? `group_${groupChatId}`
    : friendId && user 
      ? user.id < friendId ? `${user.id}_${friendId}` : `${friendId}_${user.id}` 
      : 'golf-group';

  // Load current user profile
  useEffect(() => {
    if (user) {
      loadCurrentUserProfile();
    }
  }, [user]);

  // Load friend profile if this is a private chat
  useEffect(() => {
    if (friendId) {
      loadFriendProfile();
    } else if (groupChatId) {
      loadGroupChat();
      loadGroupMembers();
    }
  }, [friendId, groupChatId]);

  // Load messages on component mount  
  useEffect(() => {
    loadMessages();
  }, [chatRoomId]);

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
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark new message as read if it's from someone else and this chat is open
          if (user && newMessage.user_id !== user.id) {
            markMessagesAsRead([newMessage.id], user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  const loadCurrentUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const loadFriendProfile = async () => {
    if (!friendId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, handicap, home_club')
        .eq('user_id', friendId)
        .single();

      if (error) throw error;
      setFriendProfile(data);
    } catch (error) {
      console.error('Error loading friend profile:', error);
    }
  };

  const loadGroupChat = async () => {
    if (!groupChatId) return;
    
    try {
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .eq('id', groupChatId)
        .single();

      if (error) throw error;
      setGroupChat(data);
    } catch (error) {
      console.error('Error loading group chat:', error);
    }
  };

  const loadGroupMembers = async () => {
    if (!groupChatId) return;
    
    try {
      const members = await getGroupMembers(groupChatId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, user_id, content, created_at')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Load user profiles for all unique users in the messages
      if (data && data.length > 0) {
        const uniqueUserIds = [...new Set(data.map(msg => msg.user_id))];
        const userIds = uniqueUserIds.filter(id => id !== user?.id); // Exclude current user
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, name, avatar_url')
            .in('user_id', userIds);
            
          if (profiles) {
            const profileMap = profiles.reduce((acc, profile) => {
              acc[profile.user_id] = profile;
              return acc;
            }, {} as {[key: string]: any});
            setUserProfiles(profileMap);
          }
        }
      }

      // Mark messages from others as read when opening the chat
      if (user && data && data.length > 0) {
        const messagesFromOthers = data.filter(msg => msg.user_id !== user.id);
        if (messagesFromOthers.length > 0) {
          const messageIds = messagesFromOthers.map(msg => msg.id);
          await markMessagesAsRead(messageIds, user.id);
        }
      }
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
          chat_room_id: chatRoomId
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

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom immediately when chat opens (after loading)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(true); // Instant scroll when chat first opens
    }
  }, [loading]);

  const getUserDisplayName = (message: Message) => {
    if (message.user_id === user?.id) return "Du";
    
    // For group chats, find the member's name
    if (groupChatId && groupMembers.length > 0) {
      const member = groupMembers.find(m => m.user_id === message.user_id);
      return member?.profile?.name || "Okänd medlem";
    }
    
    return "Golfkompis";
  };

  const getUserProfile = (userId: string) => {
    // Check userProfiles first (for users who have sent messages)
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }
    
    // Then check group members (for group chats)
    if (groupChatId && groupMembers.length > 0) {
      const member = groupMembers.find(m => m.user_id === userId);
      return member?.profile;
    }
    
    return null;
  };

  const handleLeaveGroupChat = async () => {
    if (!user || !groupChatId) return;

    try {
      const success = await removeMemberFromGroup(groupChatId, user.id);
      if (success) {
        toast.success("Du har lämnat gruppchattan");
        onBack(); // Go back to messages list
      } else {
        toast.error("Kunde inte lämna gruppchatt");
      }
    } catch (error) {
      console.error('Error leaving group chat:', error);
      toast.error("Något gick fel");
    }
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
            <AvatarImage src={
              friendId ? friendProfile?.avatar_url 
              : groupChatId ? undefined
              : player1
            } />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
              {friendId ? (friendProfile?.name?.[0]?.toUpperCase() || 'V') 
               : groupChatId ? 'G'
               : 'GG'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">
              {friendId ? (friendProfile?.name || 'Okänd vän') 
               : groupChatId ? (groupChat?.name || 'Gruppchatt')
               : 'Golf Gruppen'}
            </h2>
            {groupChatId ? (
              <Sheet>
                <SheetTrigger asChild>
                  <p className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                    {`${groupMembers.length} medlemmar`}
                  </p>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Gruppmedlemmar
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {groupMembers.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                            {member.profile?.name?.[0]?.toUpperCase() || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.profile?.name || 'Okänd medlem'}</p>
                          <p className="text-sm text-gray-500">
                            {member.profile?.home_club || 'Ingen hemklubb'}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-8 pt-4 border-t">
                      <Button 
                        variant="destructive" 
                        onClick={handleLeaveGroupChat}
                        className="w-full gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Lämna Gruppchatt
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <p className="text-sm text-gray-500">
                {friendId ? 
                  (friendProfile?.home_club ? `HCP ${friendProfile.handicap} • ${friendProfile.home_club}` : `HCP ${friendProfile?.handicap || 0}`) 
                  : 'Ahmed, Emma, Johan och du'
                }
              </p>
            )}
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
                  <AvatarImage 
                    src={getUserProfile(message.user_id)?.avatar_url || undefined} 
                    alt={getUserDisplayName(message)}
                  />
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
                  <AvatarImage 
                    src={currentUserProfile?.avatar_url || undefined}
                    alt={currentUserProfile?.name || "You"}
                  />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                    {currentUserProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              {isOwn && !isLastInGroup && (
                <div className="w-7 h-7 mb-1" />
              )}
            </div>
            );
          })}
          <div ref={messagesEndRef} />
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