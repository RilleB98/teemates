import { SimpleGolfImporter } from "@/components/SimpleGolfImporter";
import { Navigation } from "@/components/Navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PlusCircle } from "lucide-react";

export const AdminGolf = () => {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-lg">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
        <Navigation />
        
        <div className="pb-24 pt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-4">
                  Åtkomst nekad
                </h1>
                <p className="text-red-600 mb-6">
                  Du har inte behörighet att komma åt admin-funktionaliteten. 
                  Kontakta en administratör för att få tillgång.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-6 pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 text-shadow-lg">
              Golfbane-administratör
            </h1>
            <p className="text-base sm:text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-4 py-2 inline-block flex items-center gap-2 justify-center">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Enkelt sätt att lägga till golfbanor
            </p>
          </div>
          
          <SimpleGolfImporter />
        </div>
      </div>
    </div>
  );
};