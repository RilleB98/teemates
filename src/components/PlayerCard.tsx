import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Trophy } from "lucide-react";

interface PlayerCardProps {
  name: string;
  age: number;
  handicap: number;
  location: string;
  favoritesCourse: string;
  profileImage: string;
  rating: number;
  achievements: string[];
}

export const PlayerCard = ({ 
  name, 
  age, 
  handicap, 
  location, 
  favoritesCourse, 
  profileImage, 
  rating,
  achievements 
}: PlayerCardProps) => {
  return (
    <Card className="max-w-sm mx-auto bg-gradient-card shadow-premium hover:shadow-golf transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-2 overflow-hidden group">
      {/* Profile Image */}
      <div className="relative h-64 bg-golf-green-light">
        <img 
          src={profileImage} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-golf-premium">
            <Star className="w-3 h-3 mr-1 fill-accent text-accent" />
            {rating}
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-golf-premium">{name}, {age}</h3>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-golf-green-light rounded-lg">
            <div className="text-2xl font-bold text-golf-green">{handicap}</div>
            <div className="text-xs text-golf-premium uppercase tracking-wide">Handicap</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg">
            <Trophy className="w-6 h-6 mx-auto text-accent mb-1" />
            <div className="text-xs text-golf-premium uppercase tracking-wide">Achievements</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-golf-premium mb-2">Favorite Course</h4>
          <p className="text-sm text-muted-foreground">{favoritesCourse}</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {achievements.slice(0, 2).map((achievement, index) => (
            <Badge key={index} variant="outline" className="text-xs border-golf-green text-golf-green">
              {achievement}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="golf" className="flex-1">
            Connect
          </Button>
          <Button variant="outline" className="flex-1">
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};