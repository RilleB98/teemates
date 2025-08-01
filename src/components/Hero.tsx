import { Button } from "@/components/ui/button";
import heroImage from "@/assets/golf-hero.jpg";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-golf-premium/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="inline-block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Find Your Perfect
          </span>
          <span className="block text-accent animate-scale-in" style={{ animationDelay: "0.6s" }}>
            Golf Partner
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
          Connect with fellow golfers, discover new courses, and create lasting friendships 
          through your shared passion for the game.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="premium" size="lg" className="text-lg px-8 py-4 h-auto">
            Start Connecting
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="text-white/70 text-lg animate-pulse">😊</div>
        </div>
      </div>
    </div>
  );
};