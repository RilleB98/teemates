import { useState, useEffect } from "react";
import { format, differenceInYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Save, LogOut, MapPin, Star, ArrowLeft, Edit2, CalendarIcon } from "lucide-react";
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
    selected_course: null as any,
    gender: "",
    birth_date: null as Date | null
  });
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const navigate = useNavigate();

  // Helper function to update birth date from individual components
  const updateBirthDate = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setProfile(prev => ({ ...prev, birth_date: birthDate }));
    } else {
      setProfile(prev => ({ ...prev, birth_date: null }));
    }
  };

  // Helper function to get days in month
  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Mars" },
    { value: "4", label: "April" },
    { value: "5", label: "Maj" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Augusti" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

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
        const birthDate = data.birth_date ? new Date(data.birth_date) : null;
        setProfile({
          name: data.name || "",
          age: data.age?.toString() || "",
          handicap: data.handicap?.toString() || "",
          avatar_url: data.avatar_url || "",
          selected_course: data.selected_course || null,
          gender: data.gender || "",
          birth_date: birthDate
        });
        
        // Set individual date components
        if (birthDate) {
          setBirthDay(birthDate.getDate().toString());
          setBirthMonth((birthDate.getMonth() + 1).toString());
          setBirthYear(birthDate.getFullYear().toString());
        }
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

      // Calculate age from birth_date
      const calculatedAge = profile.birth_date ? differenceInYears(new Date(), profile.birth_date) : null;

      const profileData = {
        user_id: user.id,
        name: profile.name || null,
        age: calculatedAge,
        handicap: profile.handicap ? parseFloat(profile.handicap) : null,
        avatar_url: profile.avatar_url || null,
        selected_course: profile.selected_course || null,
        gender: profile.gender || null,
        birth_date: profile.birth_date ? profile.birth_date.toISOString().split('T')[0] : null
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
    <div className="min-h-screen bg-gradient-hero">
      {/* Elegant Back Button */}
      <div className="fixed top-6 left-6 z-10">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="bg-white/90 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Profile Header Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="pt-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg ring-2 ring-primary/20">
                      <AvatarImage src={profile.avatar_url} alt="Profilbild" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-3xl">
                        <User className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-lg group-hover:scale-110">
                      <Camera className="w-4 h-4 text-white" />
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

                  {/* Name Section */}
                  <div className="w-full text-center">
                    {isEditingName ? (
                      <div className="space-y-2">
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Ange ditt namn"
                          className="text-center font-bold text-xl border-primary/30 focus:border-primary"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" onClick={handleNameSave} className="flex-1">
                            <Save className="w-4 h-4 mr-1" />
                            Spara
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleNameCancel}>
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="group cursor-pointer" onClick={handleNameEdit}>
                        <h2 className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                          {profile.name || "Min Profil"}
                          {profile.birth_date && (
                            <span className="text-lg text-muted-foreground ml-2">
                              ({differenceInYears(new Date(), profile.birth_date)} år)
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Klicka för att redigera
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selected Course Display */}
                  {profile.selected_course && (
                    <div className="w-full bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">Hemmaklubb</span>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{profile.selected_course.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-accent fill-current" />
                          <span className="text-sm text-muted-foreground">{profile.selected_course.rating}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="w-full text-center py-2">
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                        Laddar upp bild...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profilinformation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Form */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Födelsedatum {profile.birth_date && (
                        <span className="text-muted-foreground">
                          (Ålder: {differenceInYears(new Date(), profile.birth_date)} år)
                        </span>
                      )}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Day */}
                      <Select 
                        value={birthDay} 
                        onValueChange={(day) => {
                          setBirthDay(day);
                          updateBirthDate(day, birthMonth, birthYear);
                        }}
                      >
                        <SelectTrigger className="border-muted focus:border-primary transition-colors">
                          <SelectValue placeholder="Dag" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: getDaysInMonth(birthMonth, birthYear) }, (_, i) => {
                            const day = (i + 1).toString();
                            return (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {/* Month */}
                      <Select 
                        value={birthMonth} 
                        onValueChange={(month) => {
                          setBirthMonth(month);
                          // Reset day if current day is invalid for new month
                          const maxDays = getDaysInMonth(month, birthYear);
                          const currentDay = parseInt(birthDay);
                          if (currentDay > maxDays) {
                            setBirthDay("");
                            updateBirthDate("", month, birthYear);
                          } else {
                            updateBirthDate(birthDay, month, birthYear);
                          }
                        }}
                      >
                        <SelectTrigger className="border-muted focus:border-primary transition-colors">
                          <SelectValue placeholder="Månad" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Year */}
                      <Select 
                        value={birthYear} 
                        onValueChange={(year) => {
                          setBirthYear(year);
                          // Reset day if current day is invalid for new year (leap year consideration)
                          const maxDays = getDaysInMonth(birthMonth, year);
                          const currentDay = parseInt(birthDay);
                          if (currentDay > maxDays) {
                            setBirthDay("");
                            updateBirthDate("", birthMonth, year);
                          } else {
                            updateBirthDate(birthDay, birthMonth, year);
                          }
                        }}
                      >
                        <SelectTrigger className="border-muted focus:border-primary transition-colors">
                          <SelectValue placeholder="År" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: new Date().getFullYear() - 1920 + 1 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-foreground">Kön</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger className="border-muted focus:border-primary transition-colors">
                        <SelectValue placeholder="Välj kön" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kvinna">Kvinna</SelectItem>
                        <SelectItem value="man">Man</SelectItem>
                        <SelectItem value="annat">Annat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="handicap" className="text-sm font-semibold text-foreground">Handikapp</Label>
                    <Input
                      id="handicap"
                      type="number"
                      step="0.1"
                      placeholder="Ange ditt handikapp"
                      value={profile.handicap}
                      onChange={(e) => setProfile(prev => ({ ...prev, handicap: e.target.value }))}
                      className="border-muted focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Course Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Hemmaklubb</Label>
                  <CourseSelector 
                    selectedCourse={profile.selected_course}
                    onCourseSelect={(course) => setProfile(prev => ({ ...prev, selected_course: course }))}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    onClick={saveProfile} 
                    disabled={loading || uploading}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Sparar..." : "Spara Profil"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logga ut
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
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