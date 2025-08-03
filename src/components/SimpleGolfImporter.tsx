import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Course } from "@/data/golfCourses";
import course1 from "@/assets/course1.jpg";

export const SimpleGolfImporter = () => {
  const { toast } = useToast();
  const [golfClubName, setGolfClubName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const generateRandomData = () => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const holes = [9, 18, 27];
    const swedishLocations = [
      'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 
      'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 
      'Umeå', 'Gävle', 'Borås', 'Eskilstuna', 'Skåne', 'Småland'
    ];
    
    return {
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      holes: holes[Math.floor(Math.random() * holes.length)],
      price: `${Math.floor(Math.random() * 700) + 300} SEK`,
      location: swedishLocations[Math.floor(Math.random() * swedishLocations.length)],
      latitude: parseFloat((Math.random() * 14 + 55).toFixed(4)),
      longitude: parseFloat((Math.random() * 14 + 10).toFixed(4))
    };
  };

  const addGolfClub = async () => {
    if (!golfClubName.trim()) {
      toast({
        title: "Namn saknas",
        description: "Skriv namnet på golfklubben",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsAdding(true);
    
    try {
      // Simulera loading för UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const randomData = generateRandomData();
      
      const newCourse: Course = {
        name: golfClubName.trim(),
        location: randomData.location,
        rating: randomData.rating,
        difficulty: randomData.difficulty,
        holes: randomData.holes,
        price: randomData.price,
        image: course1,
        latitude: randomData.latitude,
        longitude: randomData.longitude
      };

      // Uppdatera golfCourses-arrayen direkt i minnet
      // Detta kommer att synas i appen direkt
      const { golfCourses } = await import('@/data/golfCourses');
      golfCourses.push(newCourse);
      
      // Reset formulär
      setGolfClubName('');
      
      toast({
        title: "Golfbana tillagd! ⛳",
        description: `${newCourse.name} är nu tillagd i appen och syns på courses-sidan`,
        duration: 4000,
      });
      
    } catch (error: any) {
      console.error('Error adding golf course:', error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till golfbanan",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGolfClub();
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-golf-premium text-xl sm:text-2xl">
            <Plus className="w-6 h-6" />
            Lägg till golfbana
          </CardTitle>
          <p className="text-muted-foreground">
            Skriv bara namnet - resten fylls i automatiskt
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="golfclub" className="text-base font-medium">
              Golfbanans namn
            </Label>
            <div className="flex gap-3">
              <Input
                id="golfclub"
                value={golfClubName}
                onChange={(e) => setGolfClubName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="T.ex. Wittsjö Golfklubb"
                className="flex-1 text-base h-12"
                disabled={isAdding}
              />
              <Button 
                onClick={addGolfClub}
                disabled={isAdding || !golfClubName.trim()}
                className="h-12 px-6 touch-manipulation"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Lägger till...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Lägg till
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Så fungerar det:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Skriv golfbanans namn</li>
              <li>• Tryck "Lägg till" eller Enter</li>
              <li>• Golfbanan läggs automatiskt till i appen</li>
              <li>• Plats, betyg och pris genereras automatiskt</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};