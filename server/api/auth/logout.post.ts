/**
 * Logout API Endpoint
 * 
 * POST /api/auth/logout
 * 
 * Clears the session cookie and optionally revokes all refresh tokens
 * for the user (forcing them to re-authenticate on all devices).
 */

import { getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';
import type { LogoutResponse } from '~/types/auth';

export default defineEventHandler(async (event): Promise<LogoutResponse> => {
  // Only accept POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    });
  }
  
  const sessionConfig = getSessionConfig();
  const sessionCookie = getCookie(event, sessionConfig.name);
  
  // Clear the session cookie regardless of whether we can verify it
  deleteCookie(event, sessionConfig.name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  // If there's a session cookie, try to revoke the refresh tokens
  // This is optional but adds security by invalidating all sessions
  if (sessionCookie) {
    try {
      const adminAuth = getAdminAuth();
      
      // Verify the session cookie to get the user ID
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      
      // Revoke all refresh tokens for this user
      // This forces re-authentication on all devices
      await adminAuth.revokeRefreshTokens(decodedClaims.uid);
      
      logger.log('[Auth] Session revoked for user:', decodedClaims.uid);
      
    } catch (error) {
      logger.warn('[Auth] Could not revoke session:', error);
    }
  }
  
  return { success: true };
});
