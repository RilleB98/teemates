import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';

export const useFavoriteGolfCourses = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
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
        .select('golf_course_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      setFavorites(data?.map(item => item.golf_course_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Kunde inte ladda favoriter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (golfCourseId: string) => {
    if (!user) {
      toast({
        title: "Logga in",
        description: "Du måste vara inloggad för att markera favoriter",
        variant: "destructive",
      });
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
        toast({
          title: "Borttagen från favoriter",
          description: "Golfbanan har tagits bort från dina favoriter",
        });
      } else {
        const { error } = await supabase
          .from('favorite_golf_courses')
          .insert({
            user_id: user.id,
            golf_course_id: golfCourseId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, golfCourseId]);
        toast({
          title: "Tillagd i favoriter",
          description: "Golfbanan har lagts till i dina favoriter",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Kunde inte uppdatera favoriter",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (golfCourseId: string) => favorites.includes(golfCourseId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };
};