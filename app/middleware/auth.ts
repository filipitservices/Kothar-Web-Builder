/**
 * Authentication Route Middleware
 * 
 * Protects routes that require authentication.
 * Works on both server-side (SSR) and client-side navigation.
 * 
 * On SSR: Uses useRequestFetch to forward cookies to the auth endpoint
 * On client: Uses $fetch which automatically includes cookies
 * 
 * This middleware blocks rendering of protected pages until auth is verified.
 * If the user is not authenticated, they are redirected to login with a
 * redirect query parameter to return after authentication.
 * 
 * Usage:
 * Add to a page with definePageMeta:
 * ```ts
 * definePageMeta({
 *   middleware: 'auth'
 * })
 * ```
 */

import type { MeResponse } from '~/types/auth';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // Check authentication status via server API
  // useRequestFetch forwards cookies during SSR, $fetch handles client-side
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
    
    if (!response.user) {
      // Not authenticated - redirect to login
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
    
    // User is authenticated - allow navigation
    return;
    
  } catch (error) {
    console.warn('[Auth Middleware] Session check failed:', error);
    
    // On error, redirect to login for safety
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
});
