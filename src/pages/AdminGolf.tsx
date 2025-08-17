import { Navigation } from "@/components/Navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AdminGolf = () => {
  const { isAdmin, loading } = useUserRole();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeProfiles: 0,
    incompleteProfiles: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUserStats();
    }
  }, [isAdmin]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      
      // Get total users from auth.users (we can count profiles instead since they're created for each user)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get profiles with complete information
      const { count: activeProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('name', 'is', null)
        .not('birth_date', 'is', null)
        .not('gender', 'is', null)
        .not('handicap', 'is', null)
        .not('home_city', 'is', null);

      // Calculate incomplete profiles
      const incompleteProfiles = (totalUsers || 0) - (activeProfiles || 0);

      setUserStats({
        totalUsers: totalUsers || 0,
        activeProfiles: activeProfiles || 0,
        incompleteProfiles
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-lg">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        
        <div className="pb-24 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-4">
                  Åtkomst nekad
                </h1>
                <p className="text-red-600 mb-6">
                  Du har inte behörighet att komma åt admin-funktionaliteten. 
                  Kontakta en administratör för att få tillgång.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-6 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 text-shadow-lg">
              Admin Dashboard
            </h1>
            <p className="text-white/80 text-lg">Översikt över appens användare</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totalt antal användare
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? "..." : userStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alla registrerade användare
                </p>
              </CardContent>
            </Card>

            {/* Active Profiles */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Kompletta profiler
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? "..." : userStats.activeProfiles}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Användare med fullständig profil
                </p>
              </CardContent>
            </Card>

            {/* Incomplete Profiles */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ofullständiga profiler
                </CardTitle>
                <UserX className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {statsLoading ? "..." : userStats.incompleteProfiles}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Användare som inte fyllt i all information
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                Användarstatistik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Andel kompletta profiler:</span>
                  <span className="font-medium">
                    {statsLoading ? "..." : `${userStats.totalUsers > 0 ? Math.round((userStats.activeProfiles / userStats.totalUsers) * 100) : 0}%`}
                  </span>
                </div>
                
                {!statsLoading && userStats.totalUsers > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(userStats.activeProfiles / userStats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};