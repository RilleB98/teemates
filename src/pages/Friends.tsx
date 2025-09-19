import { Navigation } from "@/components/Navigation";
import { UserSearch } from "@/components/UserSearch";
import { FriendRequests } from "@/components/FriendRequests";
import { FriendsList } from "@/components/FriendsList";
import { FriendProfileModal } from "@/components/FriendProfileModal";
import { CreateGameSuggestion } from "@/components/CreateGameSuggestion";
import { GameSuggestionsList } from "@/components/GameSuggestionsList";
import { useFriends } from "@/hooks/useFriends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export const Friends = () => {
  const { toast } = useToast();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [createGameDialogOpen, setCreateGameDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    removeFriendRequest,
    refetch,
  } = useFriends();

  const handleStartMessage = (friendId: string) => {
    toast({
      title: "Meddelanden",
      description: "Meddelandefunktionen kommer snart! Gå till Messages-fliken för gruppchatt."
    });
  };

  const handleProfileClick = (friend: any) => {
    console.log('Friend profile data:', friend.profile);
    setSelectedProfile(friend.profile);
    setProfileModalOpen(true);
  };

  const handleMessageFromProfile = () => {
    if (selectedProfile) {
      // Find the friend object that matches the selected profile
      const friend = friends.find(f => f.profile.name === selectedProfile.name);
      if (friend) {
        handleStartMessage(friend.friend_id);
        setProfileModalOpen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-8">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
            <CardContent className="p-4 sm:p-6 lg:p-8 xl:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-golf-green" />
              <p className="text-golf-premium text-base sm:text-lg">Laddar vänner...</p>
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
      
      <div className="pb-20 pt-2">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-8">
          {/* Title */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8 animate-scale-in px-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 text-shadow-lg leading-tight">
              Dina Vänner
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-700 backdrop-blur-sm bg-white/20 rounded-full px-3 sm:px-4 lg:px-6 py-1 sm:py-2 inline-block max-w-full">
              Hitta och hantera dina golf-vänner
            </p>
          </div>
          
          <Tabs defaultValue="activity" className="space-y-3 sm:space-y-4 lg:space-y-6 animate-fade-in">
            <TabsList className="grid w-full grid-cols-2 bg-white/95 backdrop-blur-sm shadow-lg border-0 h-10 sm:h-12">
              <TabsTrigger value="activity" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white text-sm sm:text-base">Aktivitet</TabsTrigger>
              <TabsTrigger value="friends-section" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white text-sm sm:text-base">Vänner</TabsTrigger>
            </TabsList>

            <TabsContent value="friends-section">
              {/* Sub-navigation for Friends section */}
              <Tabs defaultValue="friends" className="space-y-3 sm:space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm shadow-md border-0 h-9 sm:h-10">
                  <TabsTrigger value="friends" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white text-xs sm:text-sm px-1">Vänner</TabsTrigger>
                  <TabsTrigger value="requests" className="relative text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white text-xs sm:text-sm px-1">
                    Förfrågningar
                    {pendingRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="search" className="text-golf-premium data-[state=active]:bg-golf-green data-[state=active]:text-white text-xs sm:text-sm px-1">Sök</TabsTrigger>
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
                    onRemove={removeFriendRequest}
                  />
                </TabsContent>

                <TabsContent value="friends">
                  <FriendsList
                    friends={friends}
                    onRemoveFriend={removeFriend}
                    onStartMessage={handleStartMessage}
                    onProfileClick={handleProfileClick}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="activity">
              <div className="space-y-4 sm:space-y-6">
                {/* Game Suggestions List - Main Focus */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-golf-premium flex items-center justify-center gap-2">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                      <span className="text-xl sm:text-2xl lg:text-3xl">Spelförslag från vänner</span>
                    </h3>
                    <Dialog open={createGameDialogOpen} onOpenChange={setCreateGameDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-golf-green hover:bg-golf-green-light text-white text-sm sm:text-base w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Skapa spelförslag</span>
                          <span className="sm:hidden">Skapa</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-2">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-xl">Skapa nytt spelförslag</DialogTitle>
                        </DialogHeader>
                        <CreateGameSuggestion 
                          onSuccess={() => {
                            // Close the dialog and trigger refresh
                            setCreateGameDialogOpen(false);
                            setRefreshTrigger(prev => prev + 1);
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <GameSuggestionsList key={refreshTrigger} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Friend Profile Modal */}
      <FriendProfileModal 
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          refetch(); // Refresh friends data when modal closes
        }}
        profile={selectedProfile}
        onMessage={handleMessageFromProfile}
      />
    </div>
  );
};