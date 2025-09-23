import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string;
  age: number;
  handicap: number;
  gender: string;
  home_club: string;
  birth_date: string;
  bio: string;
  home_city: string;
}

export interface SwipeFilters {
  minAge: number;
  maxAge: number;
  minHandicap: number;
  maxHandicap: number;
  gender: 'all' | 'man' | 'kvinna';
  prioritizeLocalCity: boolean;
}

export const useSwipeProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fetchingRef = useRef(false);
  const [filters, setFilters] = useState<SwipeFilters>({
    minAge: 18,
    maxAge: 80,
    minHandicap: 0,
    maxHandicap: 54,
    gender: 'all',
    prioritizeLocalCity: true
  });

  // Memoize filters to prevent unnecessary re-renders and dependency cycles
  const memoizedFilters = useMemo(() => filters, [
    filters.minAge,
    filters.maxAge, 
    filters.minHandicap,
    filters.maxHandicap,
    filters.gender,
    filters.prioritizeLocalCity
  ]);

  const fetchProfiles = useCallback(async (forceRefresh = false, retryCount = 0) => {
    if (!user?.id) {
      console.log("❌ DEBUG: No user, returning early");
      return;
    }

    // Prevent race conditions
    if (fetchingRef.current && !forceRefresh) {
      console.log("🔍 DEBUG: Already fetching, skipping...");
      return;
    }

    fetchingRef.current = true;
    console.log("🔍 DEBUG: Starting fetchProfiles - attempt", retryCount + 1);
    
    setLoading(true);
    
    try {
      // Simple query without dangerous auth operations
      const { data, error } = await supabase
        .from('profiles')
        .select(`user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city`)
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .limit(200);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        
        // Enhanced retry mechanism
        if (retryCount < 3) {
          console.log(`🔄 RETRY: Attempt ${retryCount + 2}/4 with exponential backoff`);
          fetchingRef.current = false;
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s delays
          setTimeout(() => fetchProfiles(true, retryCount + 1), delay);
        }
        return;
      }

      console.log("✅ RAW DATA: Fetched", data?.length, "profiles from database");
      console.log("📋 RAW NAMES:", data?.map(p => `${p.name} (ID: ${p.user_id.slice(-6)})`).join(', '));
      
      if (!data || data.length === 0) {
        console.log("⚠️ NO DATA: Database returned empty result");
        if (retryCount < 2) {
          console.log("🔄 RETRY: Empty result, trying again...");
          fetchingRef.current = false;
          setTimeout(() => fetchProfiles(true, retryCount + 1), 2000);
        }
        return;
      }

      if (data) {
        // Get accepted friends to filter out
        const { data: friendsData } = await supabase
          .from('friends')
          .select('friend_id, user_id')
          .eq('status', 'accepted')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        const friendIds = new Set(
          friendsData?.map(friend => 
            friend.user_id === user.id ? friend.friend_id : friend.user_id
          ) || []
        );

        // Get active restrictions (rejected friend requests that haven't expired)
        const { data: restrictionsData } = await supabase
          .from('swipe_restrictions')
          .select('target_user_id')
          .eq('user_id', user.id)
          .eq('restriction_type', 'rejected_friend_request')
          .or('expires_at.is.null,expires_at.gt.now()');

        const restrictedIds = new Set(
          restrictionsData?.map(r => r.target_user_id) || []
        );

        // Get existing swipes to filter out
        const { data: swipesData } = await supabase
          .from('user_swipes')
          .select('target_user_id')
          .eq('user_id', user.id);

        const swipedIds = new Set(
          swipesData?.map(s => s.target_user_id) || []
        );

        console.log("🔍 FILTERING: Starting with", data.length, "profiles");
        console.log("🔍 FILTERING: Friend IDs to exclude:", Array.from(friendIds));
        console.log("🔍 FILTERING: Restricted IDs to exclude:", Array.from(restrictedIds));
        console.log("🔍 FILTERING: Swiped IDs to exclude:", Array.from(swipedIds));
        
        // Apply all filters
        let filteredProfiles = data.filter(profile => {
          const isFriend = friendIds.has(profile.user_id);
          const isRestricted = restrictedIds.has(profile.user_id);
          const isAlreadySwiped = swipedIds.has(profile.user_id);
          
          if (isFriend || isRestricted || isAlreadySwiped) {
            console.log(`❌ FILTERED OUT: ${profile.name} - Friend:${isFriend} Restricted:${isRestricted} Swiped:${isAlreadySwiped}`);
            return false;
          }
          
          console.log(`✅ KEPT: ${profile.name} (ID: ${profile.user_id.slice(-6)})`);
          return true;
        });

        // Apply age and handicap filters from current state
        const currentFilters = memoizedFilters;
        console.log("🎯 APPLYING FILTERS:", currentFilters);
        
        filteredProfiles = filteredProfiles.filter(profile => {
          // Age filter
          if (profile.age < currentFilters.minAge || profile.age > currentFilters.maxAge) {
            console.log(`❌ AGE FILTERED: ${profile.name} (age: ${profile.age})`);
            return false;
          }
          
          // Handicap filter
          if (profile.handicap < currentFilters.minHandicap || profile.handicap > currentFilters.maxHandicap) {
            console.log(`❌ HANDICAP FILTERED: ${profile.name} (handicap: ${profile.handicap})`);
            return false;
          }
          
          // Gender filter
          if (currentFilters.gender !== 'all' && profile.gender !== currentFilters.gender) {
            console.log(`❌ GENDER FILTERED: ${profile.name} (gender: ${profile.gender})`);
            return false;
          }
          
          return true;
        }).map(profile => ({
          ...profile,
          bio: profile.bio || ""
        }));

        console.log("✅ FINAL RESULT:", filteredProfiles.length, "profiles after all filtering");
        console.log("📋 FINAL NAMES:", filteredProfiles.map(p => p.name).join(', '));

        // Sort by local city priority if enabled
        if (currentFilters.prioritizeLocalCity) {
          try {
            const { data: currentUserData } = await supabase
              .from('profiles')
              .select('home_city')
              .eq('user_id', user.id)
              .single();

            if (currentUserData?.home_city) {
              const userHomeCity = currentUserData.home_city;
              console.log("🏠 CITY SORT: User city is", userHomeCity);
              
              filteredProfiles.sort((a, b) => {
                const aIsLocal = a.home_city === userHomeCity;
                const bIsLocal = b.home_city === userHomeCity;
                
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return 0;
              });
              
              console.log("🏠 CITY SORTED:", filteredProfiles.map(p => `${p.name} (${p.home_city})`));
            }
          } catch (cityError) {
            console.error('❌ City sorting error:', cityError);
          }
        }
        
        setProfiles(filteredProfiles);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('❌ Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, memoizedFilters]);


  useEffect(() => {
    if (user?.id && !fetchingRef.current) {
      console.log("🔍 DEBUG: useEffect triggered - user:", user.id);
      fetchProfiles(false).catch(console.error);
    }
  }, [user?.id, memoizedFilters, refreshTrigger]);

  const swipeLeft = async (profileId: string) => {
    console.log('Swipe left called for profile:', profileId);
    if (!user) return;

    try {
      // Save left swipe to database
      await supabase
        .from('user_swipes')
        .upsert({
          user_id: user.id,
          target_user_id: profileId,
          swipe_direction: 'left'
        }, {
          onConflict: 'user_id,target_user_id'
        });

      // Prevent the target user from seeing this user in their swipe
      await supabase
        .from('swipe_restrictions')
        .upsert({
          user_id: profileId,
          target_user_id: user.id,
          restriction_type: 'rejected_friend_request',
          expires_at: null // No expiry for left swipes
        }, {
          onConflict: 'user_id,target_user_id,restriction_type'
        });
    } catch (error) {
      console.error('Error saving left swipe:', error);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const swipeRight = async (profileId: string) => {
    console.log('Swipe right called for profile:', profileId);
    if (!user) return;

    try {
      // Save right swipe to database
      await supabase
        .from('user_swipes')
        .upsert({
          user_id: user.id,
          target_user_id: profileId,
          swipe_direction: 'right'
        }, {
          onConflict: 'user_id,target_user_id'
        });

      // Send friend request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: profileId,
          status: 'pending'
        });

      if (error && error.code !== '23505') {
        throw error;
      }
    } catch (error) {
      console.error('Error processing right swipe:', error);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  const forceRefresh = useCallback(() => {
    if (fetchingRef.current) return; // Prevent multiple concurrent refreshes
    
    console.log("🔍 DEBUG: Force refresh triggered");
    setProfiles([]);
    setCurrentIndex(0);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    currentProfile,
    hasMoreProfiles,
    loading,
    filters,
    setFilters,
    swipeLeft,
    swipeRight,
    refetch: fetchProfiles,
    forceRefresh,
    totalProfiles: profiles.length,
    currentIndex
  };
};