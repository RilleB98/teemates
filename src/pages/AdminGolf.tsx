import { Navigation } from "@/components/Navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, UserCheck, UserX, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminUserManagement } from "@/components/AdminUserManagement";

export const AdminGolf = () => {
  const { isAdmin, loading } = useUserRole();
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeProfiles: 0,
    incompleteProfiles: 0,
    premiumUsers: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUserStats();

      // Lyssna på realtime-ändringar i profiles tabellen
      const channel = supabase
        .channel('admin_profiles_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log('Profile updated, refreshing admin stats...');
            fetchUserStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true);
      
      // Use the secure admin function to get accurate stats
      const { data, error } = await supabase
        .rpc('get_admin_user_stats');

      if (error) {
        console.error('Error fetching user stats:', error);
        return;
      }

      const stats = data?.[0];
      if (stats) {
        setUserStats({
          totalUsers: Number(stats.total_users || 0),
          activeProfiles: Number(stats.active_profiles || 0),
          incompleteProfiles: Number(stats.incomplete_profiles || 0),
          premiumUsers: 0 // Premium functionality removed - payments handled by Apple
        });
      }
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
      
      <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 text-shadow-lg">
              Admin Dashboard
            </h1>
            <p className="text-white/80 text-lg">Översikt över appens användare</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Premium Users */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Premium-användare
                </CardTitle>
                <Crown className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? "..." : userStats.premiumUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Användare med aktiv prenumeration
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
          
          {/* User Management Section */}
          <div className="mt-8">
            <AdminUserManagement />
          </div>
        </div>
      </div>
    </div>
  );
};