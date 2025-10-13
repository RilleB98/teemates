import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, User } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug mutual favorite courses
  console.log(`🏌️ Profile ${profile.name} mutual_favorite_courses:`, profile.mutual_favorite_courses);

  
  // Get all available images (avatar + user_photos)
  const availableImages = useMemo(() => {
    const images = [];
    if (profile.avatar_url) {
      images.push(profile.avatar_url);
    }
    if (profile.user_photos && profile.user_photos.length > 0) {
      profile.user_photos
        .sort((a, b) => a.display_order - b.display_order)
        .forEach(photo => {
          if (photo.photo_url && photo.photo_url !== profile.avatar_url) {
            images.push(photo.photo_url);
          }
        });
    }
    console.log(`🖼️ Available images for ${profile.name}:`, images);
    return images;
  }, [profile.avatar_url, profile.user_photos, profile.name]);

  // Reset image index when profile changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [profile.user_id]);

  // Handle image navigation - improved to handle both mouse and touch events
  const handleImageNavigation = (direction: 'prev' | 'next', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Prevent swipe detection
    e.preventDefault();
    
    console.log(`🖼️ Image navigation: ${direction}, current: ${currentImageIndex}, total: ${availableImages.length}`);
    
    if (availableImages.length <= 1) {
      console.log(`🖼️ Only ${availableImages.length} image(s), no navigation needed`);
      return;
    }
    
    if (direction === 'next') {
      const newIndex = (currentImageIndex + 1) % availableImages.length;
      console.log(`🖼️ Moving to next image: ${newIndex}`);
      setCurrentImageIndex(newIndex);
    } else {
      const newIndex = currentImageIndex === 0 ? availableImages.length - 1 : currentImageIndex - 1;
      console.log(`🖼️ Moving to previous image: ${newIndex}`);
      setCurrentImageIndex(newIndex);
    }
  };

  // Calculate content sections and determine if scrolling is needed
  const { cardHeight, needsScroll } = useMemo(() => {
    const baseHeight = 320; // Image height
    const paddingHeight = 64; // Padding and margins
    
    let contentSections = 0;
    
    // Count sections that have content
    if (profile.play_frequency || profile.availability || profile.handicap || profile.home_city) {
      contentSections++; // Info badges
    }
    if (profile.home_club) {
      contentSections++; // Golf info
    }
    if (profile.bio) {
      contentSections++; // Bio
    }
    if (profile.mutual_friends && profile.mutual_friends.length > 0) {
      contentSections++; // Mutual friends
    }
    if (profile.mutual_favorite_courses && profile.mutual_favorite_courses.length > 0) {
      contentSections++; // Mutual courses
    }
    
    const estimatedContentHeight = contentSections * 80; // ~80px per section
    const totalHeight = baseHeight + estimatedContentHeight + paddingHeight;
    
    const maxHeightWithoutScroll = 600; // Max height before scrolling
    const needsScrolling = totalHeight > maxHeightWithoutScroll;
    
    return {
      cardHeight: needsScrolling ? 650 : Math.min(totalHeight, maxHeightWithoutScroll),
      needsScroll: needsScrolling
    };
  }, [
    profile.play_frequency,
    profile.availability, 
    profile.handicap,
    profile.home_city,
    profile.home_club,
    profile.bio,
    profile.mutual_friends,
    profile.mutual_favorite_courses
  ]);

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
          height: `${cardHeight}px`,
        }}
      >
        {/* Main profile image with gradient overlay */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={availableImages[currentImageIndex] || '/placeholder.svg'}
            alt={profile.name || 'Profile'}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Image navigation areas - only show if multiple images */}
          {availableImages.length > 1 && (
            <>
              {/* Left navigation area (previous image) */}
              <div
                className="absolute left-0 top-0 w-1/2 h-full z-30 cursor-pointer flex items-center justify-start pl-4"
                onClick={(e) => handleImageNavigation('prev', e)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleImageNavigation('prev', e);
                }}
                style={{ background: 'transparent' }}
              >
                <div className="opacity-0 hover:opacity-100 active:opacity-100 transition-opacity bg-black/20 rounded-full p-2">
                  <div className="w-2 h-2 border-l-2 border-b-2 border-white transform rotate-45"></div>
                </div>
              </div>
              
              {/* Right navigation area (next image) */}
              <div
                className="absolute right-0 top-0 w-1/2 h-full z-30 cursor-pointer flex items-center justify-end pr-4"
                onClick={(e) => handleImageNavigation('next', e)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleImageNavigation('next', e);
                }}
                style={{ background: 'transparent' }}
              >
                <div className="opacity-0 hover:opacity-100 active:opacity-100 transition-opacity bg-black/20 rounded-full p-2">
                  <div className="w-2 h-2 border-r-2 border-b-2 border-white transform -rotate-45"></div>
                </div>
              </div>
              
              {/* Image indicators */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-40">
                {availableImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Name and age overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold tracking-tight">
              {profile.name?.split(' ')[0] || 'Okänt namn'}
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

        {/* Scrollable or static profile content */}
        {needsScroll ? (
          <ScrollArea className="flex-1 px-6 pb-4">
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
        ) : (
          <div className="flex-1 px-6 pb-4">
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
          </div>
        )}
      </Card>
      
      {/* Fixed action buttons positioned above bottom navigation */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex gap-6 z-30">
        {/* Desktop and mobile buttons */}
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

    </div>
  );
};