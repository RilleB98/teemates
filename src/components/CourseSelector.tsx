import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Check, Navigation } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { golfCourses, Course } from "@/data/golfCourses";
import { swedishGolfClubs } from "@/data/swedishGolfCourses";

interface CourseSelectorProps {
  selectedCourse: any;
  onCourseSelect: (course: any) => void;
}

export const CourseSelector = ({ selectedCourse, onCourseSelect }: CourseSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { location, loading, error, getCurrentPosition, calculateDistance } = useLocation();

  // Combine all courses - detailed ones first, then all Swedish clubs
  const allCourses = [
    ...golfCourses.map(course => ({ 
      ...course, 
      hasCoordinates: true 
    })),
    ...swedishGolfClubs
      .filter(club => !golfCourses.some(course => course.name === club.name))
      .map(club => ({ 
        ...club, 
        image: "/placeholder.svg",
        latitude: 0,
        longitude: 0,
        hasCoordinates: false
      }))
  ];

  // Filter courses based on search query
  const filteredCourses = allCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses with selected course first, then by distance if user location is available
  const sortedCourses = (() => {
    let courses = [...filteredCourses];
    
    // Sort by distance if location is available (only for courses with coordinates)
    if (location) {
      courses = courses.sort((a, b) => {
        if (!a.hasCoordinates && !b.hasCoordinates) return 0;
        if (!a.hasCoordinates) return 1;
        if (!b.hasCoordinates) return -1;
        
        const distanceA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
        const distanceB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
    }
    
    // Move selected course to top if it exists
    if (selectedCourse) {
      const selectedIndex = courses.findIndex(course => course.name === selectedCourse.name);
      if (selectedIndex > -1) {
        const [selected] = courses.splice(selectedIndex, 1);
        courses.unshift(selected);
      }
    }
    
    return courses;
  })();

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
                <h4 className="font-semibold text-golf-premium">{selectedCourse.name}</h4>
                <p className="text-sm text-muted-foreground">Vald hemmaklubb</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{selectedCourse.location}</span>
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
          <div className="mb-4">
            <input
              type="text"
              placeholder="Sök golfklubb..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {sortedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Inga golfklubbar hittades</p>
            ) : (
              sortedCourses.map((course, index) => {
                const distance = location && course.hasCoordinates
                  ? calculateDistance(location.latitude, location.longitude, course.latitude, course.longitude)
                  : null;
                
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md hover:bg-gray-50 ${
                      selectedCourse?.name === course.name ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      onCourseSelect(course);
                      setIsExpanded(false);
                      setSearchQuery("");
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{course.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{course.location}</span>
                          </div>
                        </div>
                        {distance ? (
                          <div className="text-right">
                            <span className="text-sm text-primary font-medium">{distance.toFixed(1)} km</span>
                            <p className="text-xs text-muted-foreground">avstånd</p>
                          </div>
                        ) : course.hasCoordinates === false ? (
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">Ingen distansdata</span>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};