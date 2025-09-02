import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Mail, Lock, User, ArrowLeft, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import teeMatesLogo from "@/assets/teemates-icon.png";
export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    // Check if user is already logged in
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        navigate("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vänligen fyll i alla fält");
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Den här e-postadressen är redan registrerad");
      } else {
        toast.error("Registrering misslyckades: " + error.message);
      }
    } else {
      toast.success("Konto skapat! Kontrollera din e-post för bekräftelse.");
    }
    setLoading(false);
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vänligen fyll i alla fält");
      return;
    }
    setLoading(true);
    const {
      error,
      data
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Fel e-postadress eller lösenord");
      } else {
        toast.error("Inloggning misslyckades: " + error.message);
      }
    } else {
      // Try to get the user's name from their profile
      try {
        const {
          data: profile
        } = await supabase.from("profiles").select("name").eq("user_id", data.user.id).maybeSingle();
        const userName = profile?.name;
        if (userName) {
          toast.success(`Välkommen tillbaka ${userName}!`);
        } else {
          toast.success("Välkommen tillbaka!");
        }
      } catch (profileError) {
        // If we can't get the name, just show the generic message
        toast.success("Välkommen tillbaka!");
      }
      navigate("/");
    }
    setLoading(false);
  };
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Starting Apple sign-in...');
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      console.log('Apple OAuth response:', {
        data,
        error
      });
      if (error) {
        console.error('Apple sign-in error:', error);
        toast.error("Apple-inloggning misslyckades: " + error.message);
        setLoading(false);
      } else if (data?.url) {
        console.log('Redirecting to Apple OAuth URL:', data.url);
        // OAuth provider should handle the redirect
        window.location.href = data.url;
      } else {
        console.error('No URL returned from Apple OAuth');
        toast.error("Apple-inloggning kunde inte startas");
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error during Apple sign-in:', err);
      toast.error("Ett oväntat fel uppstod vid Apple-inloggning");
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4 xs:p-6">
      <div className="w-full max-w-sm xs:max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6 xs:mb-8">
          <Link to="/" className="inline-flex items-center text-golf-green hover:text-golf-green/80 transition-spring mb-4 xs:mb-6 text-sm xs:text-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till startsidan
          </Link>
          <div className="flex items-center justify-center space-x-2 xs:space-x-3 mb-3 xs:mb-4">
            <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-golf rounded-full flex items-center justify-center shadow-golf animate-float overflow-hidden">
              <img src={teeMatesLogo} alt="teeMates logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-golf-premium">TeeMates</h1>
          </div>
          <p className="text-muted-foreground text-sm xs:text-base">Välkommen till golfgemenskapen</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card/95 backdrop-blur-sm border-golf-green-light shadow-golf hover:shadow-premium transition-all duration-300">
          <CardHeader className="pb-4 xs:pb-6">
            <CardTitle className="text-center text-golf-premium text-lg xs:text-xl">Kom igång</CardTitle>
          </CardHeader>
          <CardContent className="p-4 xs:p-6 pt-0">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 xs:mb-6 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="signin" className="text-xs xs:text-sm font-medium rounded-md">Logga in</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs xs:text-sm font-medium rounded-md">Registrera</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 xs:space-y-6">
                <form onSubmit={handleSignIn} className="space-y-3 xs:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm xs:text-base font-medium">E-postadress</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-email" type="email" placeholder="din@email.se" className="pl-10 h-10 xs:h-11 bg-background/50 border-muted-foreground/20 focus:border-golf-green transition-all duration-200" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm xs:text-base font-medium">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" type="password" placeholder="Ditt lösenord" className="pl-10 h-10 xs:h-11 bg-background/50 border-muted-foreground/20 focus:border-golf-green transition-all duration-200" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-10 xs:h-11 bg-gradient-golf hover:shadow-golf transition-all duration-300 text-sm xs:text-base font-medium" disabled={loading}>
                    {loading ? "Loggar in..." : "Logga in"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">eller</span>
                  </div>
                </div>

                <Button onClick={handleAppleSignIn} variant="outline" className="w-full h-10 xs:h-11 border-muted-foreground/20 bg-black text-white hover:bg-black/90 transition-all duration-300 text-sm xs:text-base font-medium" disabled={loading}>
                  <Apple className="w-4 h-4 mr-2" />
                  Logga in med Apple
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 xs:space-y-6">
                <form onSubmit={handleSignUp} className="space-y-3 xs:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm xs:text-base font-medium">E-postadress</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" placeholder="din@email.se" className="pl-10 h-10 xs:h-11 bg-background/50 border-muted-foreground/20 focus:border-golf-green transition-all duration-200" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm xs:text-base font-medium">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="Välj ett säkert lösenord" className="pl-10 h-10 xs:h-11 bg-background/50 border-muted-foreground/20 focus:border-golf-green transition-all duration-200" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <p className="text-xs text-muted-foreground">Minst 6 tecken</p>
                  </div>
                  
                  <Button type="submit" className="w-full h-10 xs:h-11 bg-gradient-golf hover:shadow-golf transition-all duration-300 text-sm xs:text-base font-medium" disabled={loading}>
                    <User className="w-4 h-4 mr-2" />
                    {loading ? "Skapar konto..." : "Skapa konto"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};