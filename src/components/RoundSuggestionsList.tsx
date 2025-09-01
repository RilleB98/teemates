import { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Clock, MapPin, Users, MessageSquare } from "lucide-react";
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
    try {
      const { data, error } = await supabase
        .from('round_suggestions')
        .select(`
          *,
          golf_courses!golf_course_id (name, location),
          profiles!user_id (name, avatar_url),
          round_suggestion_participants (
            id,
            user_id,
            status,
            profiles!user_id (name, avatar_url)
          )
        `)
        .gte('suggested_date', new Date().toISOString().split('T')[0])
        .order('suggested_date', { ascending: true })
        .order('suggested_time', { ascending: true });

      if (error) throw error;
      setSuggestions((data as any) || []);
    } catch (error) {
      console.error('Error fetching round suggestions:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta rundförslag.",
        variant: "destructive",
      });
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
              {/* Course and Time Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-golf-green" />
                  <div>
                    <p className="font-medium">{suggestion.golf_courses.name}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.golf_courses.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-golf-green" />
                    <span className="text-sm">
                      {format(new Date(suggestion.suggested_date), "d MMM yyyy", { locale: sv })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-golf-green" />
                    <span className="text-sm">{suggestion.suggested_time}</span>
                  </div>
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