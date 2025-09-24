import { Purchases, PurchasesPackage, CustomerInfo, PurchasesOffering } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

class PurchaseService {
  private initialized = false;

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Initialize RevenueCat with your API key
      const apiKey = 'appl_dKwOmCXUHWGgKVLfAHZJUUCBJRK'; // iOS API key
      console.log('💰 Initializing RevenueCat with API key:', apiKey ? 'Key present' : 'No key');
      
      await Purchases.configure({
        apiKey: apiKey,
        appUserID: undefined, // Use default anonymous ID for now
      });

      this.initialized = true;
      console.log('💰 RevenueCat initialized successfully');
    } catch (error) {
      console.error('💰 Failed to initialize RevenueCat:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('💰 Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('💰 Raw offerings response:', offerings);
      console.log('💰 Available offerings:', offerings.all ? Object.keys(offerings.all) : 'No offerings');
      console.log('💰 Current offering:', offerings.current);
      
      const offeringsArray = offerings.all ? Object.values(offerings.all) : [];
      console.log('💰 Offerings array:', offeringsArray);
      
      return offeringsArray;
    } catch (error) {
      console.error('💰 Failed to get offerings:', error);
      return [];
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage) {
    if (!this.initialized) {
      await this.initialize();
    }

    const result = await Purchases.purchasePackage({ 
      aPackage: packageToPurchase 
    });
    console.log('💰 Purchase successful:', result);
    return result.customerInfo;
  }

  async restorePurchases() {
    if (!this.initialized) {
      await this.initialize();
    }

    const result = await Purchases.restorePurchases();
    console.log('💰 Restore successful:', result);
    return result.customerInfo;
  }

  async getCustomerInfo() {
    if (!this.initialized) {
      await this.initialize();
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  }

  async logout() {
    if (!this.initialized) {
      return;
    }

    try {
      await Purchases.logOut();
      console.log('💰 RevenueCat logged out');
    } catch (error) {
      console.error('💰 Failed to logout:', error);
    }
  }

  async identify(userId: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await Purchases.logIn({ appUserID: userId });
      console.log('💰 RevenueCat user identified:', userId);
    } catch (error) {
      console.error('💰 Failed to identify user:', error);
    }
  }

  // Check if user has active premium subscription
  isPremiumActive(customerInfo: CustomerInfo): boolean {
    if (!customerInfo?.entitlements?.active) {
      return false;
    }

    // Check for 'premium' entitlement (you'll configure this in RevenueCat dashboard)
    return !!customerInfo.entitlements.active['premium'];
  }
}

export const purchaseService = new PurchaseService();