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
      <div className="relative h-48">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-golf-green text-white">
            <Users className="w-3 h-3 mr-1" />
            {activeUsers} active
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-golf-premium">{name}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="golf" size="sm" className="w-full">
            Visa detaljer
          </Button>
        </div>
      </div>
    </Card>
  );
};