import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, MessageCircle, Trophy } from "lucide-react";
import { useEffect } from "react";

export default function GolfPartner() {
  useEffect(() => {
    document.title = "Hitta Golfpartner - TeeMates | Matcha med Golfare i Din Stad";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Hitta din perfekta golfpartner med TeeMates. Matcha med golfare i din närhet, boka rundor tillsammans och förbättra ditt spel. Över 500 golfbanor i Sverige.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green/5 to-golf-accent/5">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-golf-primary mb-6">
            Hitta Din Perfekta Golfpartner
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Anslut med golfare i din närhet, boka rundor tillsammans och förbättra ditt spel. 
            TeeMates hjälper dig hitta golfvänner som passar din spelstil och nivå.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Börja Matcha Nu
          </Button>
        </header>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Smart Matchning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Vårt algoritm matchar dig med golfare baserat på handicap, spelstil och plats.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Lokala Golfpartners</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Hitta golfpartners i din närhet från över 500 golfbanor i Sverige.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Chatta & Planera</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Planera rundor, dela tips och bygg långvariga golfvänskap genom vår chat.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Förbättra Ditt Spel</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Spela med olika partners och lär dig nya tekniker för att utveckla ditt golfspel.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Varför Välja TeeMates?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">För Nybörjare</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Hitta erfarna spelare som kan hjälpa dig förbättra</li>
                <li>• Lär dig golfetiketten på rätt sätt</li>
                <li>• Upptäck nya golfbanor med lokala guider</li>
                <li>• Bygg självförtroende genom att spela med vänliga partners</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">För Erfarna Golfare</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Hitta spelare på din nivå för utmanande rundor</li>
                <li>• Utforska nya golfbanor med kunniga companions</li>
                <li>• Dela din kunskap och hjälp andra utvecklas</li>
                <li>• Skapa ett nätverk av golfvänner</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Redo att Hitta Din Golfpartner?</h2>
          <p className="text-muted-foreground mb-6">
            Gå med i tusentals golfare som redan använder TeeMates för att förbättra sitt spel och ha roligare på banan.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Skapa Konto Gratis
          </Button>
        </section>
      </main>
    </div>
  );
}