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
import teeMatesLogo from "@/assets/teemates-icon.png";
export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    console.log("🍎 DEBUG: Auth page useEffect starting...");
    console.log("🍎 DEBUG: Current URL:", window.location.href);
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("🍎 DEBUG: Initial session check:", { hasSession: !!session, hasUser: !!session?.user });
      if (session?.user) {
        console.log("🍎 DEBUG: Existing session detected, redirecting to /app");
        navigate("/app");
      }
    });

    // Set up auth state listener for immediate redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🍎 DEBUG: Auth page - auth state change:", event, !!session);
      console.log("🍎 DEBUG: Session user:", session?.user?.id);
      if (session?.user) {
        console.log("🍎 DEBUG: User authenticated, redirecting to /app");
        navigate("/app");
      }
    });

    return () => {
      console.log("🧹 DEBUG: Auth page cleanup");
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
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      console.log('🍎 Starting iOS Apple sign-in...');
      
      // iOS-optimized Apple OAuth with dynamic redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/app`,
        }
      });
      
      if (error) {
        console.error('❌ Apple OAuth error:', error);
        setLoading(false);
        return;
      }
      
      if (data?.url) {
        console.log('🍎 DEBUG: Redirecting to Apple OAuth URL:', data.url);
        // Use window.location.href instead of Browser.open for proper redirect
        window.location.href = data.url;
      } else {
        console.log("❌ No URL returned from Apple OAuth");
        setLoading(false);
      }
    } catch (err) {
      console.log("❌ Unexpected error during Apple sign-in:", err);
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('🔍 DEBUG: Starting Google sign-in as fallback...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        }
      });
      
      if (error) {
        console.error('❌ DEBUG: Google OAuth error:', error);
        setLoading(false);
        return;
      }
      
      if (data?.url) {
        console.log('🔍 DEBUG: Redirecting to Google OAuth URL:', data.url);
        window.location.href = data.url;
      } else {
        console.log("❌ DEBUG: No URL returned from Google OAuth");
        setLoading(false);
      }
    } catch (err) {
      console.log("❌ DEBUG: Unexpected error during Google sign-in:", err);
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
                
                <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-10 xs:h-11 border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300 text-sm xs:text-base font-medium" disabled={loading}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Logga in med Google
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