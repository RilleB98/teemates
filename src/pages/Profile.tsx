import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Save, LogOut, MapPin, Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/CourseSelector";

export const Profile = () => {
  const [profile, setProfile] = useState({
    age: "",
    handicap: "",
    home_club: "",
    avatar_url: "",
    selected_course: null as any
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading profile:", error);
        toast.error("Kunde inte ladda profil");
        return;
      }

      if (data) {
        setProfile({
          age: data.age?.toString() || "",
          handicap: data.handicap?.toString() || "",
          home_club: data.home_club || "",
          avatar_url: data.avatar_url || "",
          selected_course: data.selected_course || null
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Kunde inte ladda upp bild");
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success("Bild uppladdad!");

    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Ett fel uppstod vid uppladdning");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const profileData = {
        user_id: user.id,
        age: profile.age ? parseInt(profile.age) : null,
        handicap: profile.handicap ? parseFloat(profile.handicap) : null,
        home_club: profile.home_club || null,
        avatar_url: profile.avatar_url || null,
        selected_course: profile.selected_course || null
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) {
        console.error("Error saving profile:", error);
        toast.error("Kunde inte spara profil");
        return;
      }

      toast.success("Profil sparad!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Du är nu utloggad");
  };

  return (
    <div className="min-h-screen bg-gradient-hero pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="bg-white/95 backdrop-blur-sm border-golf-green-light">
          <CardHeader className="text-center relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
            <CardTitle className="text-2xl font-bold text-golf-premium">Min Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-golf-green-light">
                  <AvatarImage src={profile.avatar_url} alt="Profilbild" />
                  <AvatarFallback className="bg-golf-green-light text-golf-green text-3xl">
                    <User className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-golf-green rounded-full cursor-pointer hover:bg-golf-green/80 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Klicka på kameran för att ladda upp en profilbild</p>
              
              {/* Selected Course Display */}
              {profile.selected_course && (
                <div className="flex items-center gap-2 text-center bg-golf-green/10 rounded-lg p-3">
                  <MapPin className="w-4 h-4 text-golf-green" />
                  <span className="text-sm font-medium text-golf-premium">{profile.selected_course.name}</span>
                  <Star className="w-4 h-4 text-accent fill-current" />
                  <span className="text-sm text-muted-foreground">{profile.selected_course.rating}</span>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Ålder</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ange din ålder"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handicap">Handikapp</Label>
                <Input
                  id="handicap"
                  type="number"
                  step="0.1"
                  placeholder="Ange ditt handikapp"
                  value={profile.handicap}
                  onChange={(e) => setProfile(prev => ({ ...prev, handicap: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="home_club">Hemmaklubb</Label>
                <Input
                  id="home_club"
                  type="text"
                  placeholder="Ange din hemmaklubb"
                  value={profile.home_club}
                  onChange={(e) => setProfile(prev => ({ ...prev, home_club: e.target.value }))}
                />
              </div>

              {/* Course Selector */}
              <div className="space-y-2">
                <Label>Närliggande golfbanor</Label>
                <CourseSelector 
                  selectedCourse={profile.selected_course}
                  onCourseSelect={(course) => setProfile(prev => ({ ...prev, selected_course: course }))}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button 
                onClick={saveProfile} 
                disabled={loading || uploading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sparar..." : "Spara Profil"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};