import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CourseUserProfile {
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

export const useCourseProfiles = (courseName: string) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<CourseUserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCourseProfiles = async () => {
    if (!user || !courseName) {
      return;
    }

    setLoading(true);
    try {
      // Get users with this course as home club (excluding myself)
      let query = supabase
        .from('profiles')
        .select('user_id, name, avatar_url, age, handicap, gender, home_club, birth_date, bio, home_city, play_frequency, availability')
        .eq('home_club', courseName)
        .neq('user_id', user.id)
        .not('name', 'is', null);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching course profiles:', error);
        return;
      }

      if (data) {
        // Filter out existing friends
        try {
          const { data: friendData } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted');

          const friendIds = friendData?.map(f => f.friend_id) || [];
          const filteredProfiles = data.filter(profile => !friendIds.includes(profile.user_id)).map(profile => ({
            ...profile,
            bio: profile.bio || "",
            home_city: profile.home_city || "",
            play_frequency: profile.play_frequency || null,
            availability: profile.availability || null
          }));
          
          // Randomize the order
          const randomizedProfiles = filteredProfiles.sort(() => Math.random() - 0.5);
          
          setProfiles(randomizedProfiles);
          setCurrentIndex(0);
        } catch (friendError) {
          console.error('Error fetching friends:', friendError);
          // Still set profiles even if friends query fails, randomized
          const randomizedProfiles = data.map(profile => ({
            ...profile,
            bio: profile.bio || "",
            home_city: profile.home_city || "",
            play_frequency: profile.play_frequency || null,
            availability: profile.availability || null
          })).sort(() => Math.random() - 0.5);
          setProfiles(randomizedProfiles);
          setCurrentIndex(0);
        }
      }
    } catch (error) {
      console.error('Error in fetchCourseProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && courseName) {
      fetchCourseProfiles();
    }
  }, [user, courseName]);

  const swipeLeft = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const swipeRight = async (profileId: string) => {
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
    swipeLeft,
    swipeRight,
    refetch: fetchCourseProfiles,
    totalProfiles: profiles.length,
    currentIndex
  };
};