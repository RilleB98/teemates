import { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Users, MessageSquare, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateGameSuggestion } from "@/components/CreateGameSuggestion";
import { useFriends } from "@/hooks/useFriends";

interface GameSuggestion {
  id: string;
  user_id: string;
  golf_course_id: string;
  suggested_date: string;
  suggested_time: string;
  message?: string;
  max_players: number;
  created_at: string;
  golf_courses: {
    name: string;
    location: string;
  };
  profiles: {
    name: string;
    avatar_url?: string;
  };
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    profiles: {
      name: string;
      avatar_url?: string;
    };
  }>;
}

export const GameSuggestionsList = () => {
  const { toast } = useToast();
  const { friends } = useFriends();
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GameSuggestion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchGameSuggestions();
    getCurrentUser();
    
    // Set up real-time listener for round suggestions
    const channel = supabase
      .channel('round-suggestions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'round_suggestions'
        },
        () => {
          fetchGameSuggestions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'round_suggestion_participants'
        },
        () => {
          fetchGameSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friends]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchGameSuggestions = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Extract friend IDs from the useFriends hook
      const friendIds = friends.map(friend => friend.friend_id);

      // Include current user in the list to see their own suggestions
      const allowedUserIds = [...friendIds, user.id];
      
      // First, get all suggestions from today and future dates, only from friends and self
      const { data: allSuggestions, error: suggestionsError } = await supabase
        .from('round_suggestions')
        .select('*')
        .gte('suggested_date', today)
        .in('user_id', allowedUserIds)
        .order('suggested_date', { ascending: true })
        .order('suggested_time', { ascending: true });

      if (suggestionsError) throw suggestionsError;

      // Filter out suggestions that have already passed (date + time)
      const currentSuggestions = allSuggestions?.filter(suggestion => {
        const suggestionDateTime = new Date(`${suggestion.suggested_date}T${suggestion.suggested_time}`);
        return suggestionDateTime > now;
      }) || [];

      const suggestions = currentSuggestions;

      if (!suggestions || suggestions.length === 0) {
        setSuggestions([]);
        return;
      }

      // Get golf course details
      const courseIds = suggestions.map(s => s.golf_course_id);
      const { data: courses } = await supabase
        .from('golf_courses')
        .select('id, name, location')
        .in('id', courseIds);

      // Get user profiles
      const userIds = suggestions.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      // Get participants
      const suggestionIds = suggestions.map(s => s.id);
      const { data: participants } = await supabase
        .from('round_suggestion_participants')
        .select('*')
        .in('round_suggestion_id', suggestionIds);

      // Get participant profiles
      const participantUserIds = participants?.map(p => p.user_id) || [];
      const { data: participantProfiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', participantUserIds);

      // Combine all data
      const enrichedSuggestions = suggestions.map(suggestion => {
        const course = courses?.find(c => c.id === suggestion.golf_course_id);
        const profile = profiles?.find(p => p.user_id === suggestion.user_id);
        const suggestionParticipants = participants?.filter(p => p.round_suggestion_id === suggestion.id).map(participant => ({
          ...participant,
          profiles: participantProfiles?.find(pp => pp.user_id === participant.user_id) || { name: 'Okänd användare', avatar_url: null }
        }));

        return {
          ...suggestion,
          golf_courses: course || { name: 'Okänd bana', location: '' },
          profiles: profile || { name: 'Okänd användare', avatar_url: null },
          participants: suggestionParticipants || []
        };
      });

      setSuggestions(enrichedSuggestions as any);
    } catch (error) {
      console.error('Error fetching game suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (suggestionId: string) => {
    if (!currentUserId) return;

    try {
      // Get the suggestion with group chat info
      const { data: suggestion } = await supabase
        .from('round_suggestions')
        .select('group_chat_id')
        .eq('id', suggestionId)
        .single();

      // Join the game
      const { error } = await supabase
        .from('round_suggestion_participants')
        .insert({
          round_suggestion_id: suggestionId,
          user_id: currentUserId,
          status: 'accepted'
        });

      if (error) throw error;

      // Join the group chat if it exists
      if (suggestion?.group_chat_id) {
        const { error: chatError } = await supabase
          .from('group_chat_members')
          .insert({
            group_chat_id: suggestion.group_chat_id,
            user_id: currentUserId,
            added_by: currentUserId
          });

        if (chatError) {
          console.error('Error joining group chat:', chatError);
          // Don't fail the whole operation if chat join fails
        }
      }

      toast({
        title: "Anmäld!",
        description: "Du har anmält dig till rundan och gruppchatten.",
      });

      fetchGameSuggestions();
    } catch (error) {
      console.error('Error joining round:', error);
      toast({
        title: "Fel",
        description: "Kunde inte anmäla dig till rundan.",
        variant: "destructive",
      });
    }
  };

  const leaveGame = async (suggestionId: string) => {
    if (!currentUserId) return;

    try {
      // Get the suggestion with group chat info
      const { data: suggestion } = await supabase
        .from('round_suggestions')
        .select('group_chat_id')
        .eq('id', suggestionId)
        .single();

      // Leave the game
      const { error } = await supabase
        .from('round_suggestion_participants')
        .delete()
        .eq('round_suggestion_id', suggestionId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Leave the group chat if it exists
      if (suggestion?.group_chat_id) {
        const { error: chatError } = await supabase
          .from('group_chat_members')
          .delete()
          .eq('group_chat_id', suggestion.group_chat_id)
          .eq('user_id', currentUserId);

        if (chatError) {
          console.error('Error leaving group chat:', chatError);
          // Don't fail the whole operation if chat leave fails
        }
      }

      toast({
        title: "Avanmäld",
        description: "Du har avanmält dig från rundan och gruppchatten.",
      });

      fetchGameSuggestions();
    } catch (error) {
      console.error('Error leaving round:', error);
      toast({
        title: "Fel",
        description: "Kunde inte avanmäla dig från rundan.",
        variant: "destructive",
      });
    }
  };

  const deleteSuggestion = async (suggestionId: string) => {
    if (!currentUserId) return;

    try {
      // Get the suggestion with group chat info before deleting
      const { data: suggestion } = await supabase
        .from('round_suggestions')
        .select('group_chat_id')
        .eq('id', suggestionId)
        .single();

      // Delete the suggestion (this will cascade to participants)
      const { error } = await supabase
        .from('round_suggestions')
        .delete()
        .eq('id', suggestionId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Delete the associated group chat if it exists
      if (suggestion?.group_chat_id) {
        const { error: chatError } = await supabase
          .from('group_chats')
          .delete()
          .eq('id', suggestion.group_chat_id);

        if (chatError) {
          console.error('Error deleting group chat:', chatError);
          // Don't fail the whole operation if chat deletion fails
        }
      }

      toast({
        title: "Borttaget",
        description: "Spelförslaget och gruppchatten har tagits bort.",
      });

      fetchGameSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort spelförslaget.",
        variant: "destructive",
      });
    }
  };

  const editSuggestion = (suggestionId: string) => {
    toast({
      title: "Redigering",
      description: "Redigeringsfunktionen kommer snart!",
    });
  };

  const formatTimeInterval = (timeString: string) => {
    // Remove seconds if present (e.g., "13:30:00" -> "13:30")
    const startTime = timeString.slice(0, 5);
    
    // Parse the time to add 30 minutes
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Add 30 minutes
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    return `${startTime}-${endTime}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/95 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-8 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-golf-premium mb-2">Inga spelförslag</h3>
          <p className="text-muted-foreground">
            Skapa ett spelförslag för att börja spela med dina vänner!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const participants = suggestion.participants || [];
          const spotsLeft = suggestion.max_players - participants.filter(p => p.status === 'accepted').length - 1;

          return (
            <Card 
              key={suggestion.id} 
              className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setModalOpen(true);
              }}
            >
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={suggestion.profiles.avatar_url} />
                      <AvatarFallback>
                        {suggestion.profiles.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-golf-premium">
                        {suggestion.golf_courses.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(suggestion.suggested_date), 'PPP', { locale: sv })} kl. {suggestion.suggested_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  
                  {spotsLeft <= 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Fullbokad
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Detailed Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedSuggestion.profiles.avatar_url} />
                    <AvatarFallback>
                      {selectedSuggestion.profiles.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedSuggestion.profiles.name} föreslår en runda</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {(() => {
                  const isOwner = selectedSuggestion.user_id === currentUserId;
                  const participants = selectedSuggestion.participants || [];
                  const isParticipant = participants.some(p => p.user_id === currentUserId);
                  const spotsLeft = selectedSuggestion.max_players - participants.filter(p => p.status === 'accepted').length - 1;

                  return (
                    <>
                      {/* Three-dot menu for owners and participants */}
                      {(isOwner || isParticipant) && (
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isOwner ? (
                                <>
                                  <DropdownMenuItem onClick={() => editSuggestion(selectedSuggestion.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Redigera
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      deleteSuggestion(selectedSuggestion.id);
                                      setModalOpen(false);
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Ta bort
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    leaveGame(selectedSuggestion.id);
                                    setModalOpen(false);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Lämna spelförslag
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      {/* Course and Time Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-golf-green" />
                          <div>
                            <p className="font-medium text-sm">{selectedSuggestion.golf_courses.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedSuggestion.golf_courses.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 text-golf-green" />
                            <span className="text-sm">
                              {format(new Date(selectedSuggestion.suggested_date), "d MMM", { locale: sv })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-golf-green" />
                            <span className="text-sm">{formatTimeInterval(selectedSuggestion.suggested_time)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Profile Icons */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-golf-green">
                          <AvatarImage src={selectedSuggestion.profiles.avatar_url} />
                          <AvatarFallback className="bg-golf-green text-white text-xs">
                            {selectedSuggestion.profiles.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        {participants
                          .filter(p => p.status === 'accepted')
                          .map((participant) => (
                            <Avatar key={participant.id} className="h-8 w-8 border-2 border-green-500">
                              <AvatarImage src={participant.profiles.avatar_url} />
                              <AvatarFallback className="bg-green-500 text-white text-xs">
                                {participant.profiles.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          ))}

                        {Array.from({ length: spotsLeft }, (_, index) => (
                          <div key={`empty-${index}`} className="relative">
                            {!isOwner && !isParticipant ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-full p-0 border-dashed border-2 border-gray-300 hover:border-golf-green"
                                onClick={() => {
                                  joinGame(selectedSuggestion.id);
                                  setModalOpen(false);
                                }}
                              >
                                <Plus className="h-4 w-4 text-gray-400 hover:text-golf-green" />
                              </Button>
                            ) : (
                              <div className="h-8 w-8 rounded-full border-dashed border-2 border-gray-300 flex items-center justify-center">
                                <Plus className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Message */}
                      {selectedSuggestion.message && (
                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-golf-green mt-0.5" />
                          <p className="text-sm text-gray-700">{selectedSuggestion.message}</p>
                        </div>
                      )}

                      {/* Participants */}
                      {participants.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-golf-green" />
                              <span className="text-sm font-medium">Anmälda ({participants.filter(p => p.status === 'accepted').length + 1}/{selectedSuggestion.max_players})</span>
                            </div>
                            {/* Three-dot menu for owners and participants */}
                            {(isOwner || isParticipant) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isOwner ? (
                                    <>
                                      <DropdownMenuItem onClick={() => editSuggestion(selectedSuggestion.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Redigera
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          deleteSuggestion(selectedSuggestion.id);
                                          setModalOpen(false);
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Ta bort
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        leaveGame(selectedSuggestion.id);
                                        setModalOpen(false);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Lämna spelförslag
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-golf-green text-white">
                              {selectedSuggestion.profiles.name} (arrangör)
                            </Badge>
                            {participants
                              .filter(p => p.status === 'accepted')
                              .map((participant) => (
                                <Badge key={participant.id} variant="outline">
                                  {participant.profiles.name}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {!isOwner && spotsLeft === 0 && (
                        <Button disabled className="w-full">
                          Fullbokad
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </>
  );
};