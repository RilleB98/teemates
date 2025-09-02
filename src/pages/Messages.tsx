import { Navigation } from "@/components/Navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { CreateGroupChatDialog } from "@/components/CreateGroupChatDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { useGroupChats } from "@/hooks/useGroupChats";
import { useUnreadMessagesByFriend } from "@/hooks/useUnreadMessagesByFriend";
import { useLatestMessages } from "@/hooks/useLatestMessages";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Users, ChevronRight } from "lucide-react";

export const Messages = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedGroupChat, setSelectedGroupChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("friends");
  const { friends, loading } = useFriends();
  const { groupChats, loading: groupLoading } = useGroupChats();
  const { unreadByFriend, refetchUnreadCounts } = useUnreadMessagesByFriend();
  const latestMessages = useLatestMessages();
  const { user } = useAuth();

  // If a private chat is selected
  if (selectedFriend) {
    return (
      <ChatRoom 
        friendId={selectedFriend}
        onBack={() => {
          setSelectedFriend(null);
          refetchUnreadCounts();
        }} 
      />
    );
  }

  // If a group chat is selected
  if (selectedGroupChat) {
    return (
      <ChatRoom 
        groupChatId={selectedGroupChat}
        onBack={() => {
          setSelectedGroupChat(null);
          setActiveTab("groups"); // Set to groups tab when coming back from group chat
          refetchUnreadCounts();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-24 pt-4">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Meddelanden
            </h1>
            <p className="text-gray-600">
              Chatta privat med dina vänner
            </p>
          </div>

          

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">Chatter</TabsTrigger>
              <TabsTrigger value="groups">Gruppchatter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="space-y-4 mt-6">
              {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Laddar vänner...</div>
              </div>
            ) : friends.length === 0 ? (
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga vänner än</h3>
                  <p className="text-gray-600 mb-4">
                    Lägg till vänner för att kunna chatta privat med dem
                  </p>
                  <Button asChild variant="outline">
                    <a href="/friends">Hitta vänner</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Dina vänner</h2>
                {friends.map((friend) => {
                  const unreadCount = unreadByFriend[friend.friend_id] || 0;
                  const hasUnread = unreadCount > 0;
                  const latestMessage = latestMessages[friend.friend_id];
                  
                  // Helper function to format message preview
                  const getMessagePreview = () => {
                    if (!latestMessage) return "Inga meddelanden än";
                    
                    const isFromMe = latestMessage.user_id === user?.id;
                    // Shorter truncation for friend messages to fit with the arrow
                    const maxLength = isFromMe ? 35 : 30;
                    const preview = latestMessage.content.length > maxLength 
                      ? latestMessage.content.substring(0, maxLength) + "..."
                      : latestMessage.content;
                    
                    return isFromMe ? `Du: ${preview}` : preview;
                  };
                  
                  return (
                    <Card
                      key={friend.id}
                      className={`shadow-sm border transition-all duration-200 cursor-pointer ${
                        hasUnread 
                          ? 'bg-green-100 border-green-300 hover:bg-green-200 hover:shadow-md' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedFriend(friend.friend_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className={`w-12 h-12 ring-2 ${
                            hasUnread ? 'ring-green-300' : 'ring-primary/20'
                          }`}>
                            <AvatarImage src={friend.profile.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                              {friend.profile.name?.[0]?.toUpperCase() || 'V'}
                            </AvatarFallback>
                          </Avatar>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${
                                hasUnread ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {friend.profile.name || 'Okänd vän'}
                              </h3>
                            <div className={`text-sm ${
                              hasUnread ? 'text-green-700' : 'text-gray-500'
                            } truncate flex items-center justify-between`}>
                              <span className="truncate flex-1 mr-2">{getMessagePreview()}</span>
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                                hasUnread ? 'text-green-500' : 'text-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="flex items-center">
                            {hasUnread && (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            </TabsContent>

            <TabsContent value="groups" className="space-y-4 mt-6">
              <div className="flex justify-center mb-4">
                <CreateGroupChatDialog onGroupCreated={(groupId) => setSelectedGroupChat(groupId)} />
              </div>
              {groupLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Laddar gruppchatter...</div>
                </div>
              ) : groupChats.length === 0 ? (
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga gruppchatter än</h3>
                    <p className="text-gray-600 mb-4">
                      Skapa en gruppchatt för att chatta med flera vänner samtidigt
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {groupChats.map((group) => (
                    <Card
                      key={group.id}
                      className="shadow-sm border bg-white border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedGroupChat(group.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                              {group.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                            <p className="text-sm text-gray-500">Gruppchatt</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};