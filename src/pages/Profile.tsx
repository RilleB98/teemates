import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Save, LogOut, MapPin, Star, ArrowLeft, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/CourseSelector";
import { ImageCropper } from "@/components/ImageCropper";

export const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    handicap: "",
    avatar_url: "",
    selected_course: null as any
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
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
          name: data.name || "",
          age: data.age?.toString() || "",
          handicap: data.handicap?.toString() || "",
          avatar_url: data.avatar_url || "",
          selected_course: data.selected_course || null
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageSelect called');
    if (!event.target.files || event.target.files.length === 0) {
      console.log('No files selected');
      return;
    }

    const file = event.target.files[0];
    console.log('File selected:', file.name, file.size);
    setSelectedImage(file);
    setShowCropper(true);
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleCroppedImage = async (croppedFile: File) => {
    try {
      setUploading(true);
      setShowCropper(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const fileName = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedFile, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Kunde inte ladda upp bild");
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = data.publicUrl;
      setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));

      // Save avatar URL immediately to database
      const { error: saveError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("user_id", user.id);

      if (saveError) {
        console.error("Error saving avatar URL:", saveError);
        toast.error("Bild uppladdad men kunde inte sparas i profilen");
      } else {
        toast.success("Profilbild sparad!");
      }

    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Ett fel uppstod vid uppladdning");
    } finally {
      setUploading(false);
      setSelectedImage(null);
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
        name: profile.name || null,
        age: profile.age ? parseInt(profile.age) : null,
        handicap: profile.handicap ? parseFloat(profile.handicap) : null,
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

  const handleNameEdit = () => {
    setTempName(profile.name);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ name: tempName })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving name:", error);
        toast.error("Kunde inte spara namn");
        return;
      }

      setProfile(prev => ({ ...prev, name: tempName }));
      setIsEditingName(false);
      toast.success("Namn sparat!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    }
  };

  const handleNameCancel = () => {
    setTempName("");
    setIsEditingName(false);
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
          <CardHeader className="text-center relative pb-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
            <div className="flex items-center gap-2 justify-center mt-24">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Ange ditt namn"
                    className="text-center font-bold text-2xl h-auto py-2"
                  />
                  <Button size="sm" onClick={handleNameSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleNameCancel}>
                    ×
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-bold text-golf-premium">
                    {profile.name || "Min Profil"}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNameEdit}
                    className="p-1 h-auto"
                  >
                    <Edit2 className="w-4 h-4 text-golf-green" />
                  </Button>
                </div>
              )}
            </div>
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
                    onChange={handleImageSelect}
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

              {/* Course Selector */}
              <div className="space-y-2">
                <Label>Hemmaklubb</Label>
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
        
        {/* Image Cropper Modal */}
        {selectedImage && (
          <ImageCropper
            image={selectedImage}
            isOpen={showCropper}
            onClose={() => {
              setShowCropper(false);
              setSelectedImage(null);
            }}
            onCrop={handleCroppedImage}
          />
        )}
      </div>
    </div>
  );
};