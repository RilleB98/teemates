import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';


export function useSwipeLimit() {
  const { user } = useAuth();
  const isSubscribed = true; // Premium functionality available to all users
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const FREE_SWIPE_LIMIT = 3;

  const fetchSwipeCount = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_swipe_counts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching swipe count:', error);
        return;
      }

      if (data) {
        // Kontrollera om vi behöver återställa räknaren (ny dag)
        const today = new Date().toISOString().split('T')[0];
        const lastReset = data.last_reset_date;
        
        if (lastReset !== today) {
          // Återställ räknaren för ny dag
          const { data: updatedData, error: updateError } = await supabase
            .from('user_swipe_counts')
            .update({
              swipe_count: 0,
              last_reset_date: today,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error resetting swipe count:', updateError);
            return;
          }
          
          setSwipeCount(0);
        } else {
          setSwipeCount(data.swipe_count);
        }
      } else {
        // Skapa ny post för användaren
        const today = new Date().toISOString().split('T')[0];
        const { error: insertError } = await supabase
          .from('user_swipe_counts')
          .insert({
            user_id: user.id,
            swipe_count: 0,
            last_reset_date: today,
          });

        if (insertError) {
          console.error('Error creating swipe count record:', insertError);
          return;
        }
        
        setSwipeCount(0);
      }
    } catch (error) {
      console.error('Error in fetchSwipeCount:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementSwipeCount = async () => {
    if (!user?.id || isSubscribed) return true; // Premium användare har obegränsat

    const newCount = swipeCount + 1;
    
    try {
      const { error } = await supabase
        .from('user_swipe_counts')
        .update({
          swipe_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating swipe count:', error);
        return false;
      }

      setSwipeCount(newCount);
      return true;
    } catch (error) {
      console.error('Error incrementing swipe count:', error);
      return false;
    }
  };

  const canSwipe = () => {
    if (isSubscribed) return true; // Premium användare kan alltid swipea
    return swipeCount < FREE_SWIPE_LIMIT;
  };

  const getRemainingSwipes = () => {
    if (isSubscribed) return 999; // "Obegränsat" för premium
    return Math.max(0, FREE_SWIPE_LIMIT - swipeCount);
  };

  useEffect(() => {
    fetchSwipeCount();
  }, [user?.id, isSubscribed]);

  return {
    swipeCount,
    canSwipe,
    incrementSwipeCount,
    getRemainingSwipes,
    loading,
    FREE_SWIPE_LIMIT,
  };
}