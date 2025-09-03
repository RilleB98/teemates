import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Users, MessageCircle, MapPin, Download, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const PublicLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      {/* Header with App Download CTA */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-start">
            <img 
              src="/lovable-uploads/e94c05df-8c2c-4ed3-8d8e-f8eb3450f6ae.png" 
              alt="TeeMates" 
              className="w-20 h-20 rounded-lg ml-0"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-golf-premium mb-6">
            TeeMates
          </h1>
          <p className="text-2xl text-golf-premium/90 max-w-3xl mx-auto mb-8">
            Sveriges första app för golfare som vill hitta spelkompisar och spela mer golf
          </p>
          <p className="text-lg text-golf-premium/80 max-w-2xl mx-auto mb-12">
            Anslut med golfare i ditt område, boka rundor tillsammans och bygg ditt golfnätverk
          </p>
          
          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg"
              disabled 
              className="bg-black text-white hover:bg-gray-800 cursor-not-allowed flex items-center px-8 py-4 text-lg"
            >
              <Smartphone className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="text-xs">Ladda ner på</div>
                <div className="font-semibold">App Store</div>
              </div>
            </Button>
            <Button 
              size="lg"
              disabled 
              className="bg-black text-white hover:bg-gray-800 cursor-not-allowed flex items-center px-8 py-4 text-lg"
            >
              <div className="w-6 h-6 mr-3 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs">Ladda ner på</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </Button>
          </div>

          <p className="text-golf-premium/70 text-lg">
            🚀 Appen lanseras snart!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Hitta Golfkompisar
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Möt nya golfare i ditt område och bygg ditt golfnätverk baserat på spelstil och nivå
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <Flag className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Boka Rundor
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Föreslå och delta i golfrundor på dina favoritbanor. Hitta spelare för alla tider på dygnet
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Chatta & Planera
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Håll kontakten med dina golfkompisar, planera nästa runda och dela dina bästa ronder
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Svenska Golfbanor
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Upptäck golfbanor i hela Sverige och utforska nya platser med dina nya golfkompisar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-golf-premium mb-8">
            Om TeeMates
          </h2>
          <p className="text-xl text-golf-premium/80 leading-relaxed mb-8">
            TeeMates är Sveriges första app speciellt designad för golfare som vill hitta spelkompisar 
            och spela mer golf. Vi förstår att golf är roligast när man spelar med andra som delar 
            samma passion för spelet.
          </p>
          <p className="text-lg text-golf-premium/80 leading-relaxed">
            Oavsett om du är nybörjare eller erfaren spelare, hjälper TeeMates dig att ansluta med 
            golfare på din nivå och i ditt område. Skapa nya vänskaper på golfbanan, upptäck nya banor 
            och njut av spelet tillsammans med likasinnade golfare.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <h3 className="text-3xl font-bold text-golf-premium mb-4">
            Redo att hitta dina nästa golfkompisar?
          </h3>
          <p className="text-lg text-golf-premium/80 mb-8 max-w-2xl mx-auto">
            Bli en av de första att använda TeeMates när appen lanseras. 
            Vi meddelar dig så fort den är tillgänglig!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              disabled 
              className="bg-golf-premium text-white hover:bg-golf-premium/90 cursor-not-allowed px-8 py-4"
            >
              Kommer snart till App Store
            </Button>
            <Button 
              size="lg"
              disabled 
              className="bg-golf-premium text-white hover:bg-golf-premium/90 cursor-not-allowed px-8 py-4"
            >
              Kommer snart till Google Play
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/e94c05df-8c2c-4ed3-8d8e-f8eb3450f6ae.png" 
                alt="TeeMates" 
                className="w-8 h-8 rounded"
              />
              <span className="text-lg font-bold text-golf-premium">TeeMates</span>
            </div>
            <p className="text-golf-premium/60 text-sm">
              © 2024 TeeMates. Alla rättigheter förbehållna.
            </p>
            <p className="text-golf-premium/60 text-sm mt-2">
              Sveriges app för golfare som vill spela mer golf tillsammans.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};