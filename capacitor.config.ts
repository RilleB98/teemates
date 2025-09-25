import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c3a7dfcdab3b42b0ace67b83101e3118',
  appName: 'TeeMates',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    scheme: 'com.teemates.app',
    contentInset: 'automatic'
  },
  android: {
    scheme: 'com.teemates.app'
  },
  plugins: {
    Browser: {
      androidScheme: 'https'
    },
    PurchasesPlugin: {
      useAmazon: false
    }
  }
};

export default config;