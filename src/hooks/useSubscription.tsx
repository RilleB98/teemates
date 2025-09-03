import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  updateSubscriptionStatus: (subscribed: boolean, tier?: string, endDate?: Date) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user?.email) {
      setIsSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      // If user is admin, they automatically get premium
      if (isAdmin) {
        setIsSubscribed(true);
        setSubscriptionTier('Admin');
        setSubscriptionEnd(null); // No expiry for admin
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setIsSubscribed(data.subscribed);
        setSubscriptionTier(data.subscription_tier);
        setSubscriptionEnd(data.subscription_end ? new Date(data.subscription_end) : null);
      } else {
        setIsSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subscribed: boolean, tier?: string, endDate?: Date) => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          email: user.email,
          user_id: user.id,
          subscribed,
          subscription_tier: tier || null,
          subscription_end: endDate?.toISOString() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (error) {
        console.error('Error updating subscription:', error);
        return;
      }

      setIsSubscribed(subscribed);
      setSubscriptionTier(tier || null);
      setSubscriptionEnd(endDate || null);
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user?.email, isAdmin]); // Also refresh when admin status changes

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      subscriptionTier,
      subscriptionEnd,
      loading,
      refreshSubscription,
      updateSubscriptionStatus,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}