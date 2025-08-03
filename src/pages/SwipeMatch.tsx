import { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { SwipeFiltersComponent } from '@/components/SwipeFilters';
import { useSwipeProfiles } from '@/hooks/useSwipeProfiles';
import { SwipeMatchPreview } from '@/components/SwipeMatchPreview';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Heart, RefreshCw, X, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const SwipeMatch = () => {
  const [isInIframe, setIsInIframe] = useState(true); // Force preview mode

  useEffect(() => {
    // Always assume iframe for now to debug
    setIsInIframe(true);
  }, []);

  // Always show simple version for now
  if (true) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Golf Match - Preview</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center mb-4">Detta är en förenklad version för preview.</p>
            <p className="text-center text-sm text-gray-600">Öppna webbplatsen för full funktionalitet.</p>
          </div>
        </div>
      </div>
    );
  }

  // Only use hooks in non-iframe environment
  const {
    currentProfile,
    hasMoreProfiles,
    loading,
    filters,
    setFilters,
    swipeLeft,
    swipeRight,
    refetch,
    totalProfiles,
    currentIndex
  } = useSwipeProfiles();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
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
      <div className="min-h-screen bg-gradient-subtle">
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

              <Card>
                <CardContent className="p-8 text-center space-y-4">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Inga fler profiler</h3>
                    <p className="text-muted-foreground mb-4">
                      Du har sett alla tillgängliga profiler med dina nuvarande filter.
                    </p>
                    <Button onClick={refetch} className="w-full">
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
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24 pt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Golf Match</h1>
              <p className="text-muted-foreground">Hitta din nästa golfpartner</p>
              
              {totalProfiles > 0 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline">
                    {currentIndex + 1} av {totalProfiles}
                  </Badge>
                </div>
              )}
            </div>

            {/* Filters */}
            <SwipeFiltersComponent 
              filters={filters} 
              onFiltersChange={setFilters} 
            />

            {/* Profile Card */}
            {currentProfile ? (
              <div className="space-y-4">
                <Card className="h-[500px] shadow-xl border-2 border-muted overflow-hidden bg-white">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Profile Image */}
                    <div className="relative h-2/3 bg-gradient-to-br from-gray-100 to-gray-200">
                      {currentProfile.avatar_url ? (
                        <img 
                          src={currentProfile.avatar_url} 
                          alt={currentProfile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                          <Avatar className="w-32 h-32">
                            <AvatarFallback className="text-4xl">
                              {currentProfile.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="h-1/3 p-4 bg-white flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-foreground">
                            {currentProfile.name || 'Okänd användare'}
                          </h3>
                          {currentProfile.age && (
                            <span className="text-lg text-muted-foreground">{currentProfile.age}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.handicap !== null && currentProfile.handicap !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              HCP {currentProfile.handicap}
                            </Badge>
                          )}
                          {currentProfile.gender && (
                            <Badge variant="secondary" className="text-xs">
                              {currentProfile.gender === 'man' ? 'Man' : currentProfile.gender === 'kvinna' ? 'Kvinna' : currentProfile.gender}
                            </Badge>
                          )}
                        </div>
                        
                        {currentProfile.home_club && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {currentProfile.home_club}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      console.log('Left button clicked');
                      swipeLeft(currentProfile.user_id);
                    }}
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hoppa över
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Right button clicked');
                      swipeRight(currentProfile.user_id);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Skicka förfrågan
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Laddar profil...</p>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Hoppa över</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Skicka förfrågan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};