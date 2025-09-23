import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MutualFriend {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

interface MutualFriendsProps {
  mutualFriends: MutualFriend[];
}

export const MutualFriends = ({ mutualFriends }: MutualFriendsProps) => {
  if (!mutualFriends || mutualFriends.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users size={16} />
        <span>{mutualFriends.length} gemensamma vänner</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mutualFriends.slice(0, 3).map((friend) => (
          <div key={friend.user_id} className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1">
            <Avatar className="w-5 h-5">
              <AvatarImage src={friend.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
              {friend.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{friend.name?.split(' ')[0] || 'Okänt'}</span>
          </div>
        ))}
        
        {mutualFriends.length > 3 && (
          <div className="flex items-center justify-center bg-secondary/50 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-muted-foreground">
              +{mutualFriends.length - 3} till
            </span>
          </div>
        )}
      </div>
    </div>
  );
};