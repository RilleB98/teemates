import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c3a7dfcdab3b42b0ace67b83101e3118',
  appName: 'teemates',
  webDir: 'dist',
  server: {
    url: 'https://c3a7dfcd-ab3b-42b0-ace6-7b83101e3118.sandbox.lovable.dev/?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;