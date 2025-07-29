import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users } from "lucide-react";

interface CourseCardProps {
  name: string;
  location: string;
  rating: number;
  difficulty: string;
  holes: number;
  price: string;
  image: string;
  activeUsers: number;
}

export const CourseCard = ({ 
  name, 
  location, 
  rating, 
  difficulty, 
  holes, 
  price, 
  image, 
  activeUsers 
}: CourseCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-secondary';
    }
  };

  return (
    <Card className="overflow-hidden shadow-golf hover:shadow-premium transition-spring transform hover:scale-105">
      {/* Course Image */}
      <div className="relative h-48">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-golf-premium">
            <Star className="w-3 h-3 mr-1 fill-accent text-accent" />
            {rating}
          </Badge>
        </div>
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
        
        <div className="flex justify-between items-center">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
          <span className="text-sm text-muted-foreground">{holes} holes</span>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div>
            <span className="text-2xl font-bold text-golf-green">{price}</span>
            <span className="text-sm text-muted-foreground">/round</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Details
            </Button>
            <Button variant="golf" size="sm">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};