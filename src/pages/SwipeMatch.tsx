import { Navigation } from "@/components/Navigation";
import { SwipeFiltersComponent } from '@/components/SwipeFilters';
import { useSwipeProfiles } from '@/hooks/useSwipeProfiles';
import { SwipeCard } from '@/components/SwipeCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SwipeMatch = () => {
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

            {/* Profile Card with Swipe Functionality */}
            {currentProfile ? (
              <SwipeCard
                profile={currentProfile}
                onSwipeLeft={() => swipeLeft(currentProfile.user_id)}
                onSwipeRight={() => swipeRight(currentProfile.user_id)}
                onRefresh={refetch}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Laddar profil...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};