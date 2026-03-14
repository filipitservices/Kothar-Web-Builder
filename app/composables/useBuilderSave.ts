/**
 * useBuilderSave
 *
 * Encapsulates the builder layout save flow: reads layout from the request layout
 * store, persists via the provided save function, and exposes reactive save state
 * and label for the UI. Keeps BuilderEditor focused on layout and wiring.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { OrderLayout } from '~/types/order';
import type { useRequestLayoutStore } from '~/stores/requestLayout';
import type { useAuthStore } from '~/stores/auth';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SAVED_RESET_MS = 2500;
const ERROR_RESET_MS = 3000;

export interface UseBuilderSaveOptions {
  requestLayoutStore: ReturnType<typeof useRequestLayoutStore>;
  authStore: ReturnType<typeof useAuthStore>;
  saveLayout: (userId: string, orderId: string, layout: OrderLayout) => Promise<void>;
}

export interface UseBuilderSaveReturn {
  isSaving: Ref<boolean>;
  saveStatus: Ref<SaveStatus>;
  saveLabel: ComputedRef<string>;
  handleSaveLayout: () => Promise<void>;
}

export function useBuilderSave(options: UseBuilderSaveOptions): UseBuilderSaveReturn {
  const { requestLayoutStore, authStore, saveLayout } = options;
  const isSaving = ref(false);
  const saveStatus = ref<SaveStatus>('idle');
  let saveStatusTimer: ReturnType<typeof setTimeout> | null = null;

  const saveLabel = computed(() => {
    if (isSaving.value) return 'Saving...';
    if (saveStatus.value === 'saved') return 'Saved';
    if (saveStatus.value === 'error') return 'Save failed';
    return 'Save';
  });

  async function handleSaveLayout(): Promise<void> {
    const uid = authStore.uid ?? authStore.currentUser?.uid;
    const orderId = requestLayoutStore.sourceOrderId;
    if (!uid || !orderId || isSaving.value) return;

    isSaving.value = true;
    saveStatus.value = 'saving';
    if (saveStatusTimer) clearTimeout(saveStatusTimer);

    try {
      const layout = requestLayoutStore.getLayoutForSubmission();
      await saveLayout(uid, orderId, layout);
      saveStatus.value = 'saved';
      saveStatusTimer = setTimeout(() => {
        saveStatus.value = 'idle';
      }, SAVED_RESET_MS);
    } catch {
      saveStatus.value = 'error';
      saveStatusTimer = setTimeout(() => {
        saveStatus.value = 'idle';
      }, ERROR_RESET_MS);
    } finally {
      isSaving.value = false;
    }
  }

  return {
    isSaving,
    saveStatus,
    saveLabel,
    handleSaveLayout,
  };
}
