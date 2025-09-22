import { registerPlugin } from '@capacitor/core';

export interface WebAuthPlugin {
  startWebAuth(options: { url: string }): Promise<{ url: string }>;
}

const WebAuth = registerPlugin<WebAuthPlugin>('WebAuth');

export default WebAuth;