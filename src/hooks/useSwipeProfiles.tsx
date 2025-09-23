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

    console.log("🔍 DEBUG: Starting fetchProfiles");
    console.log("🔍 DEBUG: Current user.id:", user.id);
    console.log("🔍 DEBUG: Current filters:", filters);
    setLoading(true);
    
    try {
      // Get users that are not me and not already friends
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city')
        .neq('user_id', user.id)
        .not('name', 'is', null);

      console.log("🔍 DEBUG: Base query created, excluding user_id:", user.id);

      // Apply filters
      if (filters.minAge || filters.maxAge) {
        if (filters.minAge > 0) query = query.gte('age', filters.minAge);
        if (filters.maxAge < 80) query = query.lte('age', filters.maxAge);
      }

      if (filters.minHandicap > 0 || filters.maxHandicap < 54) {
        query = query.gte('handicap', filters.minHandicap);
        query = query.lte('handicap', filters.maxHandicap);
      }

      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      const { data, error } = await query.limit(50); // Increase limit to account for filtering

      console.log("🔍 DEBUG: Raw Supabase query result:");
      console.log("🔍 DEBUG: - Error:", error);
      console.log("🔍 DEBUG: - Data count:", data?.length);
      console.log("🔍 DEBUG: - Raw data:", data);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        return;
      }

      // No filtering - show all profiles that match filters
      if (data) {
        try {
          let filteredProfiles = data.map(profile => ({
            ...profile,
            bio: profile.bio || ""
          }));

          console.log("🔍 DEBUG: All profiles after basic filters:");
          console.log("🔍 DEBUG: - Profiles count:", filteredProfiles.length);
          console.log("🔍 DEBUG: - Profiles:", filteredProfiles.map(p => ({ user_id: p.user_id, name: p.name })));

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
          
          console.log("🔍 DEBUG: Final profiles to set:");
          console.log("🔍 DEBUG: - Final count:", filteredProfiles.length);
          console.log("🔍 DEBUG: - Final profiles:", filteredProfiles.map(p => ({ user_id: p.user_id, name: p.name, age: p.age, handicap: p.handicap, gender: p.gender, home_city: p.home_city })));
          
          // Update debug info with final count
          setDebugInfo({ rawDataCount: data?.length || 0, finalCount: filteredProfiles.length });
          
          setProfiles(filteredProfiles);
          setCurrentIndex(0);
        } catch (cityError) {
          console.error('Error sorting by city:', cityError);
          // Still set profiles even if city sorting fails
          const mappedProfiles = data.map(profile => ({
            ...profile,
            bio: profile.bio || ""
          }));
          setProfiles(mappedProfiles);
          setCurrentIndex(0);
          setDebugInfo({ rawDataCount: data?.length || 0, finalCount: mappedProfiles.length });
        }
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