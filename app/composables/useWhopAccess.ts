/**
 * Client access to Whop entitlement: single fetch path, shared store.
 * Prefetch uses ensureLoaded() (cached after first load). Submission must call
 * fetchAccessFromServer() so access is never read from a stale cached false after payment.
 */

import { computed } from 'vue';
import { useWhopAccessStore } from '~/stores/whopAccess';
import { useAuthStore } from '~/stores/auth';
import type { AccessMeResponse, CheckoutSessionResponse } from '~/types/access';

export function useWhopAccess() {
  const store = useWhopAccessStore();
  const authStore = useAuthStore();

  const isReady = computed(() => store.hasAccess !== null);

  /**
   * Always hits GET /api/access/me and updates the store. Use before submit.
   * Returns the same payload written to the store so gates can use it directly (no Pinia timing).
   */
  async function fetchAccessFromServer(): Promise<AccessMeResponse | null> {
    if (!authStore.isAuthenticated) {
      return null;
    }
    store.isLoading = true;
    store.loadError = null;
    try {
      const res = await $fetch<AccessMeResponse>('/api/access/me', {
        query: { _: String(Date.now()) },
        cache: 'no-store',
      });
      store.setFromResponse(res);
      return res;
    } catch {
      store.loadError = 'Could not verify access.';
      const fallback: AccessMeResponse = { hasAccess: false, pending: true };
      store.setFromResponse(fallback);
      return fallback;
    } finally {
      store.isLoading = false;
    }
  }

  /** First-load prefetch only; skips refetch if we already have a snapshot (avoids spam). */
  async function ensureLoaded(): Promise<void> {
    if (!authStore.isAuthenticated) return;
    if (store.hasAccess !== null) return;
    await fetchAccessFromServer();
  }

  async function refresh(): Promise<void> {
    store.invalidate();
    await fetchAccessFromServer();
  }

  /**
   * Opens Whop checkout in a new tab with firebase_uid in session metadata.
   */
  async function openCheckout(returnPath?: string): Promise<void> {
    const body: { returnUrl?: string } = {};
    if (returnPath && typeof window !== 'undefined') {
      body.returnUrl = `${window.location.origin}${returnPath}`;
    }
    const res = await $fetch<CheckoutSessionResponse>('/api/billing/checkout-session', {
      method: 'POST',
      body,
    });
    if (typeof window !== 'undefined') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    }
  }

  return {
    hasAccess: computed(() => store.hasAccess),
    pending: computed(() => store.pending),
    isLoading: computed(() => store.isLoading),
    loadError: computed(() => store.loadError),
    isReady,
    ensureLoaded,
    fetchAccessFromServer,
    refresh,
    openCheckout,
  };
}
