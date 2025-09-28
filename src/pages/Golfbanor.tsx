import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Calendar, Users } from "lucide-react";
import { useEffect } from "react";

export default function Golfbanor() {
  useEffect(() => {
    document.title = "Golfbanor i Sverige - TeeMates | Hitta & Boka Golfbanor";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upptäck över 500 golfbanor i Sverige med TeeMates. Boka tider, hitta partners och utforska svenska golfbanor från Stockholm till Göteborg och Malmö.');
    }
  }, []);

  const featuredCourses = [
    {
      name: "Bro Hof Slott Golf Club",
      location: "Stockholm",
      rating: 4.8,
      holes: 36,
      description: "En av Sveriges mest prestigefyllda golfbanor med två 18-håls banor."
    },
    {
      name: "Göteborg Golf Club",
      location: "Göteborg", 
      rating: 4.7,
      holes: 18,
      description: "Historisk golfbana grundad 1902, belägen vackert i Göteborgs skärgård."
    },
    {
      name: "Malmö Burlöv Golf",
      location: "Malmö",
      rating: 4.6,
      holes: 18,
      description: "Modern parkbana med utmanande hinder och vacker design."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green/5 to-golf-accent/5">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-golf-primary mb-6">
            Golfbanor i Sverige
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Upptäck över 500 golfbanor runt om i Sverige. Från klassiska länkar till moderna parkbanor - 
            hitta din nästa golfupplevelse och boka direkt genom TeeMates.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Sök Golfbanor
          </Button>
        </header>

        {/* Featured Courses */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Populära Golfbanor</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {course.name}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{course.rating}</span>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {course.location} • {course.holes} hål
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <Button variant="outline" className="w-full">
                    Se Mer & Boka
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>500+ Banor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Komplett databas över golfbanor från Kiruna till Malmö.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Enkel Bokning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Boka tider direkt i appen och planera rundor med vänner.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Hitta Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Se vilka andra golfare som spelar på samma bana.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Star className="h-12 w-12 text-golf-primary mx-auto mb-4" />
              <CardTitle>Recensioner</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Läs äkta recensioner från andra golfare om banor och faciliteter.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Regions Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Golfbanor per Region</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stockholm & Mälardalen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Upptäck över 80 golfbanor i Stockholm och omgivande områden. 
                  Från Bro Hof Slott till Stockholms Golfklubb.
                </p>
                <Button variant="outline">Se Banor i Stockholm</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Göteborg & Västkusten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Spela golf vid havet med över 60 banor längs västkusten. 
                  Perfekt kombination av golf och hav.
                </p>
                <Button variant="outline">Se Banor i Göteborg</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skåne & Sydsverige</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Njut av längre golfsäsong i söder med över 70 banor 
                  från Malmö till Kristianstad.
                </p>
                <Button variant="outline">Se Banor i Skåne</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-card p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Redo att Utforska Sveriges Golfbanor?</h2>
          <p className="text-muted-foreground mb-6">
            Få tillgång till hela vår databas med golfbanor, recensioner och bokningssystem.
          </p>
          <Button size="lg" className="bg-golf-primary hover:bg-golf-primary/90">
            Kom Igång Gratis
          </Button>
        </section>
      </main>
    </div>
  );
}