import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Target, Users, MapPin, MessageCircle, User, Menu, LogOut, LogIn, Home, Settings } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
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
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const messageCount = useUnreadMessages();
  const location = useLocation();

  const formatBadgeCount = useCallback((count: number) => {
    if (count === 0) return undefined;
    return count > 9 ? "9+" : count.toString();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success("Du är nu utloggad");
    setIsMobileMenuOpen(false);
  }, []);

  const badgeCount = useMemo(() => formatBadgeCount(messageCount), [messageCount, formatBadgeCount]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-golf-green-light">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-center">
          {/* Navigation items with even spacing */}
          <div className="flex items-center justify-between w-full max-w-md">
            {/* Friends */}
            <Link to="/friends">
              <button className={`relative flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-smooth ${
                location.pathname === '/friends' 
                  ? 'text-golf-green bg-golf-green-light' 
                  : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
              }`}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs font-medium">Vänner</span>
              </button>
            </Link>
            
            {/* Messages */}
            <Link to="/messages">
              <button className={`relative flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-smooth ${
                location.pathname === '/messages' 
                  ? 'text-golf-green bg-golf-green-light' 
                  : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
              }`}>
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs font-medium">Meddelanden</span>
                {badgeCount && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-xs p-0 flex items-center justify-center">
                    {badgeCount}
                  </Badge>
                )}
              </button>
            </Link>

            {/* Centered Large Swipe Button */}
            <Link to="/swipe">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-gradient-golf rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer shadow-lg">
                <Target className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white" />
              </div>
            </Link>
            
            {/* Courses */}
            <Link to="/courses">
              <button className={`relative flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-smooth ${
                location.pathname === '/courses' 
                  ? 'text-golf-green bg-golf-green-light' 
                  : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
              }`}>
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs font-medium">Banor</span>
              </button>
            </Link>
            
            {/* Hamburger Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-golf-green text-white hover:bg-golf-green/90 transition-smooth">
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Navigeringsmeny</SheetTitle>
                <SheetDescription className="sr-only">Menyalternativ och användarinformation</SheetDescription>
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-golf-green-light">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile?.avatar_url || ''} alt="Profilbild" />
                      <AvatarFallback className="bg-gradient-golf text-white">
                        <User className="w-7 h-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold text-golf-premium">
                        {profile?.name || 'Användare'}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {profile?.selected_course?.name || 'Ingen hemmaklubb'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <Home className="w-4 h-4 mr-3" />
                        Startsidan
                      </Link>
                    </Button>
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
                     {isAdmin && (
                       <Button variant="outline" className="w-full justify-start" asChild>
                         <Link to="/admin/golf" onClick={() => setIsMobileMenuOpen(false)}>
                           <Settings className="w-4 h-4 mr-3" />
                           Admin
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