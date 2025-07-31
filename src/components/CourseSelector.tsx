import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Check } from "lucide-react";
import course1 from "@/assets/course1.jpg";

interface Course {
  name: string;
  location: string;
  rating: number;
  difficulty: string;
  holes: number;
  price: string;
  image: string;
}

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onCourseSelect: (course: Course) => void;
}

export const CourseSelector = ({ selectedCourse, onCourseSelect }: CourseSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nearbyCourses: Course[] = [
    {
      name: "Bro Hof Slott Golf Club",
      location: "Stockholm",
      rating: 4.9,
      difficulty: "Hard",
      holes: 18,
      price: "950 SEK",
      image: course1
    },
    {
      name: "Hills Golf Club", 
      location: "Göteborg",
      rating: 4.7,
      difficulty: "Medium",
      holes: 18,
      price: "750 SEK",
      image: course1
    },
    {
      name: "Malmö Burlöv Golf Club",
      location: "Malmö", 
      rating: 4.6,
      difficulty: "Easy",
      holes: 18,
      price: "650 SEK",
      image: course1
    }
  ];

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
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          {selectedCourse ? "Ändra hemmaklubb" : "Välj hemmaklubb"}
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </Button>

        {isExpanded && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {nearbyCourses.map((course, index) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};