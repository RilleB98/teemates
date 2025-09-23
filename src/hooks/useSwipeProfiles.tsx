import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
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
      // Fetch all profiles that aren't the current user and have names
      console.log("🔍 DEBUG: Fetching profiles...");
      const { data, error } = await supabase
        .from('profiles')
        .select(`user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city, play_frequency, availability`)
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .limit(200);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        throw error;
      }

      console.log(`✅ DEBUG: Raw profiles fetched: ${data?.length || 0}`);
      console.log("📋 DEBUG: Raw profiles:", data?.map(p => ({ name: p.name, id: p.user_id.slice(-6) })));
      
      if (!data || data.length === 0) {
        console.log("❌ DEBUG: No profiles found");
        setProfiles([]);
        setCurrentIndex(0);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      // Fetch filtering data in parallel for better performance
      console.log("🔍 DEBUG: Fetching filter data...");
      const [friendResult, swipeResult, restrictionResult] = await Promise.allSettled([
        supabase
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        
        supabase
          .from('user_swipes')
          .select('target_user_id')
          .eq('user_id', user.id),
        
        supabase
          .from('swipe_restrictions')
          .select('target_user_id')
          .eq('user_id', user.id)
          .or('expires_at.is.null,expires_at.gt.now()')
      ]);

      // Extract data safely from Promise.allSettled results
      const friendData = friendResult.status === 'fulfilled' ? friendResult.value.data || [] : [];
      const swipeData = swipeResult.status === 'fulfilled' ? swipeResult.value.data || [] : [];
      const restrictionData = restrictionResult.status === 'fulfilled' ? restrictionResult.value.data || [] : [];

      console.log("👥 DEBUG: Friends found:", friendData.length);
      console.log("👆 DEBUG: Previous swipes:", swipeData.length);
      console.log("🚫 DEBUG: Restrictions:", restrictionData.length);

      // Create filter sets for efficient lookup
      const friendIds = new Set(
        friendData.map(f => f.user_id === user.id ? f.friend_id : f.user_id)
      );
      
      const swipedIds = new Set(swipeData.map(s => s.target_user_id));
      const restrictedIds = new Set(restrictionData.map(r => r.target_user_id));

      console.log("🔍 DEBUG: Filter sets created");
      console.log("👥 Friend IDs:", Array.from(friendIds).map(id => id.slice(-6)));
      console.log("👆 Swiped IDs:", Array.from(swipedIds).map(id => id.slice(-6)));
      console.log("🚫 Restricted IDs:", Array.from(restrictedIds).map(id => id.slice(-6)));

      // Filter out friends, already swiped, and restricted profiles
      const availableProfiles = data.filter(profile => {
        const profileId = profile.user_id;
        
        const isFriend = friendIds.has(profileId);
        const isSwiped = swipedIds.has(profileId);
        const isRestricted = restrictedIds.has(profileId);
        
        const isExcluded = isFriend || isSwiped || isRestricted;
        
        console.log(`${isExcluded ? '❌' : '✅'} ${profile.name}: Friend=${isFriend}, Swiped=${isSwiped}, Restricted=${isRestricted}`);
        
        return !isExcluded;
      });

      console.log(`✅ DEBUG: Available profiles after filtering: ${availableProfiles.length}`);
      console.log("📋 DEBUG: Available profiles:", availableProfiles.map(p => p.name));

      // Apply user preference filters
      let finalProfiles = availableProfiles;
      
      // Apply age filter
      finalProfiles = finalProfiles.filter(profile => {
        if (!profile.age || profile.age < memoizedFilters.minAge || profile.age > memoizedFilters.maxAge) {
          console.log(`❌ AGE FILTER: ${profile.name} (age: ${profile.age})`);
          return false;
        }
        return true;
      });

      // Apply handicap filter
      finalProfiles = finalProfiles.filter(profile => {
        if (profile.handicap == null || profile.handicap < memoizedFilters.minHandicap || profile.handicap > memoizedFilters.maxHandicap) {
          console.log(`❌ HANDICAP FILTER: ${profile.name} (handicap: ${profile.handicap})`);
          return false;
        }
        return true;
      });

      // Apply gender filter
      if (memoizedFilters.gender !== 'all') {
        finalProfiles = finalProfiles.filter(profile => {
          if (profile.gender !== memoizedFilters.gender) {
            console.log(`❌ GENDER FILTER: ${profile.name} (gender: ${profile.gender})`);
            return false;
          }
          return true;
        });
      }

      // Sort by local city priority if enabled
      if (memoizedFilters.prioritizeLocalCity) {
        try {
          const { data: currentUserData } = await supabase
            .from('profiles')
            .select('home_city')
            .eq('user_id', user.id)
            .single();

          if (currentUserData?.home_city) {
            const userHomeCity = currentUserData.home_city;
            console.log("🏠 DEBUG: Sorting by city priority. User city:", userHomeCity);
            
            finalProfiles.sort((a, b) => {
              const aIsLocal = a.home_city === userHomeCity;
              const bIsLocal = b.home_city === userHomeCity;
              
              if (aIsLocal && !bIsLocal) return -1;
              if (!aIsLocal && bIsLocal) return 1;
              return 0;
            });
          }
        } catch (cityError) {
          console.error('❌ City sorting error:', cityError);
        }
      }

      // Fetch user's own favorite courses once for efficiency  
      console.log("🔍 DEBUG: Fetching user's favorite courses...");
      const { data: currentUserFavorites } = await supabase
        .from('favorite_golf_courses')
        .select('golf_course_id')
        .eq('user_id', user.id);

      console.log(`🔍 DEBUG: Current user has ${currentUserFavorites?.length || 0} favorite courses`);
      const userCourseIds = new Set(currentUserFavorites?.map(f => f.golf_course_id) || []);

      // Fetch mutual data for each profile
      console.log("🔍 DEBUG: Fetching mutual data for each profile...");
      const profilesWithMutualData = await Promise.all(
        finalProfiles.map(async (profile) => {
          try {
            console.log(`🔍 DEBUG: Processing ${profile.name}...`);
            
            // Fetch mutual friends and favorite courses in parallel
            const [profileFriends, profileFavorites, userPhotos] = await Promise.allSettled([
              // Get profile's friends to find mutual ones
              supabase
                .from('friends')
                .select('friend_id, user_id')
                .or(`user_id.eq.${profile.user_id},friend_id.eq.${profile.user_id}`)
                .eq('status', 'accepted'),
              
              // Get profile's favorite courses
              supabase
                .from('favorite_golf_courses')
                .select('golf_course_id')
                .eq('user_id', profile.user_id),
              
              // Get user photos
              supabase
                .from('user_photos')
                .select('photo_url, is_main_photo, display_order')
                .eq('user_id', profile.user_id)
                .order('display_order')
            ]);

            // Process mutual friends
            let mutual_friends: Array<{ user_id: string; name: string; avatar_url: string | null }> = [];
            if (profileFriends.status === 'fulfilled' && profileFriends.value.data) {
              // Get current user's friend IDs
              const currentUserFriends = new Set(
                friendData
                  .filter(f => f.user_id === user.id || f.friend_id === user.id)
                  .map(f => f.user_id === user.id ? f.friend_id : f.user_id)
              );
              
              // Get profile's friend IDs
              const profileFriendIds = new Set(
                profileFriends.value.data.map(f => f.user_id === profile.user_id ? f.friend_id : f.user_id)
              );
              
              // Find mutual friend IDs
              const mutualFriendIds = Array.from(currentUserFriends).filter(id => profileFriendIds.has(id));
              console.log(`🔍 DEBUG: ${profile.name} has ${mutualFriendIds.length} mutual friends`);
              
              // Get profile details for mutual friends
              if (mutualFriendIds.length > 0) {
                const { data: mutualFriendProfiles } = await supabase
                  .from('profiles')
                  .select('user_id, name, avatar_url')
                  .in('user_id', mutualFriendIds)
                  .limit(5);
                
                mutual_friends = mutualFriendProfiles || [];
              }
            }

            // Process mutual favorite courses
            let mutual_favorite_courses: Array<{ id: string; name: string }> = [];
            if (profileFavorites.status === 'fulfilled' && profileFavorites.value.data) {
              const profileCourseIds = profileFavorites.value.data.map(f => f.golf_course_id);
              console.log(`🔍 DEBUG: ${profile.name} has ${profileCourseIds.length} favorite courses`);
              
              // Find mutual course IDs
              const mutualCourseIds = profileCourseIds.filter(id => userCourseIds.has(id));
              console.log(`🔍 DEBUG: Found ${mutualCourseIds.length} mutual courses with ${profile.name}`);
              
              if (mutualCourseIds.length > 0) {
                const { data: courseDetails } = await supabase
                  .from('golf_courses')
                  .select('id, name')
                  .in('id', mutualCourseIds)
                  .limit(5);
                
                mutual_favorite_courses = courseDetails || [];
                console.log(`🔍 DEBUG: Final mutual courses for ${profile.name}:`, mutual_favorite_courses.map(c => c.name));
              }
            }

            // Process user photos
            const user_photos = userPhotos.status === 'fulfilled' && userPhotos.value.data ? userPhotos.value.data : [];

            return {
              ...profile,
              bio: profile.bio || "",
              mutual_friends,
              mutual_favorite_courses,
              user_photos
            };
          } catch (error) {
            console.error(`❌ Error fetching mutual data for ${profile.name}:`, error);
            return {
              ...profile,
              bio: profile.bio || "",
              mutual_friends: [],
              mutual_favorite_courses: [],
              user_photos: []
            };
          }
        })
      );
      
      console.log(`✅ DEBUG: Final profiles with mutual data: ${profilesWithMutualData.length}`);
      console.log("📋 DEBUG: Final profiles:", profilesWithMutualData.map(p => ({ 
        name: p.name, 
        mutualFriends: p.mutual_friends?.length || 0,
        mutualCourses: p.mutual_favorite_courses?.length || 0
      })));

      setProfiles(profilesWithMutualData);
      setCurrentIndex(0);
      setLoading(false);
      fetchingRef.current = false;

    } catch (error) {
      console.error('❌ Error in fetchProfiles:', error);
      setLoading(false);
      fetchingRef.current = false;
      
      // Retry on network errors
      if (retryCount < 2 && error instanceof Error && 
          (error.message.includes('fetch') || error.message.includes('network'))) {
        console.log(`⏳ Retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchingRef.current = false;
          fetchProfiles(forceRefresh, retryCount + 1);
        }, (retryCount + 1) * 2000);
      }
    }
  }, [user?.id, memoizedFilters]);


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
    console.log('🎯 Swipe right called for profile:', profileId);
    console.log('🎯 Current user ID:', user?.id);
    if (!user) {
      console.error('🎯 No user found for swipe right');
      return;
    }

    try {
      console.log('🎯 Step 1: Saving right swipe to database...');
      // Save right swipe to database
      const swipeResult = await supabase
        .from('user_swipes')
        .upsert({
          user_id: user.id,
          target_user_id: profileId,
          swipe_direction: 'right'
        }, {
          onConflict: 'user_id,target_user_id'
        });

      console.log('🎯 Swipe save result:', swipeResult);

      console.log('🎯 Step 2: Creating friend request...');
      // Send friend request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: profileId,
          status: 'pending'
        });

      console.log('🎯 Friend request result:', { error });

      if (error && error.code !== '23505') {
        console.error('🎯 Friend request error:', error);
        throw error;
      }

      if (error?.code === '23505') {
        console.log('🎯 Friend request already exists (duplicate key)');
      } else {
        console.log('🎯 Friend request created successfully!');
      }
    } catch (error) {
      console.error('🎯 Error processing right swipe:', error);
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