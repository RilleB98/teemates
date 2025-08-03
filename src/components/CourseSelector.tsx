import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Check, Navigation } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  location: string;
  image: string;
  latitude: number;
  longitude: number;
  hasCoordinates?: boolean;
}

interface CourseSelectorProps {
  selectedCourse: any;
  onCourseSelect: (course: any) => void;
}

export const CourseSelector = ({ selectedCourse, onCourseSelect }: CourseSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading, error, getCurrentPosition, calculateDistance } = useLocation();

  // Load courses from database
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading courses:', error);
      } else {
        const coursesWithCoordinateCheck = (data || []).map(course => ({
          ...course,
          hasCoordinates: course.latitude !== 0 && course.longitude !== 0
        }));
        setCourses(coursesWithCoordinateCheck);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses with selected course first, then by distance if user location is available
  const sortedCourses = (() => {
    let coursesToSort = [...filteredCourses];
    
    // Sort by distance if location is available (only for courses with coordinates)
    if (location) {
      coursesToSort = coursesToSort.sort((a, b) => {
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
      const selectedIndex = coursesToSort.findIndex(course => course.name === selectedCourse.name);
      if (selectedIndex > -1) {
        const [selected] = coursesToSort.splice(selectedIndex, 1);
        coursesToSort.unshift(selected);
      }
    }
    
    return coursesToSort;
  })();

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
            disabled={loading}
          >
            {loading ? "Laddar..." : selectedCourse ? "Ändra hemmaklubb" : "Välj hemmaklubb"}
            <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
          </Button>
          
          {!location && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentPosition}
              disabled={locationLoading}
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
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Laddar golfklubbar...</p>
            ) : sortedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Inga golfklubbar hittades</p>
            ) : (
              sortedCourses.map((course, index) => {
                const distance = location && course.hasCoordinates
                  ? calculateDistance(location.latitude, location.longitude, course.latitude, course.longitude)
                  : null;
                
                return (
                  <Card 
                    key={course.id || index} 
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