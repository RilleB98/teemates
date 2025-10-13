import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, RefreshCw } from "lucide-react";
import { SwipeCard } from "@/components/SwipeCard";
import { useCourseProfiles } from "@/hooks/useCourseProfiles";
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
    if (currentProfile) {
      swipeLeft(currentProfile.user_id);
    }
  };
  
  const handleSwipeRight = () => {
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
            {!hasMoreProfiles || !currentProfile ? (
              <Card className="w-full max-w-sm h-[500px] flex items-center justify-center bg-card/95 backdrop-blur-sm">
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
              </Card>
            ) : (
              <SwipeCard profile={currentProfile} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};