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
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          <span className="inline-block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Hitta din perfekta
          </span>
          <span className="block text-accent animate-scale-in" style={{ animationDelay: "0.6s" }}>
            Golfpartner
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
          Träffa andra golfare, upptäck nya banor och skapa varaktiga vänskaper 
          genom din gemensamma passion för spelet.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button variant="premium" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto touch-target">
            Börja matcha
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 touch-target">
            Läs mer
          </Button>
        </div>
      </div>
      
      {/* Floating Elements - Hidden on mobile for cleaner look */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float hidden sm:block">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="text-white/70 text-lg animate-pulse">😊</div>
        </div>
      </div>
    </div>
  );
};