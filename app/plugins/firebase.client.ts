/**
 * Firebase Client SDK Plugin
 * 
 * Initializes Firebase Client SDK for client-side authentication.
 * This plugin is client-only (.client.ts suffix) to prevent server-side initialization.
 * 
 * Uses Firebase modular SDK (v9+) for tree-shaking benefits.
 * Configuration is read from runtimeConfig.public.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { logger } from '~/utils/logger';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  type Auth 
} from 'firebase/auth';

// Module-level singleton for Firebase app and auth instances
let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;

/**
 * Get the Firebase app instance
 * Returns existing instance or undefined if not initialized
 */
export function getFirebaseApp(): FirebaseApp | undefined {
  return firebaseApp;
}

/**
 * Get the Firebase Auth instance
 * Returns existing instance or undefined if not initialized
 */
export function getFirebaseAuth(): Auth | undefined {
  return firebaseAuth;
}

export default defineNuxtPlugin({
  name: 'firebase-client',
  enforce: 'pre',
  
  async setup(nuxtApp) {
    if (import.meta.server) return;
    
    const config = useRuntimeConfig();
    
    // Validate required configuration
    if (!config.public.firebaseApiKey || !config.public.firebaseAuthDomain || !config.public.firebaseProjectId) {
      logger.error('[Firebase] Missing required configuration');
      return;
    }
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket || undefined,
      messagingSenderId: config.public.firebaseMessagingSenderId || undefined,
      appId: config.public.firebaseAppId || undefined,
    };
    
    try {
      const existingApps = getApps();
      firebaseApp = existingApps[0] ?? initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      
      await setPersistence(firebaseAuth, browserLocalPersistence);
      
      nuxtApp.provide('firebaseApp', firebaseApp);
      nuxtApp.provide('firebaseAuth', firebaseAuth);
    } catch (error) {
      logger.error('[Firebase] Initialization failed:', error);
    }
  }
});

declare module '#app' {
  interface NuxtApp {
    $firebaseApp: FirebaseApp | undefined;
    $firebaseAuth: Auth | undefined;
  }
}
