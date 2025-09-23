import { Navigation } from "@/components/Navigation";
import { SwipeFiltersComponent } from '@/components/SwipeFilters';
import { useSwipeProfiles } from '@/hooks/useSwipeProfiles';
import { SwipeCard } from '@/components/SwipeCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, RefreshCw, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeLimit } from '@/hooks/useSwipeLimit';
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal';
import { useState } from 'react';

export const SwipeMatch = () => {
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const {
    currentProfile,
    hasMoreProfiles,
    loading,
    filters,
    setFilters,
    swipeLeft,
    swipeRight,
    refetch,
    forceRefresh,
    totalProfiles,
    currentIndex
  } = useSwipeProfiles();
  
  const {
    swipeCount,
    canSwipeYes,
    getRemainingSwipes,
    loading: swipeLoading,
    FREE_SWIPE_LIMIT
  } = useSwipeLimit();

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
                        onClick={() => forceRefresh()} 
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
              
              {/* Premium Upgrade Button */}
              {!canSwipeYes() && (
                <Button
                  onClick={() => setShowPremiumModal(true)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white mb-4"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Uppgradera till Premium - {getRemainingSwipes()} ja-swipes kvar
                </Button>
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
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};