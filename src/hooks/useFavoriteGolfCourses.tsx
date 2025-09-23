import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { useAuth } from './useAuth';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  image: string;
}

export const useFavoriteGolfCourses = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteDetails, setFavoriteDetails] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      // First get the favorite course IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorite_golf_courses')
        .select('golf_course_id')
        .eq('user_id', user?.id);

      if (favoritesError) throw favoritesError;

      const favoriteIds = favoritesData?.map(item => item.golf_course_id) || [];
      setFavorites(favoriteIds);

      // Then get the full course details for favorites
      if (favoriteIds.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from('golf_courses')
          .select('id, name, location, image')
          .in('id', favoriteIds);

        if (coursesError) throw coursesError;
        
        setFavoriteDetails(coursesData || []);
      } else {
        setFavoriteDetails([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (golfCourseId: string) => {
    if (!user) {
      return;
    }

    const isFavorite = favorites.includes(golfCourseId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_golf_courses')
          .delete()
          .eq('user_id', user.id)
          .eq('golf_course_id', golfCourseId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== golfCourseId));
        setFavoriteDetails(prev => prev.filter(course => course.id !== golfCourseId));
      } else {
        // Add to favorites - use upsert to handle duplicates
        const { error } = await supabase
          .from('favorite_golf_courses')
          .upsert({
            user_id: user.id,
            golf_course_id: golfCourseId
          }, {
            onConflict: 'user_id,golf_course_id'
          });

        if (error) throw error;

        // Add to local state immediately
        setFavorites(prev => [...prev, golfCourseId]);
        
        // Get the course details for the new favorite
        const { data: courseData } = await supabase
          .from('golf_courses')
          .select('id, name, location, image')
          .eq('id', golfCourseId)
          .maybeSingle();

        if (courseData) {
          setFavoriteDetails(prev => [...prev, courseData]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (golfCourseId: string) => favorites.includes(golfCourseId);

  return {
    favorites,
    favoriteDetails,
    loading,
    toggleFavorite,
    isFavorite
  };
};