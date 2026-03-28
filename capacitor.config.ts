import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mygusto.app',
  appName: 'MyGusto',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
