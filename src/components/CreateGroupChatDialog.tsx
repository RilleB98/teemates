import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useGroupChats } from '@/hooks/useGroupChats';


interface CreateGroupChatDialogProps {
  onGroupCreated?: (groupId: string) => void;
}

export const CreateGroupChatDialog = ({ onGroupCreated }: CreateGroupChatDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const { friends } = useFriends();
  const { createGroupChat } = useGroupChats();
  

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      return;
    }

    if (selectedFriends.length === 0) {
      return;
    }

    setIsCreating(true);
    try {
      const groupChat = await createGroupChat(groupName, selectedFriends);
      if (groupChat) {
        console.log('Group chat created successfully:', groupChat);
        // Gruppchatt skapad - reset form och stäng dialog
        setGroupName('');
        setSelectedFriends([]);
        setOpen(false);
        
        // Trigga callback för att gå till den nya gruppchattan
        onGroupCreated?.(groupChat.id);
        
        // Lägg till en liten delay för att säkerställa att real-time uppdateringen hinner ske
        setTimeout(() => {
          console.log('Group chat creation process completed');
        }, 100);
      } else {
        console.error('Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Skapa gruppchatt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Skapa ny gruppchatt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Gruppnamn</Label>
            <Input
              id="groupName"
              placeholder="Ange gruppnamn..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Välj vänner att lägga till</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-sm">Inga vänner tillgängliga</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                    <Checkbox
                      id={friend.id}
                      checked={selectedFriends.includes(friend.friend_id)}
                      onCheckedChange={() => toggleFriendSelection(friend.friend_id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={friend.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-golf-green text-white text-xs">
                        {friend.profile.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor={friend.id} className="flex-1 cursor-pointer">
                      {friend.profile.name || 'Namnlös'}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
              className="gap-2"
            >
              {isCreating ? (
                "Skapar..."
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Skapa grupp
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};