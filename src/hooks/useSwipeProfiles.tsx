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
    console.log("🔍 DEBUG: Starting fetchProfiles - attempt", retryCount + 1);
    console.log("🔍 DEBUG: Current user ID:", user.id);
    console.log("🔍 DEBUG: Force refresh:", forceRefresh);
    const timestamp = Date.now();
    console.log("🔍 DEBUG: Cache breaker timestamp:", timestamp);
    setLoading(true);
    
    try {
      // Clear Supabase cache explicitly if force refresh
      if (forceRefresh) {
        console.log("🔍 DEBUG: Clearing Supabase client cache");
        // Clear any potential client-side caching
        await supabase.removeAllChannels();
      }
      
      // Build query with explicit cache-busting
      let query = supabase
        .from('profiles')
        .select(`user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city`)
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .not('age', 'is', null)
        .not('handicap', 'is', null);

      // Add cache-busting parameter to the actual query
      if (forceRefresh) {
        query = query.gte('created_at', '1970-01-01'); // Always true condition that forces fresh fetch
      }

      // Apply current filters - use memoized version to prevent dependency cycles
      const currentFilters = memoizedFilters;
      console.log("🔍 DEBUG: Applying filters:", currentFilters);
      
      // Apply age filters
      query = query.gte('age', currentFilters.minAge);
      query = query.lte('age', currentFilters.maxAge);
      console.log("🔍 DEBUG: Added age filters:", currentFilters.minAge, "-", currentFilters.maxAge);

      // Apply handicap filters  
      query = query.gte('handicap', currentFilters.minHandicap);
      query = query.lte('handicap', currentFilters.maxHandicap);
      console.log("🔍 DEBUG: Added handicap filters:", currentFilters.minHandicap, "-", currentFilters.maxHandicap);

      // Apply gender filter
      if (currentFilters.gender !== 'all') {
        query = query.eq('gender', currentFilters.gender);
        console.log("🔍 DEBUG: Added gender filter:", currentFilters.gender);
      }

      console.log("🔍 DEBUG: Executing Supabase query...");
      const { data, error } = await query.limit(100);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        console.error('❌ Full error details:', error);
        
        // Retry mechanism for failed requests
        if (retryCount < 2) {
          console.log(`🔄 Retrying fetchProfiles (attempt ${retryCount + 2}/3)`);
          fetchingRef.current = false;
          return fetchProfiles(forceRefresh, retryCount + 1);
        }
        
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
        if (currentFilters.prioritizeLocalCity) {
          try {
            // Get current user's home_city
            const { data: currentUserData } = await supabase
              .from('profiles')
              .select('home_city')
              .eq('user_id', user.id)
              .single();

            if (currentUserData?.home_city) {
              const userHomeCity = currentUserData.home_city;
              console.log("🔍 DEBUG: Sorting by local city priority. User city:", userHomeCity);
              
              // Sort profiles: same city first, then others
              filteredProfiles.sort((a, b) => {
                const aIsLocal = a.home_city === userHomeCity;
                const bIsLocal = b.home_city === userHomeCity;
                
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return 0; // Keep original order for profiles in same category
              });
              
              console.log("🔍 DEBUG: After city sorting:", filteredProfiles.map(p => `${p.name} (${p.home_city})`));
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
  }, [user, memoizedFilters]);


  useEffect(() => {
    if (user) {
      console.log("🔍 DEBUG: useEffect triggered - user:", user.id);
      console.log("🔍 DEBUG: Forcing fresh fetch due to dependency change");
      console.log("🔍 DEBUG: Current filters:", memoizedFilters);
      fetchProfiles(true).catch(console.error); // Always force refresh when dependencies change
    }
  }, [user, memoizedFilters, refreshTrigger, fetchProfiles]);

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
    console.log("🔍 DEBUG: Force refresh triggered - complete cache clear");
    
    // Clear all local state first
    setProfiles([]);
    setCurrentIndex(0);
    setLoading(true);
    
    // Force a complete refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Fetch with explicit cache busting
    setTimeout(() => {
      fetchProfiles(true, 0).catch(console.error);
    }, 100); // Small delay to ensure state is cleared
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