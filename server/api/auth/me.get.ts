/**
 * Get Current User API Endpoint
 * 
 * GET /api/auth/me
 * 
 * Returns the current authenticated user from the session cookie.
 * Used by the client to check authentication status and get user data.
 * Also used by SSR to determine auth state during server-side rendering.
 */

import { getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';
import type { AuthUser, MeResponse, SessionClaims } from '~/types/auth';

export default defineEventHandler(async (event): Promise<MeResponse> => {
  const sessionConfig = getSessionConfig();
  const sessionCookie = getCookie(event, sessionConfig.name);
  
  // No session cookie - user is not authenticated
  if (!sessionCookie) {
    return { user: null };
  }
  
  try {
    const adminAuth = getAdminAuth();
    
    // Verify the session cookie
    // The second parameter (true) checks if the session has been revoked
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Session is valid - return user data
    const user: AuthUser = {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      displayName: decodedClaims.name || null,
      photoURL: decodedClaims.picture || null,
      emailVerified: decodedClaims.email_verified || false,
    };
    
    event.context.auth = {
      user,
      claims: decodedClaims as SessionClaims,
    };
    
    return { user };
    
  } catch (error: unknown) {
    // Log the error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('[Auth] Session verification failed:', errorMessage);
    
    // If the session is invalid or revoked, clear the cookie
    if (errorMessage.includes('revoked') || 
        errorMessage.includes('expired') || 
        errorMessage.includes('invalid')) {
      deleteCookie(event, sessionConfig.name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    
    // Return null user - not authenticated
    return { user: null };
  }
});
