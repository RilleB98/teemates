import { Navigation } from "@/components/Navigation";
import { UserSearch } from "@/components/UserSearch";
import { FriendRequests } from "@/components/FriendRequests";
import { FriendsList } from "@/components/FriendsList";
import { useFriends } from "@/hooks/useFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Friends = () => {
  const { toast } = useToast();
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriends();

  const handleStartMessage = (friendId: string) => {
    toast({
      title: "Meddelanden",
      description: "Meddelandefunktionen kommer snart! Gå till Messages-fliken för gruppchatt."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="pb-24">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Laddar vänner...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Dina Vänner</h2>
          
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Sök Vänner</TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Förfrågningar
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends">Mina Vänner</TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <UserSearch
                onSendRequest={sendFriendRequest}
                sentRequests={sentRequests}
                friends={friends}
              />
            </TabsContent>

            <TabsContent value="requests">
              <FriendRequests
                pendingRequests={pendingRequests}
                sentRequests={sentRequests}
                onAccept={acceptFriendRequest}
                onReject={rejectFriendRequest}
              />
            </TabsContent>

            <TabsContent value="friends">
              <FriendsList
                friends={friends}
                onRemoveFriend={removeFriend}
                onStartMessage={handleStartMessage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};