/**
 * Keeps the orders collection listener attached only while the page is "active".
 *
 * - Tab hidden (another tab selected): detach **immediately** so the long-lived
 *   Firestore Listen/WebChannel is not left idle for the browser to tear down
 *   (reduces net::ERR_CONNECTION_CLOSED noise in DevTools).
 * - Tab visible but window unfocused (e.g. minimized): detach only after a short
 *   delay so brief blur/focus cycles do not constantly unsubscribe/resubscribe.
 *
 * In-memory order list is preserved across route unmount (listener detached only);
 * subscribe() runs again when active. Full clear is sign-out / empty userId.
 */

import { onMounted, onUnmounted, watch, toValue, type MaybeRefOrGetter } from 'vue';
import { useOrdersStore } from '~/stores/orders';

const EVENT_DEBOUNCE_MS = 120;
/** Only used when the tab is still "visible" but the window lost focus. */
const UNFOCUSED_DETACH_MS = 850;

export function useOrdersSnapshotWhenFocused(userId: MaybeRefOrGetter<string>): void {
  const ordersStore = useOrdersStore();
  let eventDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let unfocusedDetachTimer: ReturnType<typeof setTimeout> | null = null;

  function cancelUnfocusedDetachTimer(): void {
    if (unfocusedDetachTimer !== null) {
      clearTimeout(unfocusedDetachTimer);
      unfocusedDetachTimer = null;
    }
  }

  function scheduleUnfocusedDetach(): void {
    cancelUnfocusedDetachTimer();
    unfocusedDetachTimer = setTimeout(() => {
      unfocusedDetachTimer = null;
      ordersStore.detachSnapshotListener();
    }, UNFOCUSED_DETACH_MS);
  }

  function isListenerActiveContext(): boolean {
    if (import.meta.server || typeof document === 'undefined') return false;
    if (document.visibilityState !== 'visible') return false;
    if (typeof document.hasFocus !== 'function') return true;
    return document.hasFocus();
  }

  function sync(): void {
    const uid = (toValue(userId) ?? '').trim();
    if (!uid) {
      cancelUnfocusedDetachTimer();
      ordersStore.unsubscribeFromOrders();
      return;
    }

    if (isListenerActiveContext()) {
      cancelUnfocusedDetachTimer();
      ordersStore.subscribe(uid);
      return;
    }

    if (document.visibilityState === 'hidden') {
      cancelUnfocusedDetachTimer();
      ordersStore.detachSnapshotListener();
      return;
    }

    // Tab still marked visible but window has no focus — wait before detaching.
    scheduleUnfocusedDetach();
  }

  function scheduleSyncFromEvent(): void {
    if (import.meta.server) return;
    if (eventDebounceTimer !== null) {
      clearTimeout(eventDebounceTimer);
    }
    eventDebounceTimer = setTimeout(() => {
      eventDebounceTimer = null;
      sync();
    }, EVENT_DEBOUNCE_MS);
  }

  onMounted(() => {
    if (import.meta.server) return;
    sync();
    document.addEventListener('visibilitychange', scheduleSyncFromEvent);
    window.addEventListener('blur', scheduleSyncFromEvent);
    window.addEventListener('focus', scheduleSyncFromEvent);
  });

  onUnmounted(() => {
    if (import.meta.server) return;
    document.removeEventListener('visibilitychange', scheduleSyncFromEvent);
    window.removeEventListener('blur', scheduleSyncFromEvent);
    window.removeEventListener('focus', scheduleSyncFromEvent);
    if (eventDebounceTimer !== null) {
      clearTimeout(eventDebounceTimer);
      eventDebounceTimer = null;
    }
    cancelUnfocusedDetachTimer();
    // Keep cached orders for the next route; full clear only on sign-out (see useAuth).
    ordersStore.detachSnapshotListener();
  });

  watch(
    () => (toValue(userId) ?? '').trim(),
    () => {
      sync();
    }
  );
}
