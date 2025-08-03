import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SwipeMatchPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="pb-24 pt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Golf Match</h1>
              <p className="text-muted-foreground">Preview-läge</p>
              <Badge variant="outline" className="mt-2">
                Öppna webbplatsen för full funktionalitet
              </Badge>
            </div>
            
            <Card className="h-[400px]">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">DU</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Demo Användare</h3>
                    <p className="text-muted-foreground">28 år</p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline">HCP 18</Badge>
                    <Badge variant="secondary">Man</Badge>
                    <p className="text-sm flex items-center justify-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      Demo Golf Club
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600"
                    onClick={() => alert('Demo: Profil överhoppad')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hoppa över
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => alert('Demo: Vänförfrågan skickad!')}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Skicka förfrågan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};