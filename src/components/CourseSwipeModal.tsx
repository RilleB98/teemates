import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Heart, RefreshCw, MapPin, User, Crown } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { useCourseProfiles } from "@/hooks/useCourseProfiles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoBadges } from "@/components/InfoBadges";
import { MutualFriends } from "@/components/MutualFriends";
import { MutualFavoriteCourses } from "@/components/MutualFavoriteCourses";
import { usePremium } from "@/hooks/usePremium";
import { PremiumUpgradeModal } from "./PremiumUpgradeModal";
import { useState } from "react";
interface CourseSwipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  courseLocation: string;
}
export const CourseSwipeModal = ({
  isOpen,
  onClose,
  courseName,
  courseLocation
}: CourseSwipeModalProps) => {
  const {
    isPremium,
    loading: premiumLoading,
    isAdmin,
    manualPremium
  } = usePremium();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  console.log('🎯 CourseSwipeModal Premium Status:', {
    isPremium,
    premiumLoading,
    isAdmin,
    manualPremium
  });
  const {
    currentProfile,
    hasMoreProfiles,
    loading,
    swipeLeft,
    swipeRight,
    refetch,
    totalProfiles,
    currentIndex
  } = useCourseProfiles(courseName);
  const handleSwipeLeft = () => {
    console.log('🎯 CourseSwipeModal - Swipe Left Attempt:', {
      isPremium,
      premiumLoading,
      isAdmin,
      manualPremium
    });
    if (!isPremium) {
      console.log('🎯 CourseSwipeModal - Non-premium user, showing upgrade modal');
      setShowPremiumModal(true);
      return;
    }
    if (currentProfile) {
      swipeLeft(currentProfile.user_id); // Pass profile ID to save swipe
    }
  };
  const handleSwipeRight = () => {
    console.log('🎯 CourseSwipeModal - Swipe Right Attempt:', {
      isPremium,
      premiumLoading,
      isAdmin,
      manualPremium
    });
    if (!isPremium) {
      console.log('🎯 CourseSwipeModal - Non-premium user, showing upgrade modal');
      setShowPremiumModal(true);
      return;
    }
    if (currentProfile) {
      swipeRight(currentProfile.user_id);
    }
  };
  const handleRefresh = () => {
    refetch();
  };
  if (loading) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-golf-green" />
            <span className="ml-2 text-lg">Laddar spelare...</span>
          </div>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg mx-auto p-0 bg-gradient-to-br from-golf-green via-background to-golf-green-light border-0 overflow-hidden">
        <div className="p-4 sm:p-6 pb-8">{/* Reduced bottom padding since buttons are now fixed */}
          <DialogHeader className="mb-3 sm:mb-4">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-golf-premium mb-1">
                {courseName}
              </DialogTitle>
              
            </div>
            
            {totalProfiles > 0}
          </DialogHeader>

          <div className="relative flex items-center justify-center">
            {!isPremium ? <Card className="w-full max-w-sm h-[500px] flex items-center justify-center bg-card/95 backdrop-blur-sm">
                <div className="text-center p-6 space-y-4">
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto" />
                  <h3 className="text-xl font-bold text-foreground">
                    Premium krävs
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    För att swipea på spelare från specifika golfbanor behöver du Premium.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => setShowPremiumModal(true)} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                      <Crown className="w-4 h-4 mr-2" />
                      Uppgradera till Premium
                    </Button>
                    <Button onClick={onClose} variant="outline" className="w-full">
                      Stäng
                    </Button>
                  </div>
                </div>
              </Card> : !hasMoreProfiles || !currentProfile ? <Card className="w-full max-w-sm h-[500px] flex items-center justify-center bg-card/95 backdrop-blur-sm">
                <div className="text-center p-6 space-y-4">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-bold text-foreground">
                    {totalProfiles === 0 ? 'Inga spelare hittades' : 'Inga fler spelare'}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {totalProfiles === 0 ? `Det finns inga andra spelare med ${courseName} som hemmabana just nu.` : 'Du har sett alla spelare från denna golfbana.'}
                  </p>
                  <div className="space-y-3">
                    <Button onClick={handleRefresh} variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Uppdatera lista
                    </Button>
                    <Button onClick={onClose} className="w-full">
                      Stäng
                    </Button>
                  </div>
                </div>
              </Card> : <SwipeCard profile={currentProfile} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} />}
          </div>
        </div>
        
        <PremiumUpgradeModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
      </DialogContent>
    </Dialog>;
};