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
  const [golfIdSearch, setGolfIdSearch] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

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

      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        name: profile.name,
        user_id: profile.user_id,
        isAdmin: adminUserIds.has(profile.user_id)
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
    if (!golfIdSearch.trim()) return;
    
    setSearchLoading(true);
    try {
      // First try to search by golf_id
      let profile = null;
      let error = null;

      const { data: golfIdProfile, error: golfIdError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          name,
          golf_id,
          email:user_id (
            email
          )
        `)
        .eq('golf_id', golfIdSearch.trim())
        .maybeSingle();

      if (golfIdProfile) {
        profile = golfIdProfile;
      } else {
        // If no golf_id match, try searching by name (case-insensitive)
        const { data: nameProfile, error: nameError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            name,
            golf_id,
            email:user_id (
              email
            )
          `)
          .ilike('name', `%${golfIdSearch.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (nameProfile) {
          profile = nameProfile;
        } else {
          error = nameError;
        }
      }

      if (error && !profile) {
        console.error('Search error:', error);
        setFoundUser(null);
        return;
      }

      if (profile) {
        // Get current subscription status
        const { data: subscription } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', profile.user_id)
          .single();

        setFoundUser({
          ...profile,
          subscription: subscription || null
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setFoundUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const addUserToPremium = async (userId: string, userName: string) => {
    try {
      // Get user's email from auth or profile
      const { data: user } = await supabase.auth.admin.getUserById(userId);
      const email = user.user?.email;

      if (!email) {
        console.error('No email found for user');
        return;
      }

      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: userId,
          email: email,
          subscribed: true,
          subscription_tier: 'Admin Premium',
          subscription_end: null, // No expiry for admin-granted premium
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      console.log(`${userName} har lagts till i premium`);
      
      // Refresh found user data
      if (foundUser && foundUser.user_id === userId) {
        await searchUserByGolfId();
      }
    } catch (error) {
      console.error('Error adding user to premium:', error);
      console.log("Kunde inte lägga till användaren i premium");
    }
  };

  const removeUserFromPremium = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      console.log(`${userName} har tagits bort från premium`);
      
      // Refresh found user data
      if (foundUser && foundUser.user_id === userId) {
        await searchUserByGolfId();
      }
    } catch (error) {
      console.error('Error removing user from premium:', error);
      console.log("Kunde inte ta bort användaren från premium");
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
            Sök användare via Golf-ID eller namn
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ange Golf-ID eller namn..."
              value={golfIdSearch}
              onChange={(e) => setGolfIdSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUserByGolfId()}
            />
            <Button 
              onClick={searchUserByGolfId}
              disabled={searchLoading || !golfIdSearch.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Sök
            </Button>
          </div>

          {foundUser && (
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{foundUser.name || 'Namnlös användare'}</h3>
                    <p className="text-sm text-muted-foreground">Golf-ID: {foundUser.golf_id}</p>
                    <div className="mt-2">
                      {foundUser.subscription?.subscribed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium ({foundUser.subscription.subscription_tier})
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inte premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {foundUser.subscription?.subscribed ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeUserFromPremium(foundUser.user_id, foundUser.name)}
                      >
                        Ta bort premium
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addUserToPremium(foundUser.user_id, foundUser.name)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Lägg till premium
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {golfIdSearch && !foundUser && !searchLoading && (
            <div className="text-center py-4 text-muted-foreground">
              Ingen användare hittades med Golf-ID: {golfIdSearch}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Management Card */}
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Användarhantering
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Hantera admin-behörigheter för användare
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || 'Namnlös användare'}
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge variant="default" className="bg-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Användare
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={user.isAdmin ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleAdminRole(user.user_id, user.isAdmin)}
                    >
                      {user.isAdmin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Ta bort admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-1" />
                          Gör till admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Inga användare hittades
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};