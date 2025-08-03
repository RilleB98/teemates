import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export const GeocodingManager = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Load courses from database
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from('golf_courses')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load golf courses",
        variant: "destructive",
      });
    } else {
      setCourses(data || []);
    }
  };

  const handleStartGeocoding = async () => {
    setIsGeocoding(true);
    setProgress(0);
    setResults([]);

    try {
      toast({
        title: "Geocoding Started",
        description: "Starting automatic geocoding of all golf courses that need coordinates.",
      });

      // Call the edge function to start geocoding
      const { data, error } = await supabase.functions.invoke('geocode-golf-courses');

      if (error) {
        throw error;
      }

      setResults(data.results || []);
      setProgress(100);

      // Reload courses to show updated data
      await loadCourses();

      toast({
        title: "Geocoding Complete",
        description: `${data.message}. Successfully geocoded ${data.stats?.successful || 0} courses, ${data.stats?.approximate || 0} used approximate coordinates.`,
      });

    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Geocoding Error",
        description: error.message || "An error occurred during geocoding. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const coursesWithCoordinates = courses.filter(course => 
    course.latitude !== 0 && course.longitude !== 0
  );
  
  const coursesWithoutCoordinates = courses.filter(course => 
    course.latitude === 0 || course.longitude === 0
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Golf Club Geocoding Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Clubs with coordinates: <strong>{coursesWithCoordinates.length}</strong></p>
          <p>Clubs without coordinates: <strong>{coursesWithoutCoordinates.length}</strong></p>
          <p>Total clubs in database: <strong>{courses.length}</strong></p>
        </div>

        {coursesWithoutCoordinates.length > 0 ? (
          !isGeocoding ? (
            <Button 
              onClick={handleStartGeocoding}
              className="w-full"
              size="lg"
            >
              Start Geocoding ({coursesWithoutCoordinates.length} clubs)
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Processing golf clubs and updating database automatically...
              </div>
              
              <Button 
                disabled 
                className="w-full"
                size="lg"
              >
                Geocoding in progress...
              </Button>
            </div>
          )
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✅ All golf courses have coordinates!</p>
            <p className="text-green-700 text-sm mt-1">
              All {courses.length} golf courses in the database now have geocoded coordinates.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Results Summary</h3>
            <div className="text-sm space-y-1">
              <p>Total processed: {results.length}</p>
              <p>Successfully geocoded: {results.filter(r => r.success).length}</p>
              <p>Approximated coordinates: {results.filter(r => !r.success).length}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All results have been automatically updated in the database. The app now uses the live geocoded data.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Note:</strong> This process automatically geocodes golf courses using OpenStreetMap's Nominatim service and updates the database in real-time. The app will immediately use the new coordinates.</p>
        </div>
      </CardContent>
    </Card>
  );
};