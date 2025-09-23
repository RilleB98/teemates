import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePremium() {
  const { user } = useAuth();
  const [manualPremium, setManualPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // For now, isSubscribed is always false (no Stripe integration yet)
  const isSubscribed = false;
  
  const fetchPremiumStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('manual_premium')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching premium status:', error);
        return;
      }

      setManualPremium(data?.manual_premium || false);
    } catch (error) {
      console.error('Error in fetchPremiumStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, [user?.id]);

  const isPremium = isSubscribed || manualPremium;

  return {
    isPremium,
    manualPremium,
    isSubscribed,
    loading,
  };
}