import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePremium } from './usePremium';

export function useSwipeLimit() {
  const { user } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [swipeCount, setSwipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const FREE_SWIPE_LIMIT = 3;

  const fetchSwipeCount = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    console.log('🎯 Fetching swipe count for user:', user.id);
    console.log('🎯 User isPremium:', isPremium);

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

  const incrementYesSwipeCount = async () => {
    console.log('🎯 Incrementing swipe count. Current:', swipeCount, 'isPremium:', isPremium);
    
    if (!user?.id || isPremium) {
      console.log('🎯 Premium user or no user ID, allowing unlimited swipes');
      return true; // Premium användare har obegränsat
    }

    const newCount = swipeCount + 1;
    console.log('🎯 New swipe count would be:', newCount, 'Limit:', FREE_SWIPE_LIMIT);
    
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

  const canSwipeYes = () => {
    const canSwipe = isPremium || swipeCount < FREE_SWIPE_LIMIT;
    console.log('🎯 Can swipe yes:', canSwipe, 'isPremium:', isPremium, 'swipeCount:', swipeCount, 'limit:', FREE_SWIPE_LIMIT);
    return canSwipe;
  };

  const canSwipe = () => {
    return true; // Kan alltid swipea nej
  };

  const getRemainingSwipes = () => {
    if (isPremium) return 999; // "Obegränsat" för premium
    return Math.max(0, FREE_SWIPE_LIMIT - swipeCount);
  };

  useEffect(() => {
    fetchSwipeCount();
  }, [user?.id, isPremium]);

  const finalLoading = loading || premiumLoading;

  return {
    swipeCount,
    canSwipe,
    canSwipeYes,
    incrementYesSwipeCount,
    getRemainingSwipes,
    loading: finalLoading,
    FREE_SWIPE_LIMIT,
  };
}