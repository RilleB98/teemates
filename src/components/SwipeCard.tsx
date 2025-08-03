import { useState, useRef } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (dragOffset.x > threshold) {
      // Swipe right
      handleSwipeRight();
    } else if (dragOffset.x < -threshold) {
      // Swipe left
      handleSwipeLeft();
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
  };

  const handleSwipeLeft = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(-100%) rotate(-30deg)';
      cardRef.current.style.opacity = '0';
      setTimeout(() => {
        onSwipeLeft();
        resetCard();
      }, 300);
    }
  };

  const handleSwipeRight = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(100%) rotate(30deg)';
      cardRef.current.style.opacity = '0';
      setTimeout(() => {
        onSwipeRight();
        resetCard();
      }, 300);
    }
  };

  const resetCard = () => {
    setDragOffset({ x: 0, y: 0 });
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '1';
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Calculate rotation and opacity based on drag offset
  const rotation = Math.min(Math.max(dragOffset.x / 10, -30), 30);
  const opacity = Math.max(1 - Math.abs(dragOffset.x) / 300, 0);

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing select-none transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg)`,
          opacity: isDragging ? opacity : 1,
        }}
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
      </div>

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