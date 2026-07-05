import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.must.smartcampus',
  appName: 'Smart Lecture',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
