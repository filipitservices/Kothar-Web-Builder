/**
 * Authentication Route Middleware
 * 
 * Protects routes that require authentication.
 * Works on both server-side (SSR) and client-side navigation.
 * 
 * On SSR: Uses useRequestFetch to forward cookies to the auth endpoint
 * On client: Uses $fetch which automatically includes cookies
 * 
 * Populates the auth store with the current user when the session is valid so that
 * pages that use the store (e.g. builder with layout: 'builder' and no useAuth() in tree)
 * have uid available without depending on a component that calls useAuth() to mount first.
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
import { logger } from '~/utils/logger';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const authStore = useAuthStore();

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
      // Align client store with server before redirect so unsaved-changes router guard
      // does not block the login redirect while the UI still thinks the user is signed in.
      authStore.clearUser();
      return navigateTo({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    // Populate auth store so pages (e.g. builder without navbar) have uid without mounting useAuth()
    authStore.setUser(response.user);

    // User is authenticated - allow navigation
    return;
    
  } catch (error) {
    logger.warn('[Auth Middleware] Session check failed:', error);

    authStore.clearUser();
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
});
