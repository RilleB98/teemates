import { useState } from 'react';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string;
  handicap: number;
  home_club: string;
  golf_id: string;
}

interface UserSearchProps {
  onSendRequest: (userId: string) => void;
  sentRequests: Array<{ friend_id: string }>;
  friends: Array<{ friend_id: string }>;
}

export const UserSearch = ({ onSendRequest, sentRequests, friends }: UserSearchProps) => {
  const { user } = useAuth();
  const [datepart, setDatepart] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!datepart.trim() || !lastDigits.trim() || !user) return;

    const fullGolfId = `${datepart.trim()}-${lastDigits.trim()}`;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, handicap, home_club, golf_id')
        .neq('user_id', user.id)
        .eq('golf_id', fullGolfId)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  const isAlreadyFriend = (userId: string) => {
    return friends.some(f => f.friend_id === userId);
  };

  const hasRequestSent = (userId: string) => {
    return sentRequests.some(r => r.friend_id === userId);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Datum (t.ex. 981114)"
              value={datepart}
              onChange={(e) => setDatepart(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={6}
            />
          </div>
          <div className="w-20">
            <Input
              placeholder="023"
              value={lastDigits}
              onChange={(e) => setLastDigits(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={3}
            />
          </div>
          <Button onClick={searchUsers} disabled={loading || !datepart.trim() || !lastDigits.trim()}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Söker...' : 'Sök'}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Ange Golf-ID i två delar: datum (6 siffror) + sista 3 siffrorna
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((profile) => (
            <Card key={profile.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>
                        {profile.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{profile.name || 'Okänd användare'}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {profile.golf_id && (
                          <Badge variant="secondary" className="font-mono">
                            {profile.golf_id}
                          </Badge>
                        )}
                        {profile.handicap > 0 && (
                          <Badge variant="outline">HCP {profile.handicap}</Badge>
                        )}
                        {profile.home_club && (
                          <span>{profile.home_club}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isAlreadyFriend(profile.user_id) ? (
                      <Button variant="secondary" disabled>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Vänner
                      </Button>
                    ) : hasRequestSent(profile.user_id) ? (
                      <Button variant="outline" disabled>
                        Förfrågan skickad
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => onSendRequest(profile.user_id)}
                        variant="default"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Lägg till
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(datepart.trim() || lastDigits.trim()) && searchResults.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          Inga användare hittades för "{datepart}-{lastDigits}"
        </div>
      )}
    </div>
  );
};