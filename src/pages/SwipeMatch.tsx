import { Navigation } from "@/components/Navigation";
import { SwipeFiltersComponent } from '@/components/SwipeFilters';
import { useSwipeProfiles } from '@/hooks/useSwipeProfiles';
import { SwipeCard } from '@/components/SwipeCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, RefreshCw, Bug, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export const SwipeMatch = () => {
  const { user } = useAuth();
  const {
    currentProfile,
    hasMoreProfiles,
    loading,
    filters,
    setFilters,
    swipeLeft,
    swipeRight,
    refetch,
    fetchAllProfiles,
    totalProfiles,
    currentIndex,
    debugInfo
  } = useSwipeProfiles();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="pb-24 pt-8">
          <div className="container mx-auto px-4">
            <Card className="max-w-sm mx-auto">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Laddar profiler...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasMoreProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="pb-24 pt-8">
          <div className="container mx-auto px-4">
            <div className="max-w-sm mx-auto space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Golf Match</h1>
                <p className="text-muted-foreground">Hitta din nästa golfpartner</p>
              </div>

              <SwipeFiltersComponent 
                filters={filters} 
                onFiltersChange={setFilters} 
              />

                <Card className="bg-card/95 backdrop-blur-sm border-golf-green-light shadow-golf">
                  <CardContent className="p-6 xs:p-8 text-center space-y-4 xs:space-y-6">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 mx-auto bg-gradient-golf rounded-full flex items-center justify-center animate-float">
                      <Users className="h-8 w-8 xs:h-10 xs:w-10 text-white" />
                    </div>
                    <div className="space-y-3 xs:space-y-4">
                      <h3 className="text-lg xs:text-xl font-semibold text-golf-premium">Inga fler profiler</h3>
                      <p className="text-muted-foreground text-sm xs:text-base leading-relaxed">
                        Du har sett alla tillgängliga profiler med dina nuvarande filter.
                      </p>
                      <Button 
                        onClick={refetch} 
                        className="w-full bg-gradient-golf hover:shadow-golf transition-all duration-300 text-sm xs:text-base font-medium h-10 xs:h-11"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Uppdatera
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-24 pt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-4 xs:mb-6 animate-slide-up">
              <div className="flex items-center justify-center space-x-2 mb-2 xs:mb-3">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-golf rounded-full flex items-center justify-center shadow-golf animate-float">
                  <Users className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                </div>
                <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-golf-premium">Golf Match</h1>
              </div>
              <p className="text-muted-foreground text-sm xs:text-base mb-3">Hitta din nästa golfpartner</p>
            </div>

            {/* Filters */}
            <SwipeFiltersComponent 
              filters={filters} 
              onFiltersChange={setFilters} 
            />

            {/* Debug Information Panel */}
            <Card className="bg-card/95 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bug className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Debug Info</h3>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Användare:</span>
                    <span className="font-mono">{user?.id ? `${user.id.slice(0,8)}...` : 'Ingen'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profiler laddade:</span>
                    <span className="font-mono">{totalProfiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aktuell index:</span>
                    <span className="font-mono">{currentIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Har fler:</span>
                    <span className="font-mono">{hasMoreProfiles ? 'Ja' : 'Nej'}</span>
                  </div>
                  {debugInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rådata count:</span>
                        <span className="font-mono">{debugInfo.rawDataCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exkluderade vänner:</span>
                        <span className="font-mono">{debugInfo.excludedFriends || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exkluderade swipes:</span>
                        <span className="font-mono">{debugInfo.excludedSwipes || 0}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={refetch} 
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Ladda om
                  </Button>
                  <Button 
                    onClick={() => setFilters({
                      minAge: 18,
                      maxAge: 80,
                      minHandicap: 0,
                      maxHandicap: 54,
                      gender: 'all',
                      prioritizeLocalCity: false
                    })} 
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Reset filter
                  </Button>
                </div>
                <Button 
                  onClick={fetchAllProfiles} 
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs mt-2"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Visa ALLA profiler (debug)
                </Button>
              </CardContent>
            </Card>

            {/* Profile Card with Swipe Functionality */}
            {currentProfile ? (
              <SwipeCard
                profile={currentProfile}
                onSwipeLeft={() => swipeLeft(currentProfile.user_id)}
                onSwipeRight={() => swipeRight(currentProfile.user_id)}
                onRefresh={refetch}
              />
            ) : (
              <Card className="bg-card/95 backdrop-blur-sm border-golf-green-light shadow-golf">
                <CardContent className="p-6 xs:p-8 text-center">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 mx-auto bg-gradient-golf rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 xs:h-8 xs:w-8 animate-spin text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm xs:text-base">Laddar profil...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};