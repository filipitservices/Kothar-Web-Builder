/**
 * Landing Page Middleware
 *
 * For authenticated users visiting `/`, redirects to the appropriate
 * post-login destination (/sites or /gallery) based on account state.
 *
 * First checks auth via /api/auth/me; only calls landing-destination when
 * authenticated. Falls back to /gallery if the API fails.
 *
 * Runs only on `/`; other routes are unaffected.
 */

import type { MeResponse } from '~/types/auth';

type LandingDestinationResponse = { destination: '/sites' | '/gallery' };

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/') return;

  try {
    let meResponse: MeResponse;
    if (import.meta.server) {
      const requestFetch = useRequestFetch();
      meResponse = await requestFetch<MeResponse>('/api/auth/me');
    } else {
      meResponse = await $fetch<MeResponse>('/api/auth/me');
    }
    if (!meResponse.user) return;

    let destResponse: LandingDestinationResponse | { error: string };
    if (import.meta.server) {
      const requestFetch = useRequestFetch();
      destResponse = await requestFetch<LandingDestinationResponse | { error: string }>(
        '/api/user/landing-destination'
      );
    } else {
      destResponse = await $fetch<LandingDestinationResponse | { error: string }>(
        '/api/user/landing-destination'
      );
    }

    if ('destination' in destResponse) {
      return navigateTo(destResponse.destination);
    }
  } catch {
    // On error, allow landing page to render
  }

  return;
});
