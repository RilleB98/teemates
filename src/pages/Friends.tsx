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
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="pb-24 pt-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
              <CardContent className="p-8 sm:p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-golf-green" />
                <p className="text-golf-premium text-lg">Laddar vänner...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-10 animate-scale-in px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-shadow-lg leading-tight">
              Dina Vänner
            </h1>
            <p className="text-lg sm:text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-4 sm:px-6 py-2 inline-block max-w-full">
              Hitta och hantera dina golf-vänner
            </p>
          </div>
          
          <Tabs defaultValue="search" className="space-y-6 animate-fade-in">
            <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="search" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white">Sök Vänner</TabsTrigger>
              <TabsTrigger value="requests" className="relative text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white">
                Förfrågningar
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white">Mina Vänner</TabsTrigger>
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