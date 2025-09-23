import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Crown } from "lucide-react";
import { useState } from "react";
import { CourseSwipeModal } from "./CourseSwipeModal";
import { usePremium } from "@/hooks/usePremium";
import { PremiumUpgradeModal } from "./PremiumUpgradeModal";

interface CourseCardProps {
  name: string;
  location: string;
  image: string;
  activeUsers: number;
  onSwipeClick?: () => void;
}

export const CourseCard = ({ 
  name, 
  location, 
  image, 
  activeUsers,
  onSwipeClick
}: CourseCardProps) => {
  const { isPremium } = usePremium();
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleSwipeClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setShowSwipeModal(true);
    onSwipeClick?.();
  };
  return (
    <Card className="overflow-hidden shadow-golf hover:shadow-premium transition-spring transform hover:scale-105">
      {/* Course Image */}
      <div className="relative h-40 sm:h-48 md:h-52">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <Badge className="bg-golf-green text-white text-xs sm:text-sm">
            <Users className="w-3 h-3 mr-1" />
            {activeUsers} active
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-golf-premium">{name}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">{location}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2 sm:pt-4">
          <Button variant="outline" size="sm" className="flex-1 text-sm sm:text-base touch-target">
            Visa detaljer
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 text-sm sm:text-base touch-target"
            onClick={handleSwipeClick}
          >
            {isPremium ? (
              <>
                <Users className="w-4 h-4 mr-2" />
                Swipa här
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Premium krävs
              </>
            )}
          </Button>
        </div>
      </div>

      <CourseSwipeModal
        isOpen={showSwipeModal}
        onClose={() => setShowSwipeModal(false)}
        courseName={name}
        courseLocation={location}
      />
      
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </Card>
  );
};