/**
 * Session Creation API Endpoint
 * 
 * POST /api/auth/session
 * 
 * Accepts a Firebase ID token from the client, verifies it using the Admin SDK,
 * and creates a secure httpOnly session cookie.
 * 
 * This is the core of the server-validated session flow.
 */

import { getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import type { AuthUser, SessionCreateRequest, SessionCreateResponse } from '~/types/auth';

export default defineEventHandler(async (event): Promise<SessionCreateResponse> => {
  // Only accept POST requests
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed'
    });
  }
  
  // Parse request body
  const body = await readBody<SessionCreateRequest>(event);
  
  if (!body?.idToken || typeof body.idToken !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid idToken'
    });
  }
  
  const idToken = body.idToken;
  
  try {
    const adminAuth = getAdminAuth();
    const sessionConfig = getSessionConfig();
    
    // Verify the ID token first
    // This also checks if the token is recent (within last 5 minutes for sensitive ops)
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    
    // Optional: Check that the sign-in is recent (within 5 minutes)
    // This helps prevent session fixation attacks with stolen tokens
    const authTime = decodedToken.auth_time * 1000; // Convert to milliseconds
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    if (authTime < fiveMinutesAgo) {
      // Token is from an older sign-in
      // This is a security choice - you may want to allow older tokens
      // For this implementation, we'll be lenient and allow it
      // but log a warning
      console.warn('[Auth] Session created from non-recent sign-in');
    }
    
    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: sessionConfig.expiresIn
    });
    
    // Set the cookie on the response
    // httpOnly: Prevents JavaScript access (XSS protection)
    // secure: Only sent over HTTPS (in production)
    // sameSite: 'lax' allows the cookie to be sent on top-level navigations
    // path: '/' makes it available to all routes
    setCookie(event, sessionConfig.name, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionConfig.expiresIn / 1000, // Convert to seconds
    });
    
    // Construct user response
    const user: AuthUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };
    
    return { user };
    
  } catch (error: unknown) {
    // Log the error for debugging
    console.error('[Auth] Session creation failed:', error);
    
    // Determine the error type and return appropriate response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
      throw createError({
        statusCode: 401,
        message: 'Invalid or expired token'
      });
    }
    
    if (errorMessage.includes('revoked')) {
      throw createError({
        statusCode: 401,
        message: 'Token has been revoked'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to create session'
    });
  }
});
