/**
 * Single registration point for "unsaved edits" on the active page.
 * Router guard + beforeunload + dialog read hasUnsaved via computed (isDirty as ref/getter).
 */

import { defineStore } from 'pinia';
import { ref, shallowRef, computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export interface UnsavedRegistration {
  id: string;
  isDirty: MaybeRefOrGetter<boolean>;
  onDiscard: () => void | Promise<void>;
}

export const useUnsavedChangesStore = defineStore('unsavedChanges', () => {
  const active = shallowRef<UnsavedRegistration | null>(null);
  const modalOpen = ref(false);
  const pendingTo = shallowRef<RouteLocationNormalized | null>(null);
  const allowNext = ref(false);

  const hasUnsaved = computed(() => {
    const reg = active.value;
    if (!reg) return false;
    return toValue(reg.isDirty);
  });

  function register(reg: UnsavedRegistration): void {
    active.value = reg;
  }

  function unregister(id: string): void {
    if (active.value?.id === id) {
      active.value = null;
    }
    if (modalOpen.value) {
      modalOpen.value = false;
      pendingTo.value = null;
    }
  }

  /** Call immediately before programmatic navigateTo when leaving after a successful save (dirty would still be true until unmount). */
  function requestAllowNext(): void {
    allowNext.value = true;
  }

  /**
   * Session intentionally ended (sign-out). Close any open unsaved dialog so the user is
   * not left behind a modal. Navigation is allowed because the router guard bypasses when
   * `auth` reports no user (do not set `allowNext` here — it could remain stale after login).
   */
  function prepareForAuthTerminatedNavigation(): void {
    closeModalStay();
  }

  function consumeAllowNext(): void {
    allowNext.value = false;
  }

  function openIntercept(to: RouteLocationNormalized): void {
    pendingTo.value = to;
    modalOpen.value = true;
  }

  function closeModalStay(): void {
    modalOpen.value = false;
    pendingTo.value = null;
  }

  async function runDiscard(): Promise<void> {
    const reg = active.value;
    if (!reg) return;
    await reg.onDiscard();
  }

  return {
    active,
    modalOpen,
    pendingTo,
    allowNext,
    hasUnsaved,
    register,
    unregister,
    requestAllowNext,
    prepareForAuthTerminatedNavigation,
    consumeAllowNext,
    openIntercept,
    closeModalStay,
    runDiscard,
  };
});
