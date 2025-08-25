import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users } from "lucide-react";

interface CourseCardProps {
  name: string;
  location: string;
  image: string;
  activeUsers: number;
}

export const CourseCard = ({ 
  name, 
  location, 
  image, 
  activeUsers 
}: CourseCardProps) => {
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
        
        <div className="flex justify-center pt-2 sm:pt-4">
          <Button variant="golf" size="sm" className="w-full text-sm sm:text-base touch-target">
            Visa detaljer
          </Button>
        </div>
      </div>
    </Card>
  );
};