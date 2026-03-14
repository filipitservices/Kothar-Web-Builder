/**
 * Firebase Admin SDK Server Utility
 * 
 * Initializes and memoizes the Firebase Admin SDK for Nitro server endpoints.
 * This utility is server-only and should never be imported in client code.
 * 
 * Credentials are read from runtimeConfig (server-side only).
 * The Admin SDK instance is memoized to prevent repeated initializations.
 * 
 * IMPORTANT: Nuxt's runtimeConfig automatically parses JSON strings that begin
 * with '{' into JavaScript objects. This means NUXT_FIREBASE_ADMIN_CREDENTIALS
 * may arrive as either a string OR an already-parsed object depending on the
 * environment. This utility handles both cases.
 */

import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { logger } from './logger';

// Module-level singleton for Firebase Admin app
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let initializationError: Error | null = null;

/**
 * Initialize Firebase Admin SDK
 * Memoized - only initializes once per server instance
 * 
 * @returns Firebase Admin App instance or null if initialization fails
 */
function initializeFirebaseAdmin(): App | null {
  // Return cached app if already initialized
  if (adminApp) {
    return adminApp;
  }
  
  // Return null if previous initialization failed
  if (initializationError) {
    logger.error('[Firebase Admin] Previous initialization failed:', initializationError.message);
    return null;
  }
  
  // Check if already initialized by another process
  const existingApps = getApps();
  if (existingApps.length > 0) {
    const existing = existingApps[0];
    if (!existing) {
      initializationError = new Error('Firebase Admin app list is unexpectedly empty.');
      logger.error('[Firebase Admin] Initialization failed:', initializationError.message);
      return null;
    }
    adminApp = existing;
    adminAuth = getAuth(existing);
    return adminApp;
  }
  
  const config = useRuntimeConfig();
  
  try {
    let serviceAccount: ServiceAccount | undefined;
    
    // Parse credentials from runtimeConfig
    // Note: Nuxt automatically parses JSON strings that start with '{' into objects
    // So config.firebaseAdminCredentials may be either a string OR an already-parsed object
    const credentials = config.firebaseAdminCredentials;
    
    if (credentials) {
      let parsed: Record<string, unknown>;
      
      if (typeof credentials === 'string') {
        // Credentials came as a string (e.g., from CLI override or non-JSON format)
        const trimmed = credentials.trim();
        if (trimmed.startsWith('{')) {
          parsed = JSON.parse(trimmed);
        } else {
          throw new Error('File path credentials not supported. Use JSON object in NUXT_FIREBASE_ADMIN_CREDENTIALS');
        }
      } else if (typeof credentials === 'object' && credentials !== null) {
        // Nuxt already parsed the JSON string into an object
        parsed = credentials as Record<string, unknown>;
      } else {
        throw new Error('Invalid credentials format. Expected JSON string or object.');
      }
      
      // Validate required fields exist
      if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
        throw new Error('Invalid credentials: missing project_id, client_email, or private_key');
      }
      
      serviceAccount = {
        projectId: parsed.project_id as string,
        clientEmail: parsed.client_email as string,
        privateKey: parsed.private_key as string,
      };
    }
    
    if (!serviceAccount) {
      throw new Error('Firebase Admin credentials not configured. Set NUXT_FIREBASE_ADMIN_CREDENTIALS environment variable.');
    }
    
    // Initialize the Admin SDK
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
    
    // Initialize Auth service
    adminAuth = getAuth(adminApp);
    
    logger.log('[Firebase Admin] Initialized successfully');
    
    return adminApp;
    
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    logger.error('[Firebase Admin] Initialization failed:', initializationError.message);
    return null;
  }
}

/**
 * Get Firebase Admin Auth instance
 * Initializes Admin SDK if not already done
 * 
 * @returns Firebase Admin Auth instance
 * @throws Error if Admin SDK is not configured
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initializeFirebaseAdmin();
  }
  
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized. Check server configuration.');
  }
  
  return adminAuth;
}

/**
 * Get Firebase Admin App instance
 * Initializes Admin SDK if not already done
 * 
 * @returns Firebase Admin App instance
 * @throws Error if Admin SDK is not configured
 */
export function getAdminApp(): App {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  
  if (!adminApp) {
    throw new Error('Firebase Admin SDK not initialized. Check server configuration.');
  }
  
  return adminApp;
}

/**
 * Check if Firebase Admin SDK is available
 * Does not throw - useful for conditional logic
 * 
 * @returns boolean indicating if Admin SDK is ready
 */
export function isAdminInitialized(): boolean {
  if (adminApp && adminAuth) {
    return true;
  }
  
  try {
    initializeFirebaseAdmin();
    return adminApp !== null && adminAuth !== null;
  } catch {
    return false;
  }
}

/**
 * Session cookie configuration
 */
export interface SessionCookieOptions {
  /** Session expiry in milliseconds */
  expiresIn: number;
  /** Cookie name */
  name: string;
}

/**
 * Get session cookie configuration from runtime config
 * 
 * @returns Session cookie options
 */
export function getSessionConfig(): SessionCookieOptions {
  const config = useRuntimeConfig();
  const expiryDays = Number(config.firebaseSessionExpiryDays) || 5;
  
  // Convert days to milliseconds
  // Firebase allows 5 minutes to 14 days
  const expiresIn = Math.min(
    Math.max(expiryDays * 24 * 60 * 60 * 1000, 5 * 60 * 1000), // Min 5 minutes
    14 * 24 * 60 * 60 * 1000 // Max 14 days
  );
  
  return {
    expiresIn,
    name: '__session', // Firebase convention for session cookies
  };
}
