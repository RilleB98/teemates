import { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Users, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoundSuggestion {
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

export const RoundSuggestionsList = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<RoundSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoundSuggestions();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchRoundSuggestions = async () => {
    console.log('fetchRoundSuggestions called');
    try {
      // First, get round suggestions with basic data
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('round_suggestions')
        .select('*')
        .gte('suggested_date', new Date().toISOString().split('T')[0])
        .order('suggested_date', { ascending: true })
        .order('suggested_time', { ascending: true });

      console.log('Suggestions response:', { suggestions, error: suggestionsError });

      if (suggestionsError) throw suggestionsError;

      if (!suggestions || suggestions.length === 0) {
        console.log('No suggestions found');
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
      console.log('Final enriched suggestions:', enrichedSuggestions);
    } catch (error) {
      console.error('Error fetching round suggestions:', error);
      // Only show error if we're not just getting empty results
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const joinRound = async (suggestionId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('round_suggestion_participants')
        .insert({
          round_suggestion_id: suggestionId,
          user_id: currentUserId,
          status: 'accepted'
        });

      if (error) throw error;

      toast({
        title: "Anmäld!",
        description: "Du har anmält dig till rundan.",
      });

      fetchRoundSuggestions();
    } catch (error) {
      console.error('Error joining round:', error);
      toast({
        title: "Fel",
        description: "Kunde inte anmäla dig till rundan.",
        variant: "destructive",
      });
    }
  };

  const leaveRound = async (suggestionId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('round_suggestion_participants')
        .delete()
        .eq('round_suggestion_id', suggestionId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      toast({
        title: "Avanmäld",
        description: "Du har avanmält dig från rundan.",
      });

      fetchRoundSuggestions();
    } catch (error) {
      console.error('Error leaving round:', error);
      toast({
        title: "Fel",
        description: "Kunde inte avanmäla dig från rundan.",
        variant: "destructive",
      });
    }
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
          <h3 className="text-lg font-semibold text-golf-premium mb-2">Inga rundförslag</h3>
          <p className="text-muted-foreground">
            Skapa ett rundförslag för att börja spela med dina vänner!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div style={{backgroundColor: 'red', color: 'white', padding: '10px'}}>
        DEBUG: Found {suggestions.length} suggestions
      </div>
      {suggestions.map((suggestion) => {
        const isOwner = suggestion.user_id === currentUserId;
        const participants = suggestion.participants || [];
        const isParticipant = participants.some(p => p.user_id === currentUserId);
        const spotsLeft = suggestion.max_players - participants.filter(p => p.status === 'accepted').length - 1; // -1 for owner

        return (
          <Card key={suggestion.id} className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="pb-3">
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
                      {suggestion.profiles.name} föreslår en runda
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(suggestion.created_at), "d MMM", { locale: sv })}
                    </p>
                  </div>
                </div>
                {spotsLeft > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {spotsLeft} platser kvar
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Fullbokad
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Profile Icons, Course and Time Info - All on same row */}
              <div className="flex items-center justify-between">
                {/* Course Info */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="font-medium text-sm">{suggestion.golf_courses.name}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.golf_courses.location}</p>
                  </div>
                </div>
                
                {/* Date and Time */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-golf-green" />
                    <span className="text-sm">
                      {format(new Date(suggestion.suggested_date), "d MMM", { locale: sv })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-golf-green" />
                    <span className="text-sm">{suggestion.suggested_time}</span>
                  </div>
                </div>

                {/* Profile Icons - Moved to far right */}
                <div className="flex items-center gap-3">
                  {/* Creator Profile Icon */}
                  <Avatar className="h-8 w-8 border-2 border-golf-green">
                    <AvatarImage src={suggestion.profiles.avatar_url} />
                    <AvatarFallback className="bg-golf-green text-white text-xs">
                      {suggestion.profiles.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Joined Participants */}
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

                  {/* Empty Slots with + buttons */}
                  {Array.from({ length: spotsLeft }, (_, index) => (
                    <div key={`empty-${index}`} className="relative">
                      {!isOwner && !isParticipant ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 rounded-full p-0 border-dashed border-2 border-gray-300 hover:border-golf-green"
                          onClick={() => joinRound(suggestion.id)}
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
              </div>

              {/* Message */}
              {suggestion.message && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-golf-green mt-0.5" />
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                </div>
              )}

              {/* Participants */}
              {participants.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-golf-green" />
                    <span className="text-sm font-medium">Anmälda ({participants.filter(p => p.status === 'accepted').length + 1}/{suggestion.max_players})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-golf-green text-white">
                      {suggestion.profiles.name} (arrangör)
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
              {!isOwner && (
                <div className="pt-2">
                  {isParticipant ? (
                    <Button
                      variant="outline"
                      onClick={() => leaveRound(suggestion.id)}
                      className="w-full"
                    >
                      Avanmäl dig
                    </Button>
                  ) : spotsLeft > 0 ? (
                    <Button
                      onClick={() => joinRound(suggestion.id)}
                      className="w-full bg-golf-green hover:bg-golf-green-light text-white"
                    >
                      Anmäl dig till rundan
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Rundan är fullbokad
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};