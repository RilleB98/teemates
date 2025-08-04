import { Navigation } from "@/components/Navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Users, ChevronRight } from "lucide-react";

export const Messages = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const { friends, loading } = useFriends();
  const { user } = useAuth();

  // If a private chat is selected
  if (selectedFriend) {
    return (
      <ChatRoom 
        friendId={selectedFriend}
        onBack={() => setSelectedFriend(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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

          <div className="space-y-4">
            {/* Friends List */}
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
                {friends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedFriend(friend.friend_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                          <AvatarImage src={friend.profile.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                            {friend.profile.name?.[0]?.toUpperCase() || 'V'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {friend.profile.name || 'Okänd vän'}
                            </h3>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>HCP {friend.profile.handicap}</span>
                            {friend.profile.home_club && (
                              <>
                                <span>•</span>
                                <span>{friend.profile.home_club}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};