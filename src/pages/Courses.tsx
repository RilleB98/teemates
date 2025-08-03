import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Star, Navigation, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/useLocation";
import { golfCourses, Course } from "@/data/golfCourses";
import { Navigation as NavComponent } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

export const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { location, loading, error, getCurrentPosition, calculateDistance } = useLocation();

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let courses = [...golfCourses];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      courses = courses.filter(course => 
        course.name.toLowerCase().includes(query) ||
        course.location.toLowerCase().includes(query) ||
        course.difficulty.toLowerCase().includes(query)
      );
    }

    // Sort by distance if location is available
    if (location) {
      courses = courses.sort((a, b) => {
        const distanceA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
        const distanceB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
    }

    return courses;
  }, [searchQuery, location, calculateDistance]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-secondary';
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <NavComponent />
      
      <div className="pb-24"> {/* Account for fixed bottom navigation */}
        <Hero />
        
        <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>
          
          {!location && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentPosition}
              disabled={loading}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {loading ? "Hämtar..." : "Hitta närliggande"}
            </Button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Golfbanor i Sverige</h1>
          <p className="text-white/80">
            {golfCourses.length} golfbanor att upptäcka
            {location && " • Sorterade efter avstånd"}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Sök på golfbana, ort eller svårighetsgrad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-white/95 backdrop-blur-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Location status */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {location && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">📍 Banor sorterade efter avstånd från din plats</p>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4">
          <p className="text-white/80 text-sm">
            {searchQuery ? `${filteredAndSortedCourses.length} resultat för "${searchQuery}"` : `Visar alla ${filteredAndSortedCourses.length} golfbanor`}
          </p>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {filteredAndSortedCourses.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-golf-premium mb-2">Inga resultat</h3>
                <p className="text-muted-foreground">
                  Försök med ett annat sökord eller rensa sökningen för att se alla banor.
                </p>
                {searchQuery && (
                  <Button onClick={clearSearch} className="mt-4">
                    Visa alla banor
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedCourses.map((course, index) => {
              const distance = location 
                ? calculateDistance(location.latitude, location.longitude, course.latitude, course.longitude)
                : null;
              
              return (
                <Card 
                  key={index} 
                  className="bg-white/95 backdrop-blur-sm border-golf-green-light hover:shadow-lg transition-all cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img 
                        src={course.image} 
                        alt={course.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-golf-premium">{course.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{course.location}</span>
                              {distance && (
                                <>
                                  <span>•</span>
                                  <span className="text-golf-green font-medium">{distance.toFixed(1)} km</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-current" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{course.holes} hål</span>
                          <span className="text-sm font-medium text-golf-green">{course.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Klicka för mer information
                          </div>
                          {distance && distance < 10 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Närliggande
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        </div>
      </div>
    </div>
  );
};