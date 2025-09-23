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
      const { data, error } = await supabase
        .from('favorite_golf_courses')
        .select(`
          golf_course_id,
          golf_courses!favorite_golf_courses_golf_course_id_fkey (
            id,
            name,
            location,
            image
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      setFavorites(data?.map(item => item.golf_course_id) || []);
      setFavoriteDetails(data?.map(item => (item as any).golf_courses).filter(Boolean) || []);
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
        const { error } = await supabase
          .from('favorite_golf_courses')
          .delete()
          .eq('user_id', user.id)
          .eq('golf_course_id', golfCourseId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== golfCourseId));
        setFavoriteDetails(prev => prev.filter(course => course.id !== golfCourseId));
        // Golfbanan har tagits bort från dina favoriter
      } else {
        const { error } = await supabase
          .from('favorite_golf_courses')
          .insert({
            user_id: user.id,
            golf_course_id: golfCourseId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, golfCourseId]);
        // Reload favorites to get the course details
        loadFavorites();
        // Golfbanan har lagts till i dina favoriter
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