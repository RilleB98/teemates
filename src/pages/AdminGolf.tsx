import { GolfCrawler } from "@/components/GolfCrawler";
import { Navigation } from "@/components/Navigation";

export const AdminGolf = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-green-light">
      <Navigation />
      
      <div className="pb-24 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 text-shadow-lg">
              Golfbane-administratör
            </h1>
            <p className="text-xl text-white/90 backdrop-blur-sm bg-white/10 rounded-full px-6 py-2 inline-block">
              Samla alla Sveriges golfbanor automatiskt
            </p>
          </div>
          
          <GolfCrawler />
        </div>
      </div>
    </div>
  );
};