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
      <div className="flex justify-center py-2 sm:py-3 md:py-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 p-0 rounded-full hover:bg-golf-green-light/50"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-golf-green" />
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
              
              <div className="space-y-2">
                <MobileNavLink icon={Users} label="Players" active />
                <MobileNavLink icon={MapPin} label="Courses" />
                <MobileNavLink 
                  icon={MessageCircle} 
                  label="Messages" 
                  badge={formatBadgeCount(messageCount)} 
                  onClick={() => {
                    onMessagesClick?.();
                    setIsMobileMenuOpen(false);
                  }} 
                />
              </div>
              
              <div className="pt-4 border-t border-golf-green-light space-y-3">
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
    </nav>
  );
};