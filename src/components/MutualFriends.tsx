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
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Users size={16} />
      <span>{mutualFriends.length} gemensamma vänner</span>
    </div>
  );
};