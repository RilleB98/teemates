import { Navigation } from "@/components/Navigation";

export const Friends = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="pb-24"> {/* Account for fixed bottom navigation */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">Dina Vänner</h2>
          <div className="text-center text-muted-foreground">
            <p>Här kommer du snart att kunna se dina vänner och ansluta med andra golfspelare.</p>
          </div>
        </div>
      </div>
    </div>
  );
};