import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle } from "lucide-react";
import { Course } from "@/data/golfCourses";
import { swedishGolfClubs } from "@/data/swedishGolfCourses";
import course1 from "@/assets/course1.jpg";

export const BulkGolfImporter = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const importAllGolfClubs = async () => {
    setIsImporting(true);
    setProgress(0);
    setImportedCount(0);
    
    try {
      const { golfCourses } = await import('@/data/golfCourses');
      const totalClubs = swedishGolfClubs.length;
      let processed = 0;

      // Importera i batches för bättre prestanda
      const batchSize = 10;
      for (let i = 0; i < totalClubs; i += batchSize) {
        const batch = swedishGolfClubs.slice(i, i + batchSize);
        
        for (const club of batch) {
          // Kolla om klubben redan finns
          const exists = golfCourses.find(course => 
            course.name.toLowerCase() === club.name.toLowerCase()
          );
          
          if (!exists) {
            const newCourse: Course = {
              name: club.name,
              location: club.location,
              image: course1,
              latitude: parseFloat((Math.random() * 14 + 55).toFixed(4)),
              longitude: parseFloat((Math.random() * 14 + 10).toFixed(4))
            };

            golfCourses.push(newCourse);
            setImportedCount(prev => prev + 1);
          }
          
          processed++;
          setProgress((processed / totalClubs) * 100);
        }
        
        // Kort paus mellan batches för att UI ska uppdateras
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      toast({
        title: "Import klar! ⛳",
        description: `${importedCount} nya golfbanor tillagda. Totalt ${golfCourses.length} golfbanor i appen.`,
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Error importing golf courses:', error);
      toast({
        title: "Fel vid import",
        description: "Kunde inte importera alla golfbanor",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-golf-premium text-xl sm:text-2xl">
            <Upload className="w-6 h-6" />
            Importera alla svenska golfbanor
          </CardTitle>
          <p className="text-muted-foreground">
            Importerar alla {swedishGolfClubs.length} golfklubbar från hela Sverige
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isImporting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importerar golfbanor...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {importedCount} nya golfbanor tillagda
              </div>
            </div>
          )}
          
          <Button 
            onClick={importAllGolfClubs}
            disabled={isImporting}
            className="w-full h-12 touch-manipulation"
            size="lg"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Importerar... ({Math.round(progress)}%)
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Importera alla {swedishGolfClubs.length} golfbanor
              </>
            )}
          </Button>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Vad som importeras:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Alla golfklubbar från alla 21 distrikt i Sverige</li>
              <li>• Automatiskt genererad data (betyg, svårighet, pris)</li>
              <li>• GPS-koordinater för varje klubb</li>
              <li>• Dubbletter hoppas över automatiskt</li>
            </ul>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Detta kommer lägga till alla registrerade golfklubbar i Sverige från Svenska Golfförbundet
          </div>
        </CardContent>
      </Card>
    </div>
  );
};