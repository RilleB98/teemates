import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Users, MapPin, MessageCircle, User } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-golf-green-light">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-golf rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-golf-premium">GolfConnect</h1>
              <p className="text-xs text-muted-foreground">Find Your Match</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink icon={Users} label="Players" active />
            <NavLink icon={MapPin} label="Courses" />
            <NavLink icon={MessageCircle} label="Messages" badge="3" />
            <NavLink icon={User} label="Min sida" />
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Min sida
            </Button>
            <Button variant="premium" size="sm">
              Premium
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
}

const NavLink = ({ icon: Icon, label, active, badge }: NavLinkProps) => {
  return (
    <button className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
      active 
        ? 'text-golf-green bg-golf-green-light' 
        : 'text-muted-foreground hover:text-golf-green hover:bg-golf-green-light/50'
    }`}>
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