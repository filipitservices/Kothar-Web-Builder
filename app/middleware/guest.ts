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
      // User is authenticated - redirect to dashboard or specified redirect URL
      const redirect = to.query.redirect;
      const redirectPath = typeof redirect === 'string' ? redirect : '/dashboard';
      
      return navigateTo(redirectPath);
    }
    
    // User is not authenticated - allow access to guest page
    return;
    
  } catch (error) {
    // On error, allow access (user is likely not authenticated)
    console.warn('[Guest Middleware] Session check failed:', error);
    return;
  }
});
