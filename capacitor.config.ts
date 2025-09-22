import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c3a7dfcdab3b42b0ace67b83101e3118',
  appName: 'TeeMates',
  webDir: 'dist',
  server: {
    url: 'https://teemates.app/app?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false,
  ios: {
    scheme: 'teemates',
    contentInset: 'automatic'
  },
  android: {
    scheme: 'teemates'
  },
  plugins: {
    Browser: {
      androidScheme: 'https'
    }
  }
};

export default config;