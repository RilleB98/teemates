import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

export const Messages = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24"> {/* Account for fixed bottom navigation */}
        <Hero />
        
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">Meddelanden</h2>
          <div className="text-center text-muted-foreground">
            <p>Här kommer du att kunna chatta med andra golfspelare.</p>
          </div>
        </div>
      </div>
    </div>
  );
};