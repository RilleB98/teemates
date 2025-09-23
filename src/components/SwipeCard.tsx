import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal';
import { useSwipeLimit } from '@/hooks/useSwipeLimit';
import { MutualFriends } from '@/components/MutualFriends';
import { MutualFavoriteCourses } from '@/components/MutualFavoriteCourses';
import { InfoBadges } from '@/components/InfoBadges';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SwipeCardProps {
  profile: {
    user_id: string;
    name: string | null;
    avatar_url: string | null;
    age: number | null;
    handicap: number | null;
    gender: string | null;
    home_club: string | null;
    birth_date: string | null;
    bio: string | null;
    home_city: string | null;
    play_frequency: string | null;
    availability: string | null;
    mutual_friends?: Array<{
      user_id: string;
      name: string;
      avatar_url: string | null;
    }>;
    mutual_favorite_courses?: Array<{
      id: string;
      name: string;
    }>;
    user_photos?: Array<{
      photo_url: string;
      is_main_photo: boolean;
      display_order: number;
    }>;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const SwipeCard = ({ profile, onSwipeLeft, onSwipeRight }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startPos, setStartPos] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { canSwipeYes, incrementYesSwipeCount } = useSwipeLimit();

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartPos(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos;
    setDragOffset(deltaX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    
    if (dragOffset > threshold) {
      handleSwipeRight();
    } else if (dragOffset < -threshold) {
      handleSwipeLeft();
    } else {
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  const handleSwipeLeft = async () => {
    setDragOffset(0);
    setTimeout(() => {
      onSwipeLeft();
      resetCard();
    }, 100);
  };

  const handleSwipeRight = async () => {
    if (!canSwipeYes()) {
      setShowPremiumModal(true);
      return;
    }

    const success = await incrementYesSwipeCount();
    if (!success) return;

    setDragOffset(0);
    setTimeout(() => {
      onSwipeRight();
      resetCard();
    }, 100);
  };

  const resetCard = () => {
    setDragOffset(0);
    setIsDragging(false);
  };

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
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
  }, [isDragging, dragOffset, startPos]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Calculate visual feedback
  const rotation = Math.min(Math.max(dragOffset / 10, -15), 15);
  const opacity = Math.max(1 - Math.abs(dragOffset) / 400, 0.7);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <Card
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          relative w-full max-w-sm mx-auto bg-gradient-to-br from-card to-card/95 
          shadow-xl border-0 cursor-grab active:cursor-grabbing select-none
          transition-all duration-200 ease-out overflow-hidden
          ${isDragging ? 'scale-105 shadow-2xl' : ''}
          hover:shadow-xl
        `}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
          opacity: isDragging ? opacity : 1,
          height: '750px', // Increased height for more content
        }}
      >
        {/* Main profile image with gradient overlay */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={profile.avatar_url || '/placeholder.svg'}
            alt={profile.name || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Name and age overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold tracking-tight">
              {profile.name || 'Okänt namn'}
              {profile.age && <span className="text-2xl font-normal">, {profile.age}</span>}
            </h2>
            {profile.home_city && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} />
                <span className="text-sm">{profile.home_city}</span>
              </div>
            )}
          </div>
          
          {/* Dislike overlay */}
          {dragOffset < -50 && (
            <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <X size={40} className="text-white" />
              </div>
            </div>
          )}
          
          {/* Like overlay */}
          {dragOffset > 50 && (
            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center z-10">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Heart size={40} className="text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable profile content */}
        <ScrollArea className="flex-1 px-6 pb-20">
          <div className="space-y-4 py-4">
            {/* Quick info badges */}
            <InfoBadges 
              playFrequency={profile.play_frequency}
              availability={profile.availability}
              handicap={profile.handicap}
              homeCity={profile.home_city}
            />

            {/* Golf info */}
            {profile.home_club && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User size={16} />
                  Golfinfo
                </h3>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-medium">Hemklubb:</span>
                    <span className="ml-2">{profile.home_club}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Om mig</h3>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Mutual friends */}
            {profile.mutual_friends && (
              <MutualFriends mutualFriends={profile.mutual_friends} />
            )}

            {/* Mutual favorite courses */}
            {profile.mutual_favorite_courses && (
              <MutualFavoriteCourses mutualCourses={profile.mutual_favorite_courses} />
            )}
          </div>
        </ScrollArea>
      </Card>
      
      {/* Fixed action buttons - always visible */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-6 z-20">
        {/* Desktop buttons */}
        <div className="hidden md:flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwipeLeft}
            className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 bg-card/95 backdrop-blur-sm shadow-lg transition-colors"
          >
            <X size={24} className="text-red-500" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwipeRight}
            className="w-16 h-16 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 bg-card/95 backdrop-blur-sm shadow-lg transition-colors"
          >
            <Heart size={24} className="text-green-500" />
          </Button>
        </div>
        
        {/* Mobile buttons */}
        <div className="flex gap-4 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwipeLeft}
            className="w-14 h-14 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 bg-card/95 backdrop-blur-sm shadow-lg transition-colors"
          >
            <X size={20} className="text-red-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwipeRight}
            className="w-14 h-14 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 bg-card/95 backdrop-blur-sm shadow-lg transition-colors"
          >
            <Heart size={20} className="text-green-500" />
          </Button>
        </div>
      </div>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};