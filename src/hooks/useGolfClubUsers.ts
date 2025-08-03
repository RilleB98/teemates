import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGolfClubUsers = () => {
  const [clubUserCounts, setClubUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubUserCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('home_club')
          .not('home_club', 'is', null);

        if (error) {
          console.error('Error fetching club users:', error);
          return;
        }

        // Räkna användare per klubb
        const counts: Record<string, number> = {};
        data?.forEach(profile => {
          if (profile.home_club) {
            counts[profile.home_club] = (counts[profile.home_club] || 0) + 1;
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