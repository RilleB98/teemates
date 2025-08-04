import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Calendar, Trophy } from "lucide-react";

interface FriendProfile {
  name: string;
  avatar_url?: string;
  home_club?: string;
  age?: number | null;
  handicap?: number;
}

interface FriendProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FriendProfile | null;
  onMessage: () => void;
}

export const FriendProfileModal = ({ isOpen, onClose, profile, onMessage }: FriendProfileModalProps) => {
  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Profil</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Profile Picture */}
          <Avatar className="w-24 h-24 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-2xl">
              {profile.name?.[0]?.toUpperCase() || 'V'}
            </AvatarFallback>
          </Avatar>

          {/* Name with Age */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name || 'Okänd vän'}{profile.age ? `, ${profile.age} år` : ''}
            </h2>
            {profile.home_club && (
              <p className="text-lg text-gray-600 mt-1">{profile.home_club}</p>
            )}
          </div>

          {/* Profile Details */}
          <div className="w-full space-y-4">

            {profile.handicap !== null && profile.handicap !== undefined && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Handicap</p>
                  <p className="font-semibold text-gray-900">HCP {profile.handicap}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 w-full pt-4">
            <Button 
              onClick={onMessage}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Skicka meddelande
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Stäng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};