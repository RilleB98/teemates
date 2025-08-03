import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, RefreshCw, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/useSwipeProfiles';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onRefresh?: () => void;
}

export const SwipeCard = ({ profile, onSwipeLeft, onSwipeRight, onRefresh }: SwipeCardProps) => {
  const [exitX, setExitX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  // Calculate background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-300, -50, 0, 50, 300],
    ['#ff4757', '#ff4757', '#ffffff', '#2ed573', '#2ed573']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150;
    
    if (info.offset.x > threshold) {
      setExitX(300);
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      onSwipeLeft();
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const handleSwipeLeft = () => {
    setExitX(-300);
    onSwipeLeft();
  };

  const handleSwipeRight = () => {
    setExitX(300);
    onSwipeRight();
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 1 }}
        animate={exitX !== 0 ? { x: exitX, opacity: 0, scale: 0.8 } : { x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          x, 
          rotate,
          opacity: exitX !== 0 ? 0 : opacity,
          backgroundColor
        }}
        className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      >
        <Card className="h-full shadow-xl border-2 border-muted overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Profile Image */}
            <div className="relative h-2/3 bg-gradient-to-br from-gray-100 to-gray-200">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                  <Avatar className="w-32 h-32">
                    <AvatarFallback className="text-4xl">
                      {profile.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Swipe Indicators */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: useTransform(x, [50, 150], [0, 1])
                }}
              >
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl transform rotate-12 border-4 border-white">
                  GILLAR
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  opacity: useTransform(x, [-150, -50], [1, 0])
                }}
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl transform -rotate-12 border-4 border-white">
                  NOPE
                </div>
              </motion.div>
            </div>

            {/* Profile Info */}
            <div className="h-1/3 p-4 bg-white flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">
                    {profile.name || 'Okänd användare'}
                  </h3>
                  {profile.age && (
                    <span className="text-lg text-muted-foreground">{profile.age}</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {profile.handicap !== null && profile.handicap !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      HCP {profile.handicap}
                    </Badge>
                  )}
                  {profile.gender && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.gender === 'man' ? 'Man' : profile.gender === 'kvinna' ? 'Kvinna' : profile.gender}
                    </Badge>
                  )}
                </div>
                
                {profile.home_club && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.home_club}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={handleSwipeLeft}
        >
          <X className="h-5 w-5 text-red-500" />
        </Button>
        
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-white border-2 border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={handleSwipeRight}
        >
          <Heart className="h-5 w-5 text-green-500" />
        </Button>
      </div>
    </div>
  );
};