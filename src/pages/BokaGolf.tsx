import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function BokaGolf() {
  useEffect(() => {
    document.title = "Boka Golf Online - TeeMates | Enkla Golfbokningar Sverige";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Boka golftider enkelt online med TeeMates. Jämför priser, hitta lediga tider på 500+ golfbanor i Sverige. Boka med partners eller solo - allt i en app.');
    }
  }, []);

  const bookingSteps = [
    {
      icon: MapPin,
      title: "Välj Golfbana",
      description: "Sök bland över 500 golfbanor i Sverige"
    },
    {
      icon: Calendar,
      title: "Välj Datum & Tid",
      description: "Se lediga tider i realtid"
    },
    {
      icon: Users,
      title: "Bjud in Partners",
      description: "Spela ensam eller bjud in golfvänner"
    },
    {
      icon: CreditCard,
      title: "Betala Säkert",
      description: "Enkel betalning direkt i appen"
    }
  ];

  const benefits = [
    "Ingen extra kostnad - betala endast banans ordinarie greenfee",
    "Avboka gratis upp till 24 timmar innan",
    "Automatiska påminnelser via push-notiser",
    "Samla alla dina bokningar på ett ställe",
    "Dela kostnad enkelt med dina golfpartners",
    "Få rekommendationer baserat på dina preferenser"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green/5 to-golf-accent/5">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-golf-primary mb-6">
            Boka Golf Online
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Enkla golfbokningar på över 500 golfbanor i Sverige. Jämför priser, hitta lediga tider 
            och boka direkt med dina golfpartners - allt i TeeMates appen.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Börja Boka Nu
          </Button>
        </header>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Så Funkar Det</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {bookingSteps.map((step, index) => (
              <Card key={index} className="text-center relative">
                {index < bookingSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-golf-primary/30 z-10" />
                )}
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 bg-golf-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-golf-primary" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Varför Boka via TeeMates?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-golf-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Populära Bokningstider</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-golf-green/5 rounded">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <span>Helger 07:00-09:00</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Mest populär</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <span>Vardagar 16:00-18:00</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Bra priser</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <span>Tidiga morgnar</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Alltid ledigt</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Flexibel Bokning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Boka upp till 30 dagar i förväg eller hitta sista minuten-tider.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Gruppbokningar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Perfekt för företag, golfklubbar eller vänner som vill spela tillsammans.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Säker Betalning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Betala säkert med kort, Swish eller andra populära betalmetoder.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Redo att Boka Din Nästa Golfrunda?</h2>
          <p className="text-muted-foreground mb-6">
            Skapa konto gratis och få tillgång till alla golfbanor och bokningsfunktioner.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Skapa Gratis Konto
          </Button>
        </section>
      </main>
    </div>
  );
}