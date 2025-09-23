import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Users, Crown, Search, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  user_id: string;
  isAdmin: boolean;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [datepart, setDatepart] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Admin search states
  const [adminDatepart, setAdminDatepart] = useState('');
  const [adminLastDigits, setAdminLastDigits] = useState('');
  const [foundAdminUser, setFoundAdminUser] = useState<any>(null);
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);

  console.log('AdminUserManagement - Current user is admin, checking subscription context...');
  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .not('name', 'is', null)
        .order('name');

      if (profilesError) throw profilesError;

      // Get all admin users
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(role => role.user_id) || []);

      // Only show admin users
      const usersWithRoles = profiles?.filter(profile => 
        adminUserIds.has(profile.user_id)
      ).map(profile => ({
        id: profile.user_id,
        name: profile.name,
        user_id: profile.user_id,
        isAdmin: true
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        console.log("Admin-behörighet borttagen");
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'admin' }]);

        if (error) throw error;

        console.log("Admin-behörighet tillagd");
      }

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
    }
  };

  const searchUserByGolfId = async () => {
    if (!datepart.trim() || !lastDigits.trim()) return;
    
    const fullGolfId = `${datepart.trim()}-${lastDigits.trim()}`;
    
    setSearchLoading(true);
    try {
      // Use the same RPC function as admin search for consistency
      const { data: profiles, error } = await supabase
        .rpc('search_profiles_by_golf_id', { 
          search_golf_id: fullGolfId 
        });

      if (error) {
        console.error('Search error:', error);
        setFoundUser(null);
        return;
      }

      const profile = profiles?.[0] || null;

      if (profile) {
        setFoundUser(profile);
      } else {
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setFoundUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchAdminUser = async () => {
    if (!adminDatepart.trim() || !adminLastDigits.trim()) return;
    
    const fullGolfId = `${adminDatepart.trim()}-${adminLastDigits.trim()}`;
    
    setAdminSearchLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .rpc('search_profiles_by_golf_id', { 
          search_golf_id: fullGolfId 
        });

      if (error) {
        console.error('Search error:', error);
        setFoundAdminUser(null);
        return;
      }

      const profile = profiles?.[0] || null;

      if (profile) {
        // Check if user is already admin
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('role', 'admin')
          .maybeSingle();

        setFoundAdminUser({
          ...profile,
          isAlreadyAdmin: !!existingRole
        });
      } else {
        setFoundAdminUser(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setFoundAdminUser(null);
    } finally {
      setAdminSearchLoading(false);
    }
  };

  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (error) throw error;

      console.log("Admin-behörighet tillagd");
      setFoundAdminUser(null);
      setAdminDatepart('');
      setAdminLastDigits('');
      fetchUsers(); // Refresh the admin list
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" />
            Användarhantering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">Laddar användare...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Management Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Premium-hantering
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sök användare via Golf-ID
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="w-32">
                <Input
                  placeholder="010101"
                  value={datepart}
                  onChange={(e) => setDatepart(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUserByGolfId()}
                  maxLength={6}
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="w-20">
                <Input
                  placeholder="123"
                  value={lastDigits}
                  onChange={(e) => setLastDigits(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUserByGolfId()}
                  maxLength={3}
                />
              </div>
              <Button 
                onClick={searchUserByGolfId}
                disabled={searchLoading || !datepart.trim() || !lastDigits.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Sök
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Ange Golf-ID i två delar: datum (6 siffror) + sista 3 siffrorna
            </div>
          </div>

          {foundUser && (
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{foundUser.name || 'Namnlös användare'}</h3>
                    <p className="text-sm text-muted-foreground">Golf-ID: {foundUser.golf_id}</p>
                    <div className="mt-2">
                      <Badge variant="secondary">
                        Betalningar hanteras av Apple
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Premium funktionalitet tillgänglig via Apple In-App Purchase
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Premium-hantering sker via Apple App Store
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(datepart.trim() || lastDigits.trim()) && !foundUser && !searchLoading && (
            <div className="text-center py-4 text-muted-foreground">
              Ingen användare hittades med Golf-ID: {datepart}-{lastDigits}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Management Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lägg till admin
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sök användare för att ge admin-behörighet
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="w-32">
                <Input
                  placeholder="010101"
                  value={adminDatepart}
                  onChange={(e) => setAdminDatepart(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAdminUser()}
                  maxLength={6}
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="w-20">
                <Input
                  placeholder="123"
                  value={adminLastDigits}
                  onChange={(e) => setAdminLastDigits(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAdminUser()}
                  maxLength={3}
                />
              </div>
              <Button 
                onClick={searchAdminUser}
                disabled={adminSearchLoading || !adminDatepart.trim() || !adminLastDigits.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Sök
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Ange Golf-ID i två delar: datum (6 siffror) + sista 3 siffrorna
            </div>
          </div>

          {foundAdminUser && (
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{foundAdminUser.name || 'Namnlös användare'}</h3>
                    <p className="text-sm text-muted-foreground">Golf-ID: {foundAdminUser.golf_id}</p>
                    {foundAdminUser.isAlreadyAdmin && (
                      <Badge variant="default" className="mt-2">
                        <Shield className="w-3 h-3 mr-1" />
                        Redan admin
                      </Badge>
                    )}
                  </div>
                  <div>
                    {foundAdminUser.isAlreadyAdmin ? (
                      <Button variant="secondary" disabled>
                        Redan admin
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => makeUserAdmin(foundAdminUser.user_id)}
                        variant="default"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Gör till admin
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(adminDatepart.trim() || adminLastDigits.trim()) && !foundAdminUser && !adminSearchLoading && (
            <div className="text-center py-4 text-muted-foreground">
              Ingen användare hittades med Golf-ID: {adminDatepart}-{adminLastDigits}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Admins Card */}
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Nuvarande admins
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Hantera befintliga admin-behörigheter
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || 'Namnlös användare'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => toggleAdminRole(user.user_id, true)}
                    >
                      <ShieldOff className="w-4 h-4 mr-1" />
                      Ta bort admin
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Inga admins hittades
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};