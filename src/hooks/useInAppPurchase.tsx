import { useState, useEffect } from 'react';
import { purchaseService } from '@/services/purchaseService';
import { PurchasesPackage, CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export function useInAppPurchase() {
  const { user } = useAuth();
  const [offerings, setOfferings] = useState<PurchasesOffering[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const isPremiumActive = customerInfo ? purchaseService.isPremiumActive(customerInfo) : false;

  // Check if we're in a Capacitor environment (including iOS WebView)
  const isCapacitorEnvironment = () => {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    console.log('🔍 Platform Debug:', { platform, isNative, userAgent: navigator.userAgent });
    
    // Return true for iOS/Android or if we detect Capacitor in the environment
    return isNative || platform === 'ios' || platform === 'android';
  };

  // Initialize and fetch data
  useEffect(() => {
    const initializePurchases = async () => {
      const isCapacitor = isCapacitorEnvironment();
      console.log('💰 Initialize purchases - isCapacitor:', isCapacitor);
      
      if (!isCapacitor) {
        console.log('💰 Not on Capacitor platform, skipping RevenueCat initialization');
        setLoading(false);
        return;
      }

      try {
        await purchaseService.initialize();
        
        // Identify user if logged in
        if (user?.id) {
          await purchaseService.identify(user.id);
        }

        // Fetch offerings and customer info
        const offeringsData = await purchaseService.getOfferings();
        const customerData = await purchaseService.getCustomerInfo();

        setOfferings(offeringsData);
        setCustomerInfo((customerData as any)?.customerInfo || customerData);
      } catch (error) {
        console.error('💰 Failed to initialize purchases:', error);
        toast({
          title: "Fel",
          description: "Kunde inte ladda köpinformation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializePurchases();
  }, [user?.id]);

  const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
    if (purchasing) return;

    console.log('💰 Starting purchase for package:', packageToPurchase);
    setPurchasing(true);
    try {
      const result = await purchaseService.purchasePackage(packageToPurchase);
      console.log('💰 Purchase result:', result);
      setCustomerInfo((result as any)?.customerInfo || result);
      toast({
        title: "Köp genomfört!",
        description: "Du har nu tillgång till alla premium-funktioner",
      });
    } catch (error: any) {
      console.error('💰 Purchase failed:', error);
      console.error('💰 Error details:', {
        code: error.code,
        message: error.message,
        userCancelled: error.userCancelled
      });
      
      // Handle different error types
      if (error.code === 'PURCHASE_CANCELLED' || error.userCancelled) {
        console.log('💰 User cancelled purchase');
        return;
      }
      
      toast({
        title: "Köp misslyckades",
        description: error.message || "Ett fel uppstod vid köpet",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    if (purchasing) return;

    setPurchasing(true);
    try {
      const result = await purchaseService.restorePurchases();
      setCustomerInfo((result as any)?.customerInfo || result);
      toast({
        title: "Köp återställda!",
        description: "Dina tidigare köp har återställts",
      });
    } catch (error: any) {
      console.error('💰 Restore failed:', error);
      toast({
        title: "Återställning misslyckades",
        description: error.message || "Kunde inte återställa köp",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  return {
    offerings,
    customerInfo,
    isPremiumActive,
    loading,
    purchasing,
    purchasePackage,
    restorePurchases,
    isNativeApp: isCapacitorEnvironment()
  };
}