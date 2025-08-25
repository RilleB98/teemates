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
      <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div>
              <DialogTitle className="text-xl font-bold text-golf-premium mb-1">
                {courseName}
              </DialogTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                {courseLocation}
              </div>
            </div>
            
            {totalProfiles > 0 && (
              <div className="flex items-center justify-between mt-3">
                <Badge variant="outline" className="bg-white/80">
                  {currentIndex + 1} av {totalProfiles} spelare
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="relative h-[500px] flex items-center justify-center">
            {!hasMoreProfiles || !currentProfile ? (
              <Card className="w-full h-full flex items-center justify-center bg-white/95 backdrop-blur-sm">
                <div className="text-center p-8">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-golf-premium mb-2">
                    {totalProfiles === 0 ? 'Inga spelare hittades' : 'Inga fler spelare'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {totalProfiles === 0 
                      ? `Det finns inga andra spelare med ${courseName} som hemmabana just nu.`
                      : 'Du har sett alla spelare från denna golfbana.'
                    }
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