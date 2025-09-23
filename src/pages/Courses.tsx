import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Heart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGolfClubUsers } from "@/hooks/useGolfClubUsers";
import { useFavoriteGolfCourses } from "@/hooks/useFavoriteGolfCourses";
import { supabase } from "@/integrations/supabase/client";
import { Navigation as NavComponent } from "@/components/Navigation";
import { getGolfCourseImage } from "@/components/CourseImageManager";
import { CourseSwipeModal } from "@/components/CourseSwipeModal";
interface Course {
  id: string;
  name: string;
  location: string;
  image: string;
  latitude: number;
  longitude: number;
}
export const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [swipeModalOpen, setSwipeModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    clubUserCounts,
    loading: usersLoading
  } = useGolfClubUsers();
  const {
    favorites,
    loading: favoritesLoading,
    toggleFavorite,
    isFavorite
  } = useFavoriteGolfCourses();

  // Function to clean location text by keeping "s GDF"
  const cleanLocationText = (location: string): string => {
    return location.replace(/ss\s+GDF$/i, 's GDF'); // Convert "ss GDF" to "s GDF" and keep it
  };

  // Load courses from database
  useEffect(() => {
    loadCourses();
  }, []);
  const loadCourses = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('golf_courses').select('*').order('name');
      if (error) {
        console.error('Error loading courses:', error);
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Filter and sort courses - favorites first, then alphabetical
  const filteredAndSortedCourses = useMemo(() => {
    let coursesToFilter = [...courses];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      coursesToFilter = coursesToFilter.filter(course => course.name.toLowerCase().includes(query) || course.location.toLowerCase().includes(query));
    }

    // Sort favorites first, then alphabetically
    coursesToFilter = coursesToFilter.sort((a, b) => {
      const aIsFavorite = isFavorite(a.id);
      const bIsFavorite = isFavorite(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return a.name.localeCompare(b.name, 'sv');
    });
    return coursesToFilter;
  }, [searchQuery, courses, favorites, isFavorite]);
  const clearSearch = () => {
    setSearchQuery("");
  };
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setSwipeModalOpen(true);
  };
  const handleCloseSwipeModal = () => {
    setSwipeModalOpen(false);
    setSelectedCourse(null);
  };
  const favoriteCount = favorites.length;
  return <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <NavComponent />
      
      <div className="pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-10 animate-scale-in px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 text-shadow-lg leading-tight">
              Golfbanor i Sverige
            </h1>
            <p className="text-sm sm:text-base text-gray-600 backdrop-blur-sm bg-white/10 rounded-full px-3 sm:px-4 py-2 inline-block mt-2 max-w-full">Favorisera dina närliggande golfbanor för att hitta fler spelare i närområdet.
Du kan även klicka på en specifik bana för att se användare just på den banan!</p>
          </div>

          {/* Search */}
          <div className="relative mb-6 sm:mb-8 animate-slide-up">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 sm:w-5 h-4 sm:h-5" />
            <Input type="text" placeholder="Sök golfbana eller ort..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/95 backdrop-blur-sm text-base sm:text-lg shadow-lg border-0 focus:ring-2 focus:ring-golf-green/50 touch-manipulation" />
            {searchQuery && <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover-scale touch-manipulation">
                <X className="w-4 h-4" />
              </Button>}
          </div>

          {/* Favorites info */}
          {favoriteCount > 0 && <div className="mb-6 p-4 bg-pink-100/90 border border-pink-200 rounded-xl backdrop-blur-sm animate-fade-in">
              <p className="text-sm text-pink-700 flex items-center">
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Dina favoritbanor visas högst upp!
              </p>
            </div>}

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
            {filteredAndSortedCourses.length === 0 ? <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 animate-scale-in">
                <CardContent className="p-8 sm:p-12 text-center">
                  <Search className="w-12 sm:w-16 h-12 sm:h-16 text-muted-foreground mx-auto mb-4 sm:mb-6 animate-pulse" />
                  <h3 className="text-xl sm:text-2xl font-bold text-golf-premium mb-3 sm:mb-4">Inga resultat</h3>
                  <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
                    Försök med ett annat sökord eller rensa sökningen för att se alla banor.
                  </p>
                  {searchQuery && <Button onClick={clearSearch} className="mt-4 hover-scale touch-manipulation">
                      Visa alla banor
                    </Button>}
                </CardContent>
              </Card> : filteredAndSortedCourses.map((course, index) => {
            const isCourseFavorite = isFavorite(course.id);
            return <Card key={course.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover-scale group animate-fade-in touch-manipulation active:scale-95" style={{
              animationDelay: `${index * 100}ms`
            }} onClick={() => handleCourseClick(course)}>
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                      <div className="flex gap-3 sm:gap-4 lg:gap-6">
                        <div className="relative group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                          <img src={getGolfCourseImage(course.image, course.name, index)} alt={course.name} className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl object-cover shadow-lg" />
                          <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-golf-green/20 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0 mr-2">
                              <h3 className="text-lg sm:text-xl font-bold text-golf-premium group-hover:text-golf-green transition-colors duration-300 truncate">
                                {course.name}
                              </h3>
                              <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-golf-green flex-shrink-0" />
                                <span className="font-medium truncate">{cleanLocationText(course.location)}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(course.id);
                      }} className="flex-shrink-0 hover-scale p-2">
                              <Heart className={`w-5 h-5 transition-colors duration-200 ${isCourseFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                            {isCourseFavorite && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                ❤️ Favorit
                              </Badge>}
                            <span className="text-muted-foreground font-medium text-sm">Golfbana</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
                              <span className="mr-1 sm:mr-2">👥</span>
                              <span>TeeMates Användare: {clubUserCounts[course.name] || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
          })}
          </div>
        </div>
      </div>

      {/* Course Swipe Modal */}
      {selectedCourse && <CourseSwipeModal isOpen={swipeModalOpen} onClose={handleCloseSwipeModal} courseName={selectedCourse.name} courseLocation={cleanLocationText(selectedCourse.location)} />}
    </div>;
};