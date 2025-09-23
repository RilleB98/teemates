import { useState, useEffect } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<{
    rawDataCount: number;
    finalCount: number;
  } | null>(null);
  const [filters, setFilters] = useState<SwipeFilters>({
    minAge: 18,
    maxAge: 80,
    minHandicap: 0,
    maxHandicap: 54,
    gender: 'all',
    prioritizeLocalCity: true
  });

  const fetchAllProfiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get ALL profiles except current user - no filters applied
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city')
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .limit(50);

      console.log("🔧 DEBUG ALL PROFILES:", data);
      
      if (data && !error) {
        const mappedProfiles = data.map(profile => ({
          ...profile,
          bio: profile.bio || ""
        }));
        setProfiles(mappedProfiles);
        setCurrentIndex(0);
        setDebugInfo({
          rawDataCount: data.length,
          finalCount: data.length
        });
      }
    } catch (error) {
      console.error('Error fetching all profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!user) {
      console.log("❌ DEBUG: No user, returning early");
      return;
    }

    console.log("🔍 DEBUG: Starting fetchProfiles with new filtering logic");
    console.log("🔍 DEBUG: Current user.id:", user.id);
    setLoading(true);
    
    try {
      // Step 1: Get accepted friends to exclude from swipe
      const { data: friendsData } = await supabase
        .from('friends')
        .select('friend_id, user_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const friendIds = friendsData?.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      console.log("🔍 DEBUG: Found friend IDs to exclude:", friendIds);

      // Step 2: Get active restrictions (rejected requests that haven't expired)
      const { data: restrictionsData } = await supabase
        .from('swipe_restrictions')
        .select('target_user_id')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()');

      const restrictedIds = restrictionsData?.map(r => r.target_user_id) || [];

      console.log("🔍 DEBUG: Found restricted IDs to exclude:", restrictedIds);

      // Step 3: Get users with mutual NO swipes to exclude them from seeing current user
      const { data: myLeftSwipes } = await supabase
        .from('user_swipes')
        .select('target_user_id')
        .eq('user_id', user.id)
        .eq('swipe_direction', 'left');

      const myLeftSwipeIds = myLeftSwipes?.map(s => s.target_user_id) || [];

      // Step 4: Build base query excluding friends and restricted users
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city')
        .neq('user_id', user.id)
        .not('name', 'is', null);

      // Exclude friends
      if (friendIds.length > 0) {
        query = query.not('user_id', 'in', `(${friendIds.join(',')})`);
      }

      // Exclude restricted users (rejected friend requests)
      if (restrictedIds.length > 0) {
        query = query.not('user_id', 'in', `(${restrictedIds.join(',')})`);
      }

      // Apply age filters
      if (filters.minAge > 0) query = query.gte('age', filters.minAge);
      if (filters.maxAge < 80) query = query.lte('age', filters.maxAge);

      // Apply handicap filters
      if (filters.minHandicap > 0 || filters.maxHandicap < 54) {
        query = query.gte('handicap', filters.minHandicap);
        query = query.lte('handicap', filters.maxHandicap);
      }

      // Apply gender filter
      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      const { data, error } = await query.limit(50);

      console.log("🔍 DEBUG: Raw query result:");
      console.log("🔍 DEBUG: - Error:", error);
      console.log("🔍 DEBUG: - Data count:", data?.length);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        return;
      }

      if (data) {
        // Step 5: Add mutual protection - don't show users who swiped left on current user  
        const { data: theirLeftSwipes } = await supabase
          .from('user_swipes')
          .select('user_id')
          .eq('swipe_direction', 'left')
          .in('user_id', data.map(p => p.user_id))
          .eq('target_user_id', user.id);

        const usersWhoLeftSwipedMe = theirLeftSwipes?.map(s => s.user_id) || [];

        // Filter out users who left-swiped the current user
        let filteredProfiles = data
          .filter(profile => !usersWhoLeftSwipedMe.includes(profile.user_id))
          .map(profile => ({
            ...profile,
            bio: profile.bio || ""
          }));

        console.log("🔍 DEBUG: Profiles after mutual protection filter:");
        console.log("🔍 DEBUG: - Count:", filteredProfiles.length);

        // Sort by local city priority if enabled
        if (filters.prioritizeLocalCity) {
          try {
            const { data: currentUserData } = await supabase
              .from('profiles')
              .select('home_city')
              .eq('user_id', user.id)
              .single();

            if (currentUserData?.home_city) {
              const userHomeCity = currentUserData.home_city;
              
              filteredProfiles.sort((a, b) => {
                const aIsLocal = a.home_city === userHomeCity;
                const bIsLocal = b.home_city === userHomeCity;
                
                if (aIsLocal && !bIsLocal) return -1;
                if (!aIsLocal && bIsLocal) return 1;
                return 0;
              });
            }
          } catch (cityError) {
            console.error('Error sorting by city:', cityError);
          }
        }
        
        console.log("🔍 DEBUG: Final profiles to set:");
        console.log("🔍 DEBUG: - Final count:", filteredProfiles.length);
        
        setDebugInfo({ rawDataCount: data?.length || 0, finalCount: filteredProfiles.length });
        setProfiles(filteredProfiles);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfiles().catch(console.error);
    }
  }, [user, filters]);

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

      console.log('✅ Left swipe saved successfully');
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

  return {
    currentProfile,
    hasMoreProfiles,
    loading,
    filters,
    setFilters,
    swipeLeft,
    swipeRight,
    refetch: fetchProfiles,
    fetchAllProfiles,
    totalProfiles: profiles.length,
    currentIndex,
    debugInfo
  };
};