import { useState, useEffect } from 'react';
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
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Set up real-time subscription for profile updates
    if (user) {
      const subscription = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Profile updated:', payload);
            setProfile(payload.new as UserProfile);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return { profile, loading, refetch: fetchProfile };
};