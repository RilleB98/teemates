import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag, Users, MessageCircle, MapPin } from "lucide-react";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-light via-white to-golf-green-light/50"
         style={{ 
           background: 'linear-gradient(135deg, hsl(var(--golf-green-light)), hsl(0 0% 100%), hsl(var(--golf-green-light) / 0.3))' 
         }}>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-golf-premium mb-4">
            TeeMates
          </h1>
          <p className="text-xl text-golf-premium/80 max-w-2xl mx-auto">
            Hitta golfkompisar och spela mer golf. Anslut med golfare i ditt område och boka rundor tillsammans.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Hitta Golfkompisar
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Möt nya golfare i ditt område och bygg ditt golfnätverk
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Flag className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Boka Rundor
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Föreslå och delta i golfrundor på dina favoritbanor
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Chatta
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Håll kontakten med dina golfkompisar och planera nästa runda
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-golf-premium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-golf-premium mb-2">
                Lokala Banor
              </h3>
              <p className="text-golf-premium/70 text-sm">
                Upptäck golfbanor nära dig och utforska nya platser
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-golf-premium mb-8">
            Ladda ner TeeMates appen
          </h2>
          <p className="text-golf-premium/80 mb-8 max-w-xl mx-auto">
            Appen kommer snart att finnas tillgänglig i App Store och Google Play Store.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              disabled 
              className="bg-white/20 text-golf-premium border-white/30 hover:bg-white/30 cursor-not-allowed"
            >
              App Store - Kommer snart
            </Button>
            <Button 
              disabled 
              className="bg-white/20 text-golf-premium border-white/30 hover:bg-white/30 cursor-not-allowed"
            >
              Google Play - Kommer snart
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-golf-premium mb-6">
            Om TeeMates
          </h2>
          <p className="text-golf-premium/80 text-lg leading-relaxed">
            TeeMates är den svenska appen för golfare som vill hitta spelkompisar och spela mer golf. 
            Oavsett om du är nybörjare eller erfaren spelare, hjälper TeeMates dig att ansluta med 
            golfare på din nivå och i ditt område. Skapa nya vänskap på golfbanan och njut av spelet tillsammans.
          </p>
        </div>
      </div>
    </div>
  );
};