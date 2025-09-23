import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePremium() {
  const { user } = useAuth();
  const [manualPremium, setManualPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // For now, isSubscribed is always false (no Stripe integration yet)
  const isSubscribed = false;
  
  const fetchPremiumStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check both premium status and admin role
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('manual_premium')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle()
      ]);

      if (profileResult.error) {
        console.error('Error fetching premium status:', profileResult.error);
      } else {
        setManualPremium(profileResult.data?.manual_premium || false);
      }

      // User is admin if they have admin role
      setIsAdmin(!!roleResult.data);
    } catch (error) {
      console.error('Error in fetchPremiumStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, [user?.id]);

  const isPremium = isSubscribed || manualPremium || isAdmin;

  return {
    isPremium,
    manualPremium,
    isAdmin,
    isSubscribed,
    loading,
  };
}