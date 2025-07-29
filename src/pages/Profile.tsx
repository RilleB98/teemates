import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  handicap: number | null;
  age: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editData, setEditData] = useState({
    handicap: "",
    age: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      await loadProfile(user.id);
    } catch (error) {
      console.error("Error checking user:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda användarinformation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setEditData({
          handicap: data.handicap?.toString() || "",
          age: data.age?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda profil",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updateData = {
        handicap: editData.handicap ? parseInt(editData.handicap) : null,
        age: editData.age ? parseInt(editData.age) : null,
      };

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...updateData,
        });

      if (error) throw error;

      await loadProfile(user.id);
      setIsEditing(false);
      toast({
        title: "Sparat",
        description: "Din profil har uppdaterats",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Fel",
        description: "Kunde inte spara profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green-light to-white">
        <Navigation />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">Laddar...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-light to-white">
      <Navigation />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
            <h1 className="text-3xl font-bold text-golf-premium">Min sida</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profil
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Redigera
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.email}</h3>
                  <p className="text-muted-foreground">
                    Medlem sedan {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("sv-SE") : "Okänt"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="handicap">Handicap</Label>
                  {isEditing ? (
                    <Input
                      id="handicap"
                      type="number"
                      value={editData.handicap}
                      onChange={(e) => setEditData(prev => ({ ...prev, handicap: e.target.value }))}
                      placeholder="Ditt handicap"
                    />
                  ) : (
                    <p className="text-lg">{profile?.handicap || "Ej angivet"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">Ålder</Label>
                  {isEditing ? (
                    <Input
                      id="age"
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Din ålder"
                    />
                  ) : (
                    <p className="text-lg">{profile?.age || "Ej angivet"}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Sparar..." : "Spara"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        handicap: profile?.handicap?.toString() || "",
                        age: profile?.age?.toString() || "",
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Avbryt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontoinställningar</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut}>
                Logga ut
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}