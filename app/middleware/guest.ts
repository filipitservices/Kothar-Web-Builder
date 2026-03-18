/**
 * Guest Route Middleware
 * 
 * Protects routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users away from login/signup pages.
 * 
 * Works on both server-side (SSR) and client-side navigation.
 * 
 * Usage:
 * Add to a page with definePageMeta:
 * ```ts
 * definePageMeta({
 *   middleware: 'guest'
 * })
 * ```
 */

import type { MeResponse } from '~/types/auth';
import { logger } from '~/utils/logger';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // Check authentication status via server API
  try {
    let response: MeResponse;
    
    if (import.meta.server) {
      // On server, use useRequestFetch to forward the session cookie
      const requestFetch = useRequestFetch();
      response = await requestFetch<MeResponse>('/api/auth/me');
    } else {
      // On client, $fetch automatically includes cookies
      response = await $fetch<MeResponse>('/api/auth/me');
    }
    
    if (response.user) {
      // User is authenticated - redirect to specified URL or landing destination
      const redirect = to.query.redirect;
      if (typeof redirect === 'string') {
        return navigateTo(redirect);
      }
      try {
        let destResponse: { destination?: string; error?: string };
        if (import.meta.server) {
          const requestFetch = useRequestFetch();
          destResponse = await requestFetch<{ destination?: string; error?: string }>(
            '/api/user/landing-destination'
          );
        } else {
          destResponse = await $fetch<{ destination?: string; error?: string }>(
            '/api/user/landing-destination'
          );
        }
        if (destResponse?.destination) {
          return navigateTo(destResponse.destination);
        }
      } catch {
        // Fallback on error
      }
      return navigateTo('/gallery');
    }
    
    // User is not authenticated - allow access to guest page
    return;
    
  } catch (error) {
    // On error, allow access (user is likely not authenticated)
    logger.warn('[Guest Middleware] Session check failed:', error);
    return;
  }
});
