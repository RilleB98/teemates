import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, User, MessageCircle } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';


interface ProfilePopoverProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  children: React.ReactNode;
  onMessageClick?: () => void;
}

export const ProfilePopover = ({ 
  userId, 
  userName, 
  userAvatar, 
  children,
  onMessageClick 
}: ProfilePopoverProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { friends, sendFriendRequest } = useFriends();
  

  // Don't show popover for current user
  if (user?.id === userId) {
    return <>{children}</>;
  }

  const isFriend = friends.some(friend => friend.user_id === userId);

  const handleSendFriendRequest = async () => {
    setIsLoading(true);
    try {
      const success = await sendFriendRequest(userId);
      if (success) {
        // Vänförfrågan skickad till användarnamn
        setOpen(false);
      } else {
        // Kunde inte skicka vänförfrågan
      }
    } catch (error) {
      console.log('Error sending friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = () => {
    setOpen(false);
    onMessageClick?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" side="top" align="start">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-golf-green text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{userName}</h3>
              {isFriend && (
                <Badge variant="secondary" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Vän
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isFriend ? (
              <Button 
                onClick={handleMessageClick}
                className="flex-1 gap-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                Skicka meddelande
              </Button>
            ) : (
              <Button 
                onClick={handleSendFriendRequest}
                disabled={isLoading}
                className="flex-1 gap-2"
                size="sm"
              >
                <UserPlus className="w-4 h-4" />
                {isLoading ? "Skickar..." : "Lägg till som vän"}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};