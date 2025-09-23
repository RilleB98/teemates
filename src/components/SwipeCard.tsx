import { useState, useRef, useEffect } from 'react';
import { Heart, X, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/useSwipeProfiles';
import { useSwipeLimit } from '@/hooks/useSwipeLimit';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { canSwipeYes, incrementYesSwipeCount } = useSwipeLimit();

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

  const handleSwipeLeft = async () => {
    // Left swipes are always allowed
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(-100%) rotate(-30deg)';
      cardRef.current.style.opacity = '0';
      setTimeout(() => {
        onSwipeLeft();
        resetCard();
      }, 300);
    }
  };

  const handleSwipeRight = async () => {
    if (!canSwipeYes()) {
      setShowPremiumModal(true);
      return;
    }

    const success = await incrementYesSwipeCount();
    if (!success) return;

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

  // Global mouse events for better preview support
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset.x, startPos.x]);

  // Mouse events - improved for preview
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    <div className="relative w-full max-w-sm mx-auto h-[500px] sm:h-[600px]">

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
          willChange: 'transform, opacity',
          userSelect: 'none',
          touchAction: 'none'
        }}
        >
        <Card className="h-full shadow-xl border-2 border-muted overflow-hidden bg-white">
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
                  <Avatar className="w-24 sm:w-32 h-24 sm:h-32">
                    <AvatarFallback className="text-2xl sm:text-4xl">
                      {profile.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="h-1/3 p-3 sm:p-4 bg-white flex flex-col justify-between">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    {profile.name || 'Okänd användare'}
                  </h3>
                  {profile.age && (
                    <span className="text-base sm:text-lg text-muted-foreground">{profile.age}</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 sm:gap-2">
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
                
                {/* Bio Section */}
                {profile.bio && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md">
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                      "{profile.bio}"
                    </p>
                  </div>
                )}
                
                {profile.home_club && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.home_club}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mobile action buttons at bottom of card */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-6 z-20 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-red-500/90 hover:bg-red-600/90 border-red-600 text-white shadow-lg"
            onClick={handleSwipeLeft}
          >
            <X className="h-7 w-7" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full bg-green-500/90 hover:bg-green-600/90 border-green-600 text-white shadow-lg"
            onClick={handleSwipeRight}
          >
            <Heart className="h-7 w-7" />
          </Button>
        </div>
      </div>

      {/* Desktop action buttons - Hidden on mobile */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 hidden md:flex gap-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={handleSwipeLeft}
        >
          <X className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-white border-2 border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={handleSwipeRight}
        >
          <Heart className="h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
        </Button>
      </div>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};