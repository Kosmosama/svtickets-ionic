import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.kosmo.svtickets',
  appName: 'ionic-events',
  webDir: 'www',
  android: {
    allowMixedContent: true,
  }
};

export default config;
