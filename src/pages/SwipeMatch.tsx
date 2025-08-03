import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

export const SwipeMatch = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24 pt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Golf Match</h1>
              <p className="text-muted-foreground">Hitta din nästa golfpartner</p>
            </div>

            {/* Simple Test Card */}
            <Card className="h-[400px]">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">TU</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Test Användare</h3>
                    <p className="text-muted-foreground">25 år</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">HCP: 15</p>
                    <p className="text-sm">Hemklubb: Test GK</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => alert('Swipe left!')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hoppa över
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => alert('Swipe right!')}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Gilla
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