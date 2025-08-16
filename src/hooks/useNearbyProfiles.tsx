import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NearbyProfile {
  user_id: string;
  name: string;
  avatar_url: string;
  age: number;
  handicap: number;
  gender: string;
  home_club: string;
  home_city: string;
}

export const useNearbyProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<NearbyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCity, setUserCity] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNearbyProfiles();
    }
  }, [user]);

  const fetchNearbyProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First get current user's home_city
      const { data: currentUserProfile, error: userError } = await supabase
        .from('profiles')
        .select('home_city')
        .eq('user_id', user.id)
        .single();

      if (userError || !currentUserProfile?.home_city) {
        console.log('User has no home city set or error fetching user profile');
        setProfiles([]);
        setLoading(false);
        return;
      }

      setUserCity(currentUserProfile.home_city);

      // Get profiles from the same city, excluding current user
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, home_city')
        .eq('home_city', currentUserProfile.home_city)
        .neq('user_id', user.id)
        .not('name', 'is', null)
        .not('home_city', 'is', null)
        .limit(20);

      if (error) {
        console.error('Error fetching nearby profiles:', error);
        setProfiles([]);
      } else {
        // Filter out existing friends
        try {
          const { data: friendData } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted');

          const friendIds = friendData?.map(f => f.friend_id) || [];
          const filteredProfiles = data?.filter(profile => !friendIds.includes(profile.user_id)) || [];
          
          setProfiles(filteredProfiles);
        } catch (friendError) {
          console.error('Error fetching friends:', friendError);
          // Still set profiles even if friends query fails
          setProfiles(data || []);
        }
      }
    } catch (error) {
      console.error('Error in fetchNearbyProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    loading,
    userCity,
    refetch: fetchNearbyProfiles
  };
};