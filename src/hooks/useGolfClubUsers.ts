import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGolfClubUsers = () => {
  const [clubUserCounts, setClubUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubUserCounts = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_golf_club_user_counts');

        if (error) {
          console.error('Error fetching club users:', error);
          return;
        }

        // Konvertera resultatet till rätt format
        const counts: Record<string, number> = {};
        data?.forEach(row => {
          if (row.home_club) {
            counts[row.home_club] = Number(row.user_count);
          }
        });

        setClubUserCounts(counts);
      } catch (error) {
        console.error('Error fetching club users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubUserCounts();

    // Lyssna på ändringar i profiles tabellen
    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchClubUserCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { clubUserCounts, loading };
};