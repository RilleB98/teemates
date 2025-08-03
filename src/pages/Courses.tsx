import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Navigation, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/useLocation";
import { golfCourses, Course } from "@/data/golfCourses";
import { Navigation as NavComponent } from "@/components/Navigation";


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
        course.location.toLowerCase().includes(query)
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
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <NavComponent />
      
      <div className="pb-24 pt-4"> {/* Account for fixed bottom navigation */}
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-end mb-6 sm:mb-8 animate-fade-in">
          {!location && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentPosition}
              disabled={loading}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover-scale backdrop-blur-sm touch-manipulation"
            >
              <Navigation className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{loading ? "Hämtar..." : "Hitta närliggande"}</span>
              <span className="sm:hidden">📍</span>
            </Button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8 sm:mb-10 animate-scale-in px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-shadow-lg leading-tight">
            Golfbanor i Sverige
          </h1>
          <p className="text-lg sm:text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-4 sm:px-6 py-2 inline-block max-w-full">
            <span className="hidden sm:inline">{golfCourses.length} golfbanor att upptäcka</span>
            <span className="sm:hidden">{golfCourses.length} banor</span>
            {location && (
              <>
                <span className="hidden sm:inline"> • Sorterade efter avstånd</span>
                <span className="sm:hidden"> • Närhet</span>
              </>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 sm:mb-8 animate-slide-up">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 sm:w-5 h-4 sm:h-5" />
          <Input
            type="text"
            placeholder="Sök golfbana, ort eller svårighetsgrad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/95 backdrop-blur-sm text-base sm:text-lg shadow-lg border-0 focus:ring-2 focus:ring-golf-green/50 touch-manipulation"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover-scale touch-manipulation"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Location status */}
        {error && (
          <div className="mb-6 p-4 bg-red-100/90 border border-red-200 rounded-xl backdrop-blur-sm animate-fade-in">
            <p className="text-sm text-red-700 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}
        
        {location && (
          <div className="mb-6 p-4 bg-green-100/90 border border-green-200 rounded-xl backdrop-blur-sm animate-fade-in">
            <p className="text-sm text-green-700 flex items-center">
              <span className="mr-2">📍</span>
              Banor sorterade efter avstånd från din plats
            </p>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 sm:mb-6 animate-fade-in">
          <p className="text-white/90 text-base sm:text-lg font-medium backdrop-blur-sm bg-white/10 rounded-full px-3 sm:px-4 py-2 inline-block">
            <span className="hidden sm:inline">
              {searchQuery ? `${filteredAndSortedCourses.length} resultat för "${searchQuery}"` : `Visar alla ${filteredAndSortedCourses.length} golfbanor`}
            </span>
            <span className="sm:hidden">
              {searchQuery ? `${filteredAndSortedCourses.length} resultat` : `${filteredAndSortedCourses.length} banor`}
            </span>
          </p>
        </div>

        {/* Course List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredAndSortedCourses.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
              <CardContent className="p-8 sm:p-12 text-center">
                <Search className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mx-auto mb-4 sm:mb-6 animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-bold text-golf-premium mb-3 sm:mb-4">Inga resultat</h3>
                <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
                  Försök med ett annat sökord eller rensa sökningen för att se alla banor.
                </p>
                {searchQuery && (
                  <Button onClick={clearSearch} className="mt-4 hover-scale touch-manipulation">
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
                  className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover-scale group animate-fade-in touch-manipulation active:scale-95"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex gap-3 sm:gap-4 lg:gap-6">
                      <div className="relative group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                        <img 
                          src={course.image} 
                          alt={course.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl object-cover shadow-lg"
                        />
                        <div className="absolute inset-0 bg-golf-green/20 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0 mr-2">
                            <h3 className="text-lg sm:text-xl font-bold text-golf-premium group-hover:text-golf-green transition-colors duration-300 truncate">
                              {course.name}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-golf-green flex-shrink-0" />
                              <span className="font-medium truncate">{course.location}</span>
                              {distance && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="text-golf-green font-bold bg-golf-green/10 px-2 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                                    {distance.toFixed(1)} km
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 bg-accent/10 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                            <Navigation className="w-3 sm:w-4 h-3 sm:h-4 text-accent" />
                            <span className="font-bold text-accent text-sm">
                              {location ? `${calculateDistance(location.latitude, location.longitude, course.latitude, course.longitude).toFixed(1)} km` : 'Okänd distans'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                          <span className="text-muted-foreground font-medium text-sm">Golfbana</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="mr-1 sm:mr-2">👆</span>
                            <span className="hidden sm:inline">Klicka för mer information</span>
                            <span className="sm:hidden">Mer info</span>
                          </div>
                          {distance && distance < 10 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse text-xs whitespace-nowrap">
                              ⭐ <span className="hidden sm:inline">Närliggande</span><span className="sm:hidden">Nära</span>
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