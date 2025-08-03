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
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <NavComponent />
      
      <div className="pb-24"> {/* Account for fixed bottom navigation */}
        
        <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/20 hover-scale backdrop-blur-sm"
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
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover-scale backdrop-blur-sm"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {loading ? "Hämtar..." : "Hitta närliggande"}
            </Button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-10 animate-scale-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-lg">
            Golfbanor i Sverige
          </h1>
          <p className="text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-6 py-2 inline-block">
            {golfCourses.length} golfbanor att upptäcka
            {location && " • Sorterade efter avstånd"}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 animate-slide-up">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Sök på golfbana, ort eller svårighetsgrad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm text-lg shadow-lg border-0 focus:ring-2 focus:ring-golf-green/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover-scale"
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
        <div className="mb-6 animate-fade-in">
          <p className="text-white/90 text-lg font-medium backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 inline-block">
            {searchQuery ? `${filteredAndSortedCourses.length} resultat för "${searchQuery}"` : `Visar alla ${filteredAndSortedCourses.length} golfbanor`}
          </p>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          {filteredAndSortedCourses.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold text-golf-premium mb-4">Inga resultat</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Försök med ett annat sökord eller rensa sökningen för att se alla banor.
                </p>
                {searchQuery && (
                  <Button onClick={clearSearch} className="mt-4 hover-scale">
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
                  className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover-scale group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex gap-6">
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={course.image} 
                          alt={course.name}
                          className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-golf-green/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-golf-premium group-hover:text-golf-green transition-colors duration-300">
                              {course.name}
                            </h3>
                            <div className="flex items-center gap-3 text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4 text-golf-green" />
                              <span className="font-medium">{course.location}</span>
                              {distance && (
                                <>
                                  <span>•</span>
                                  <span className="text-golf-green font-bold bg-golf-green/10 px-2 py-1 rounded-full text-sm">
                                    {distance.toFixed(1)} km
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-accent fill-current" />
                            <span className="font-bold text-accent">{course.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant="outline" className={`${getDifficultyColor(course.difficulty)} font-semibold`}>
                            {course.difficulty}
                          </Badge>
                          <span className="text-muted-foreground font-medium">{course.holes} hål</span>
                          <span className="text-golf-green font-bold text-lg">{course.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="mr-2">👆</span>
                            Klicka för mer information
                          </div>
                          {distance && distance < 10 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                              ⭐ Närliggande
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