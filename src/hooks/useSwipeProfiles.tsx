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
    if (!user) {
      console.log("No user, returning early");
      return;
    }

    console.log("Setting loading to true");
    setLoading(true);
    try {
      // Get users that are not me and not already friends
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio')
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

      const { data, error } = await query.limit(50); // Increase limit to account for filtering

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      // Filter out existing friends and users swiped on in last month
      if (data) {
        try {
          // Get friends
          const { data: friendData } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted');

          // Get users swiped on in the last month
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          const { data: swipeData } = await supabase
            .from('user_swipes')
            .select('target_user_id')
            .eq('user_id', user.id)
            .gte('created_at', oneMonthAgo.toISOString());

          const friendIds = friendData?.map(f => f.friend_id) || [];
          const swipedUserIds = swipeData?.map(s => s.target_user_id) || [];
          const excludedIds = [...friendIds, ...swipedUserIds];
          
          const filteredProfiles = data.filter(profile => !excludedIds.includes(profile.user_id)).map(profile => ({
            ...profile,
            bio: profile.bio || ""
          }));
          
          console.log('Fetched profiles:', filteredProfiles.length);
          setProfiles(filteredProfiles);
          setCurrentIndex(0);
        } catch (friendError) {
          console.error('Error fetching friends or swipes:', friendError);
          // Still set profiles even if friends/swipes query fails
          const mappedProfiles = data.map(profile => ({
            ...profile,
            bio: profile.bio || ""
          }));
          setProfiles(mappedProfiles);
          setCurrentIndex(0);
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
    totalProfiles: profiles.length,
    currentIndex
  };
};