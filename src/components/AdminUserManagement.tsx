import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string | null;
  user_id: string;
  isAdmin: boolean;
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Fel",
        description: "Kunde inte hämta användare",
        variant: "destructive"
      });
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

        toast({
          title: "Framgång",
          description: "Admin-behörighet borttagen",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: 'admin' }]);

        if (error) throw error;

        toast({
          title: "Framgång",
          description: "Admin-behörighet tillagd",
        });
      }

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Fel",
        description: "Kunde inte ändra admin-behörighet",
        variant: "destructive"
      });
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
  );
};