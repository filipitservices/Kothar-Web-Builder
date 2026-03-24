/**
 * Client access to Whop entitlement: single fetch path, shared store.
 * Submit-time checks call ensureLoaded() then read hasAccess.
 */

import { computed } from 'vue';
import { useWhopAccessStore } from '~/stores/whopAccess';
import { useAuthStore } from '~/stores/auth';
import type { AccessMeResponse } from '~/types/access';
import type { CheckoutSessionResponse } from '~/types/access';

export function useWhopAccess() {
  const store = useWhopAccessStore();
  const authStore = useAuthStore();

  const isReady = computed(() => store.hasAccess !== null);

  async function ensureLoaded(): Promise<void> {
    if (!authStore.isAuthenticated) return;
    if (store.hasAccess !== null) return;
    store.isLoading = true;
    store.loadError = null;
    try {
      const res = await $fetch<AccessMeResponse>('/api/access/me');
      store.setFromResponse(res);
    } catch {
      store.loadError = 'Could not verify access.';
      store.setFromResponse({ hasAccess: false, pending: true });
    } finally {
      store.isLoading = false;
    }
  }

  async function refresh(): Promise<void> {
    store.invalidate();
    await ensureLoaded();
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
    refresh,
    openCheckout,
  };
}
