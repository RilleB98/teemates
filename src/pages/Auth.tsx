import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Mail, Lock, User, ArrowLeft, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import teeMatesLogo from "@/assets/teemates-icon.png";
export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    console.log("🍎 DEBUG: Auth page useEffect starting...");
    console.log("🍎 DEBUG: Current URL:", window.location.href);
    
    let isMounted = true;
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🍎 DEBUG: Initial session check:", { hasSession: !!session, hasUser: !!session?.user });
      if (session?.user && isMounted) {
        console.log("🍎 DEBUG: Existing session detected, redirecting to /app");
        // Use setTimeout to ensure this runs after current render cycle
        setTimeout(() => navigate("/app", { replace: true }), 0);
      }
    });

    // Set up auth state listener for immediate redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🍎 DEBUG: Auth page - auth state change:", event, !!session);
      console.log("🍎 DEBUG: Session user:", session?.user?.id);
      if (session?.user && isMounted) {
        console.log("🍎 DEBUG: User authenticated, redirecting to /app");
        // Use setTimeout to ensure this runs after current render cycle
        setTimeout(() => navigate("/app", { replace: true }), 0);
      }
    });

    return () => {
      console.log("🧹 DEBUG: Auth page cleanup");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/app`;
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
      console.log(error.message);
    } else {
      // Konto skapat! Kontrollera din e-post för bekräftelse.
    }
    setLoading(false);
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
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
      console.log(error.message);
    } else {
      // Inloggning lyckades - navigera till app
      navigate("/app");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "E-postadress krävs",
        description: "Ange din e-postadress för att återställa lösenordet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Fel",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: "E-post skickad!",
        description: "Kontrollera din inkorg för instruktioner om lösenordsåterställning",
      });
    }
    setLoading(false);
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      console.log('🍎 DEBUG: Starting Apple sign-in...');
      
      // Clear any existing session/storage to ensure clean state
      await supabase.auth.signOut();
      localStorage.clear();
      
      // Use HTTPS callback for all platforms to match ASWebAuthenticationSession expectations
      const redirectUrl = `${window.location.origin}/auth-callback`;
      console.log('🔄 DEBUG: Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (error) {
        console.error('❌ Apple OAuth error:', error);
        toast({
          title: "Inloggningsfel",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (data?.url) {
        console.log('🍎 DEBUG: Opening Apple OAuth URL:', data.url);
        
        if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
          // Use ASWebAuthenticationSession for iOS (auto-closes Safari)
          try {
            console.log('🍎 DEBUG: Attempting to import WebAuthPlugin...');
            const WebAuth = (await import('../plugins/WebAuthPlugin')).default;
            console.log('🍎 DEBUG: WebAuthPlugin imported successfully, starting auth...');
            console.log('🍎 DEBUG: OAuth URL being sent to WebAuth:', data.url);
            
            const result = await WebAuth.startWebAuth({ url: data.url });
            console.log('✅ DEBUG: WebAuth completed successfully:', result);
            
            // Process the callback URL immediately if we get one
            if (result?.url) {
              console.log('🔄 DEBUG: Processing callback URL from WebAuth:', result.url);
              console.log('🔄 DEBUG: Callback URL starts with https:', result.url.startsWith('https://'));
              
              // Since we're using HTTPS callbacks, navigate directly to the callback URL
              window.location.href = result.url;
            } else {
              console.error('❌ DEBUG: WebAuth returned no URL');
            }
          } catch (webAuthError) {
            console.error('❌ DEBUG: WebAuth failed:', webAuthError);
            toast({
              title: "Native auth misslyckades",
              description: "Försöker med webbläsare istället...",
            });
            // Fallback to browser method
            try {
              await Browser.open({ url: data.url });
            } catch (browserError) {
              console.error('❌ Browser fallback also failed:', browserError);
              toast({
                title: "Inloggning misslyckades",
                description: "Kunde inte öppna inloggningssida",
                variant: "destructive",
              });
            }
          }
        } else if (Capacitor.isNativePlatform()) {
          // Android - use browser
          await Browser.open({ url: data.url });
        } else {
          // Web browser - standard redirect
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.log("❌ Unexpected error during Apple sign-in:", err);
      toast({
        title: "Inloggningsfel",
        description: "Något gick fel vid inloggning med Apple",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4 xs:p-6">
      <div className="w-full max-w-sm xs:max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6 xs:mb-8">
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

                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-muted-foreground hover:text-golf-green transition-colors"
                  >
                    Glömt lösenord?
                  </Button>
                  {resetEmailSent && (
                    <p className="text-xs text-golf-green mt-2">
                      E-post skickad! Kontrollera din inkorg.
                    </p>
                  )}
                </div>

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