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
}

export interface SwipeFilters {
  minAge: number;
  maxAge: number;
  minHandicap: number;
  maxHandicap: number;
  gender: 'all' | 'man' | 'kvinna';
}

export const useSwipeProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SwipeFilters>({
    minAge: 18,
    maxAge: 80,
    minHandicap: 0,
    maxHandicap: 54,
    gender: 'all'
  });

  const fetchProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get users that are not me and not already friends
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date')
        .neq('user_id', user.id)
        .not('name', 'is', null);

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

      const { data, error } = await query.limit(20);

      if (error) throw error;

      // Filter out existing friends
      if (data) {
        const { data: friendData } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted');

        const friendIds = friendData?.map(f => f.friend_id) || [];
        const filteredProfiles = data.filter(profile => !friendIds.includes(profile.user_id));
        
        setProfiles(filteredProfiles);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user, filters]);

  const swipeLeft = (profileId: string) => {
    console.log('Swipe left called for profile:', profileId);
    // Just move to next profile - no action needed for left swipe
    setCurrentIndex(prev => prev + 1);
  };

  const swipeRight = async (profileId: string) => {
    console.log('Swipe right called for profile:', profileId);
    if (!user) return;

    try {
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
      console.error('Error sending friend request:', error);
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
    totalProfiles: profiles.length,
    currentIndex
  };
};