import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Target, Users, MapPin, MessageCircle, User, Menu, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

const NavLink = ({ icon: Icon, label, active, badge, onClick }: NavLinkProps) => {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
        active 
          ? 'text-golf-green bg-golf-green-light' 
          : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
          {badge}
        </Badge>
      )}
    </button>
  );
};

const MobileNavLink = ({ icon: Icon, label, active, badge, onClick }: NavLinkProps) => {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-smooth text-left ${
        active 
          ? 'text-golf-green bg-golf-green-light' 
          : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-base font-medium">{label}</span>
      {badge && (
        <Badge variant="destructive" className="ml-auto w-6 h-6 text-xs p-0 flex items-center justify-center">
          {badge}
        </Badge>
      )}
    </button>
  );
};

interface NavigationProps {
  onMessagesClick?: () => void;
}

export const Navigation = ({ onMessagesClick }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  // Mock message count - replace with real data from your chat system
  const messageCount = 7; // Change this to your actual message count

  const formatBadgeCount = (count: number) => {
    if (count === 0) return undefined;
    return count > 9 ? "9+" : count.toString();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Du är nu utloggad");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-golf-green-light">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - scales with screen size */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-golf rounded-full flex items-center justify-center">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-golf-premium">GolfConnect</h1>
              <p className="text-xs text-muted-foreground hidden lg:block">Find Your Match</p>
            </div>
          </div>
          
          {/* Navigation - always visible, scales with screen size */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8">
            <button className={`relative flex flex-col sm:flex-row items-center space-y-0 sm:space-y-0 sm:space-x-2 px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg transition-smooth text-golf-green bg-golf-green-light`}>
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">Players</span>
            </button>
            
            <button className={`relative flex flex-col sm:flex-row items-center space-y-0 sm:space-y-0 sm:space-x-2 px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg transition-smooth text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50`}>
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">Courses</span>
            </button>
            
            <button 
              onClick={onMessagesClick}
              className={`relative flex flex-col sm:flex-row items-center space-y-0 sm:space-y-0 sm:space-x-2 px-1 sm:px-2 lg:px-3 py-1 sm:py-2 rounded-lg transition-smooth text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:block">Messages</span>
              {formatBadgeCount(messageCount) && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs p-0 flex items-center justify-center">
                  {formatBadgeCount(messageCount)}
                </Badge>
              )}
            </button>
          </div>
          
          {/* Hamburger Menu for User Actions */}
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-golf-green" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-golf-green-light">
                    <div className="w-12 h-12 bg-gradient-golf rounded-full flex items-center justify-center">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-golf-premium">GolfConnect</h2>
                      <p className="text-sm text-muted-foreground">Find Your Match</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {user ? (
                      <>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                            <User className="w-4 h-4 mr-3" />
                            Profil
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-3" />
                          Logga ut
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <LogIn className="w-4 h-4 mr-3" />
                          Logga in
                        </Link>
                      </Button>
                    )}
                    <Button variant="premium" className="w-full">
                      Premium
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};