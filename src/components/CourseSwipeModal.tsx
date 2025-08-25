import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Heart, RefreshCw, MapPin } from "lucide-react";
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
      swipeLeft();
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
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-golf-green" />
            <span className="ml-2 text-lg">Laddar spelare...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto p-0 bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-3 sm:mb-4">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-golf-premium mb-1">
                {courseName}
              </DialogTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                {courseLocation}
              </div>
            </div>
            
            {totalProfiles > 0 && (
              <div className="flex items-center justify-between mt-2 sm:mt-3">
                <Badge variant="outline" className="bg-white/80 text-xs sm:text-sm">
                  {currentIndex + 1} av {totalProfiles} spelare
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-target"
                >
                  <RefreshCw className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center">
            {!hasMoreProfiles || !currentProfile ? (
              <Card className="w-full h-full flex items-center justify-center bg-white/95 backdrop-blur-sm">
                <div className="text-center p-4 sm:p-6 lg:p-8">
                  <Heart className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-golf-premium mb-2">
                    {totalProfiles === 0 ? 'Inga spelare hittades' : 'Inga fler spelare'}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
                    {totalProfiles === 0 
                      ? `Det finns inga andra spelare med ${courseName} som hemmabana just nu.`
                      : 'Du har sett alla spelare från denna golfbana.'
                    }
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <Button onClick={handleRefresh} variant="outline" className="w-full touch-target">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Uppdatera lista
                    </Button>
                    <Button onClick={onClose} className="w-full touch-target">
                      Stäng
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <SwipeCard
                profile={currentProfile}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onRefresh={handleRefresh}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};