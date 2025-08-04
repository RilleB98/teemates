import { MessageCircle, UserMinus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Friend {
  id: string;
  friend_id: string;
  profile: {
    name: string;
    avatar_url: string;
    handicap: number;
    home_club: string;
  };
}

interface FriendsListProps {
  friends: Friend[];
  onRemoveFriend: (friendshipId: string) => void;
  onStartMessage: (friendId: string) => void;
  onProfileClick: (friend: Friend) => void;
}

export const FriendsList = ({ friends, onRemoveFriend, onStartMessage, onProfileClick }: FriendsListProps) => {
  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Du har inga vänner än</p>
          <p className="text-sm text-muted-foreground mt-1">
            Använd sökfunktionen ovan för att hitta och lägga till vänner
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Mina Vänner ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {friends.map((friend) => (
          <div 
            key={friend.id} 
            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onProfileClick(friend)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={friend.profile.avatar_url || ''} />
                <AvatarFallback>
                  {friend.profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{friend.profile.name || 'Okänd användare'}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {friend.profile.handicap > 0 && (
                    <Badge variant="outline" className="text-xs">
                      HCP {friend.profile.handicap}
                    </Badge>
                  )}
                  {friend.profile.home_club && (
                    <span className="text-xs">{friend.profile.home_club}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartMessage(friend.friend_id)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ta bort vän</AlertDialogTitle>
                    <AlertDialogDescription>
                      Är du säker på att du vill ta bort {friend.profile.name} från din vänlista?
                      Denna åtgärd kan inte ångras.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemoveFriend(friend.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Ta bort
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};