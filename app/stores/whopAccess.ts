/**
 * Whop subscription entitlement snapshot (from GET /api/access/me).
 * Reset on sign-out via useAuth.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWhopAccessStore = defineStore('whopAccess', () => {
  const hasAccess = ref<boolean | null>(null);
  const pending = ref<boolean | null>(null);
  const isLoading = ref(false);
  const loadError = ref<string | null>(null);

  function setFromResponse(res: { hasAccess: boolean; pending: boolean }): void {
    hasAccess.value = res.hasAccess;
    pending.value = res.pending;
  }

  function reset(): void {
    hasAccess.value = null;
    pending.value = null;
    loadError.value = null;
  }

  /** Clears cached entitlement so the next ensureLoaded refetches (e.g. after checkout). */
  function invalidate(): void {
    hasAccess.value = null;
    pending.value = null;
  }

  return {
    hasAccess,
    pending,
    isLoading,
    loadError,
    setFromResponse,
    reset,
    invalidate,
  };
});
