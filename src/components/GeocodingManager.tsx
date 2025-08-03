import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { swedishGolfClubs } from "@/data/swedishGolfCourses";
import { golfCourses } from "@/data/golfCourses";
import { batchGeocodeGolfClubs, getApproximateCoordinates } from "@/utils/geocodingService";

export const GeocodingManager = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentClub, setCurrentClub] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleStartGeocoding = async () => {
    setIsGeocoding(true);
    setProgress(0);
    setResults([]);

    try {
      // Filter out clubs that already have coordinates in golfCourses
      const existingClubNames = golfCourses.map(course => course.name);
      const clubsToGeocode = swedishGolfClubs.filter(
        club => !existingClubNames.includes(club.name)
      );

      toast({
        title: "Geocoding Started",
        description: `Starting to geocode ${clubsToGeocode.length} golf clubs. This will take about ${Math.ceil(clubsToGeocode.length / 60)} minutes.`,
      });

      const geocodedResults = await batchGeocodeGolfClubs(
        clubsToGeocode,
        (completed, total, current) => {
          setProgress((completed / total) * 100);
          setCurrentClub(current);
        }
      );

      // Add approximate coordinates for failed geocoding attempts
      const finalResults = geocodedResults.map(result => {
        if (!result.success) {
          const approxCoords = getApproximateCoordinates(result.location);
          return {
            ...result,
            latitude: approxCoords.latitude,
            longitude: approxCoords.longitude,
            success: false,
            approximated: true
          };
        }
        return { ...result, approximated: false };
      });

      setResults(finalResults);

      const successCount = finalResults.filter(r => r.success).length;
      const approximatedCount = finalResults.filter(r => r.approximated).length;

      toast({
        title: "Geocoding Complete",
        description: `Successfully geocoded ${successCount} clubs, ${approximatedCount} used approximate coordinates.`,
      });

      // Generate TypeScript code for the new coordinates
      generateCoordinatesCode(finalResults);

    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Geocoding Error",
        description: "An error occurred during geocoding. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
      setCurrentClub("");
    }
  };

  const generateCoordinatesCode = (geocodedResults: any[]) => {
    const codeLines = geocodedResults.map(result => {
      const comment = result.approximated ? "  // Approximate coordinates" : "";
      return `  {
    name: "${result.name}",
    location: "${result.location}",
    image: course1,
    latitude: ${result.latitude.toFixed(6)},
    longitude: ${result.longitude.toFixed(6)}${comment}
  }`;
    });

    const fullCode = `// Updated golf courses with geocoded coordinates
export const extendedGolfCourses: Course[] = [
  // Existing courses with verified coordinates
  ...golfCourses,
  
  // Newly geocoded courses
${codeLines.join(',\n')}
];`;

    console.log("Generated coordinates code:");
    console.log(fullCode);
    
    // Also create a downloadable file
    const blob = new Blob([fullCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geocoded-golf-courses.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clubsWithoutCoordinates = swedishGolfClubs.filter(
    club => !golfCourses.some(course => course.name === club.name)
  ).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Golf Club Geocoding Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Clubs with coordinates: <strong>{golfCourses.length}</strong></p>
          <p>Clubs without coordinates: <strong>{clubsWithoutCoordinates}</strong></p>
        </div>

        {!isGeocoding ? (
          <Button 
            onClick={handleStartGeocoding}
            className="w-full"
            size="lg"
          >
            Start Geocoding All Golf Clubs
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
            
            {currentClub && (
              <div className="text-sm text-muted-foreground">
                Currently processing: <strong>{currentClub}</strong>
              </div>
            )}
            
            <Button 
              disabled 
              className="w-full"
              size="lg"
            >
              Geocoding in progress...
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Results Summary</h3>
            <div className="text-sm space-y-1">
              <p>Total processed: {results.length}</p>
              <p>Successfully geocoded: {results.filter(r => r.success).length}</p>
              <p>Approximated coordinates: {results.filter(r => r.approximated).length}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The TypeScript code has been generated and downloaded. Check your Downloads folder for 'geocoded-golf-courses.ts'.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Note:</strong> This process uses OpenStreetMap's Nominatim service and respects their usage limits (1 request per second). The entire process will take approximately {Math.ceil(clubsWithoutCoordinates / 60)} minutes.</p>
        </div>
      </CardContent>
    </Card>
  );
};
