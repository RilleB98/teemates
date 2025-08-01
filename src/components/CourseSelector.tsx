import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Check, Navigation } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import course1 from "@/assets/course1.jpg";

interface Course {
  name: string;
  location: string;
  rating: number;
  difficulty: string;
  holes: number;
  price: string;
  image: string;
  latitude: number;
  longitude: number;
}

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onCourseSelect: (course: Course) => void;
}

export const CourseSelector = ({ selectedCourse, onCourseSelect }: CourseSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { location, loading, error, getCurrentPosition, calculateDistance } = useLocation();

  const nearbyCourses: Course[] = [
    {
      name: "Bro Hof Slott Golf Club",
      location: "Stockholm",
      rating: 4.9,
      difficulty: "Hard",
      holes: 18,
      price: "950 SEK",
      image: course1,
      latitude: 59.3293,
      longitude: 18.0686
    },
    {
      name: "Stockholms Golfklubb",
      location: "Stockholm kommun", 
      rating: 4.8,
      difficulty: "Hard",
      holes: 18,
      price: "900 SEK",
      image: course1,
      latitude: 59.3515,
      longitude: 18.1806
    },
    {
      name: "Rålambshovs Golf",
      location: "Stockholm kommun",
      rating: 4.2,
      difficulty: "Easy",
      holes: 9,
      price: "350 SEK",
      image: course1,
      latitude: 59.3347,
      longitude: 18.0297
    },
    {
      name: "Kaknäs Golf",
      location: "Stockholm kommun",
      rating: 4.1,
      difficulty: "Easy", 
      holes: 9,
      price: "400 SEK",
      image: course1,
      latitude: 59.3511,
      longitude: 18.1194
    },
    {
      name: "Södermalms Golfklubb",
      location: "Stockholm kommun",
      rating: 4.0,
      difficulty: "Medium",
      holes: 9,
      price: "450 SEK",
      image: course1,
      latitude: 59.3156,
      longitude: 18.0719
    },
    {
      name: "Östermalms Golf",
      location: "Stockholm kommun",
      rating: 4.3,
      difficulty: "Medium",
      holes: 9,
      price: "500 SEK",
      image: course1,
      latitude: 59.3408,
      longitude: 18.0883
    },
    {
      name: "Djurgården Golf",
      location: "Stockholm kommun",
      rating: 4.4,
      difficulty: "Easy",
      holes: 9,
      price: "550 SEK",
      image: course1,
      latitude: 59.3250,
      longitude: 18.1158
    },
    {
      name: "Vasastan Golf",
      location: "Stockholm kommun",
      rating: 4.2,
      difficulty: "Medium",
      holes: 9,
      price: "480 SEK",
      image: course1,
      latitude: 59.3444,
      longitude: 18.0528
    },
    {
      name: "Norrmalms Golfklubb",
      location: "Stockholm kommun",
      rating: 4.1,
      difficulty: "Easy",
      holes: 9,
      price: "420 SEK",
      image: course1,
      latitude: 59.3325,
      longitude: 18.0639
    },
    {
      name: "Gamla Stans Golf",
      location: "Stockholm kommun",
      rating: 4.5,
      difficulty: "Hard",
      holes: 9,
      price: "600 SEK",
      image: course1,
      latitude: 59.3258,
      longitude: 18.0719
    },
    {
      name: "Wermdö Golf & Country Club",
      location: "Stockholm",
      rating: 4.8,
      difficulty: "Medium",
      holes: 18,
      price: "850 SEK",
      image: course1,
      latitude: 59.2503,
      longitude: 18.3667
    },
    {
      name: "Djursholms Golfklubb",
      location: "Stockholm",
      rating: 4.6,
      difficulty: "Medium",
      holes: 18,
      price: "800 SEK",
      image: course1,
      latitude: 59.4006,
      longitude: 18.1289
    },
    {
      name: "Kevinge Golf & Country Club",
      location: "Stockholm",
      rating: 4.5,
      difficulty: "Easy",
      holes: 18,
      price: "700 SEK",
      image: course1,
      latitude: 59.4847,
      longitude: 17.9158
    },
    {
      name: "Österåkers Golfklubb",
      location: "Stockholm",
      rating: 4.4,
      difficulty: "Medium",
      holes: 18,
      price: "750 SEK",
      image: course1,
      latitude: 59.4583,
      longitude: 18.3333
    },
    {
      name: "Viksjö Golfklubb",
      location: "Stockholm",
      rating: 4.3,
      difficulty: "Easy",
      holes: 18,
      price: "650 SEK",
      image: course1,
      latitude: 59.4167,
      longitude: 17.8833
    },
    {
      name: "Hills Golf Club", 
      location: "Göteborg",
      rating: 4.7,
      difficulty: "Medium",
      holes: 18,
      price: "750 SEK",
      image: course1,
      latitude: 57.7089,
      longitude: 11.9746
    },
    {
      name: "Malmö Burlöv Golf Club",
      location: "Malmö", 
      rating: 4.6,
      difficulty: "Easy",
      holes: 18,
      price: "650 SEK",
      image: course1,
      latitude: 55.6050,
      longitude: 13.0038
    }
  ];

  // Sort courses by distance if user location is available
  const sortedCourses = location 
    ? [...nearbyCourses].sort((a, b) => {
        const distanceA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
        const distanceB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      })
    : nearbyCourses;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Show selected course if any */}
      {selectedCourse && (
        <Card className="border-golf-green-light bg-golf-green/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-golf-premium">Vald hemmaklubb</h4>
                <p className="text-sm text-muted-foreground">{selectedCourse.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{selectedCourse.location}</span>
                  <Star className="w-3 h-3 text-accent fill-current" />
                  <span className="text-xs">{selectedCourse.rating}</span>
                </div>
              </div>
              <Check className="w-5 h-5 text-golf-green" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course selection */}
      <div>
        <div className="flex gap-2 mb-2">
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 justify-between"
          >
            {selectedCourse ? "Ändra hemmaklubb" : "Välj hemmaklubb"}
            <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </Button>
          
          {!location && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentPosition}
              disabled={loading}
              className="px-3"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
        
        {location && (
          <p className="text-xs text-green-600 mb-2">📍 Kurser sorterade efter avstånd från din plats</p>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {sortedCourses.map((course, index) => {
              const distance = location 
                ? calculateDistance(location.latitude, location.longitude, course.latitude, course.longitude)
                : null;
              
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCourse?.name === course.name ? 'ring-2 ring-golf-green' : ''
                  }`}
                  onClick={() => {
                    onCourseSelect(course);
                    setIsExpanded(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={course.image} 
                        alt={course.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-golf-premium">{course.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{course.location}</span>
                              {distance && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-golf-green font-medium">{distance.toFixed(1)} km</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-current" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{course.holes} hål</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};