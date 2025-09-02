import { MessageCircle, UserMinus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    age: number | null;
  };
}

interface FriendsListProps {
  friends: Friend[];
  onRemoveFriend: (friendshipId: string) => void;
  onStartMessage: (friendId: string) => void;
  onProfileClick: (friend: Friend) => void;
}

export const FriendsList = ({ friends, onRemoveFriend, onStartMessage, onProfileClick }: FriendsListProps) => {
  const navigate = useNavigate();
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
      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6">
        {friends.map((friend) => (
          <div 
            key={friend.id} 
            className="flex items-center justify-between p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onProfileClick(friend)}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={friend.profile.avatar_url || ''} />
                <AvatarFallback className="text-xs sm:text-sm">
                  {friend.profile.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm sm:text-base truncate">{friend.profile.name || 'Okänd användare'}</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  {friend.profile.handicap > 0 && (
                    <Badge variant="outline" className="text-xs w-fit">
                      HCP {friend.profile.handicap}
                    </Badge>
                  )}
                  {friend.profile.home_club && (
                    <span className="text-xs truncate">{friend.profile.home_club}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/messages', { state: { selectedFriendId: friend.friend_id } })}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <UserMinus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg mx-2">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl">Ta bort vän</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm sm:text-base">
                      Är du säker på att du vill ta bort {friend.profile.name} från din vänlista?
                      Denna åtgärd kan inte ångras.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Avbryt</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemoveFriend(friend.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
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