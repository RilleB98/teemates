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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (!searchTerm.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, handicap, home_club, golf_id')
        .neq('user_id', user.id)
        .eq('golf_id', searchTerm.trim())
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Skriv Golf-ID (t.ex. 981114-123)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={searchUsers} disabled={loading || !searchTerm.trim()}>
          {loading ? 'Söker...' : 'Sök'}
        </Button>
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

      {searchTerm.trim() && searchResults.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          Inga användare hittades för "{searchTerm}"
        </div>
      )}
    </div>
  );
};