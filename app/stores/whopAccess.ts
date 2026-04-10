/**
 * Whop subscription entitlement snapshot (from GET /api/access/me).
 * Reset on sign-out via useAuth.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWhopAccessStore = defineStore('whopAccess', () => {
  const hasAccess = ref<boolean | null>(null);
  const pending = ref<boolean | null>(null);
  /** True when Whop membership is active and in good standing (see GET /api/access/me). */
  const paidMembershipActive = ref<boolean | null>(null);
  const isLoading = ref(false);
  const loadError = ref<string | null>(null);

  function setFromResponse(res: {
    hasAccess: boolean;
    pending: boolean;
    paidMembershipActive: boolean;
  }): void {
    hasAccess.value = res.hasAccess;
    pending.value = res.pending;
    paidMembershipActive.value = res.paidMembershipActive;
  }

  function reset(): void {
    hasAccess.value = null;
    pending.value = null;
    paidMembershipActive.value = null;
    loadError.value = null;
  }

  /** Clears cached entitlement so the next ensureLoaded refetches (e.g. after checkout). */
  function invalidate(): void {
    hasAccess.value = null;
    pending.value = null;
    paidMembershipActive.value = null;
  }

  return {
    hasAccess,
    pending,
    paidMembershipActive,
    isLoading,
    loadError,
    setFromResponse,
    reset,
    invalidate,
  };
});
