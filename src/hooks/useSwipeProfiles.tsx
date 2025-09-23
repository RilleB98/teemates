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

  const fetchProfiles = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log("❌ DEBUG: No user, returning early");
      return;
    }

    // Prevent race conditions
    if (fetchingRef.current && !forceRefresh) {
      console.log("🔍 DEBUG: Already fetching, skipping...");
      return;
    }

    fetchingRef.current = true;
    console.log("🔍 DEBUG: Starting fetchProfiles with complex filtering");
    console.log("🔍 DEBUG: Current user ID:", user.id);
    console.log("🔍 DEBUG: Applied filters:", filters);
    console.log("🔍 DEBUG: Force refresh:", forceRefresh);
    console.log("🔍 DEBUG: Timestamp cache breaker:", Date.now());
    setLoading(true);
    
    try {      
      // Get users that are not me with proper cache-busting
      const cacheBreaker = forceRefresh ? `&t=${Date.now()}` : '';
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city')
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .not('age', 'is', null)
        .not('handicap', 'is', null);

      // Apply filters with detailed logging - fixed logic
      console.log("🔍 DEBUG: Applying age filter - minAge:", filters.minAge, "maxAge:", filters.maxAge);
      // Always apply age filters since we have min/max values
      query = query.gte('age', filters.minAge);
      query = query.lte('age', filters.maxAge);
      console.log("🔍 DEBUG: Added age filters:", filters.minAge, "-", filters.maxAge);

      console.log("🔍 DEBUG: Applying handicap filter - minHandicap:", filters.minHandicap, "maxHandicap:", filters.maxHandicap);
      // Always apply handicap filters since we have min/max values
      query = query.gte('handicap', filters.minHandicap);
      query = query.lte('handicap', filters.maxHandicap);
      console.log("🔍 DEBUG: Added handicap filters:", filters.minHandicap, "-", filters.maxHandicap);

      console.log("🔍 DEBUG: Applying gender filter:", filters.gender);
      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
        console.log("🔍 DEBUG: Added gender filter:", filters.gender);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        return;
      }

      console.log("🔍 DEBUG: Raw profiles from database:", data?.length);
      console.log("🔍 DEBUG: Raw profile names:", data?.map(p => `${p.name} (age: ${p.age})`));

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

        // Filter out friends and restricted users with detailed logging
        console.log("🔍 DEBUG: Before filtering - profiles:", data.map(p => `${p.name} (${p.user_id})`));
        
        let filteredProfiles = data.filter(profile => {
          const isFriend = friendIds.has(profile.user_id);
          const isRestricted = restrictedIds.has(profile.user_id);
          
          if (isFriend) {
            console.log(`🔍 DEBUG: FILTERED OUT (friend): ${profile.name} (${profile.user_id})`);
          }
          if (isRestricted) {
            console.log(`🔍 DEBUG: FILTERED OUT (restricted): ${profile.name} (${profile.user_id})`);
          }
          if (!isFriend && !isRestricted) {
            console.log(`🔍 DEBUG: KEPT: ${profile.name} (${profile.user_id}) - age: ${profile.age}, handicap: ${profile.handicap}`);
          }
          
          return !isFriend && !isRestricted;
        }).map(profile => ({
          ...profile,
          bio: profile.bio || ""
        }));

        console.log("🔍 DEBUG: After friend/restriction filtering:", filteredProfiles.length);
        console.log("🔍 DEBUG: Remaining profile names:", filteredProfiles.map(p => p.name));
        console.log("🔍 DEBUG: Friends filtered out:", friendIds.size);
        console.log("🔍 DEBUG: Friend IDs:", Array.from(friendIds));
        console.log("🔍 DEBUG: Restricted users filtered out:", restrictedIds.size);
        console.log("🔍 DEBUG: Restricted IDs:", Array.from(restrictedIds));

        // Sort by local city priority if enabled
        if (filters.prioritizeLocalCity) {
          try {
            // Get current user's home_city
            const { data: currentUserData } = await supabase
              .from('profiles')
              .select('home_city')
              .eq('user_id', user.id)
              .single();

            if (currentUserData?.home_city) {
              const userHomeCity = currentUserData.home_city;
              
              // Sort profiles: same city first, then others
              filteredProfiles.sort((a, b) => {
                const aIsLocal = a.home_city === userHomeCity;
                const bIsLocal = b.home_city === userHomeCity;
                
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return 0; // Keep original order for profiles in same category
              });
            }
          } catch (cityError) {
            console.error('Error sorting by city:', cityError);
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
  }, [user, filters]);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.minAge,
    filters.maxAge, 
    filters.minHandicap,
    filters.maxHandicap,
    filters.gender,
    filters.prioritizeLocalCity
  ]);

  useEffect(() => {
    if (user) {
      console.log("🔍 DEBUG: useEffect triggered - user:", user.id, "filters changed");
      console.log("🔍 DEBUG: Forcing fresh fetch due to dependency change");
      fetchProfiles(true).catch(console.error); // Always force refresh when dependencies change
    }
  }, [user, fetchProfiles, refreshTrigger]);

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
    console.log("🔍 DEBUG: Force refresh triggered - clearing cache and fetching");
    setRefreshTrigger(prev => prev + 1);
    fetchProfiles(true).catch(console.error);
  }, [fetchProfiles]);

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