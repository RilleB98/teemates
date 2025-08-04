import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  location: string;
  image: string;
  latitude: number;
  longitude: number;
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
        setCourses(data || []);
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

  // Sort courses with selected course first, then alphabetically
  const sortedCourses = (() => {
    let coursesToSort = [...filteredCourses];
    
    // Sort alphabetically
    coursesToSort = coursesToSort.sort((a, b) => 
      a.name.localeCompare(b.name, 'sv')
    );
    
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
        </div>

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
              sortedCourses.map((course, index) => (
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
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};