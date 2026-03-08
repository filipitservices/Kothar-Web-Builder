/**
 * Request State Store
 *
 * Single source of truth for an in-progress website request that spans the
 * request editor page and the builder page. Holds the selected template
 * reference, the layout configuration (desktop + mobile block lists), and a
 * snapshot of the form data so state survives client-side navigation between
 * the two pages.
 *
 * Lifecycle:
 *   1. User selects a showcase template → initializeFromTemplate()
 *   2. Request editor page reads/writes formData via saveFormData/savedFormData
 *   3. User opens builder → builder reads/writes layout via update*Layout()
 *   4. User returns to request editor → formData is restored from savedFormData
 *   5. User submits → consumer reads layout + savedFormData → $reset()
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlockItem } from '~/types/builder';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import type { ShowcaseTemplate } from '~/stores/showcase';
import { deriveLayoutFromTemplate } from '~/utils/templateLayoutMapper';

export interface RequestLayout {
  desktop: BlockItem[];
  mobile: BlockItem[];
}

export const useRequestStateStore = defineStore('requestState', () => {
  // --- State ---
  const templateId = ref<string | null>(null);
  const templateName = ref<string | null>(null);
  const layout = ref<RequestLayout>({ desktop: [], mobile: [] });
  const savedFormData = ref<Partial<TemplateRequestFormData> | null>(null);
  const isInitialized = ref(false);

  // --- Getters ---
  const hasActiveRequest = computed(
    () => isInitialized.value && templateId.value !== null
  );

  // --- Actions ---

  /** Derive an initial layout from a showcase template and prepare the store. */
  function initializeFromTemplate(template: ShowcaseTemplate): void {
    templateId.value = template.id;
    templateName.value = template.name;
    layout.value = deriveLayoutFromTemplate(template);
    savedFormData.value = null;
    isInitialized.value = true;
  }

  /** Replace the desktop block list (immutable update). */
  function updateDesktopLayout(blocks: BlockItem[]): void {
    layout.value = { ...layout.value, desktop: [...blocks] };
  }

  /** Replace the mobile block list (immutable update). */
  function updateMobileLayout(blocks: BlockItem[]): void {
    layout.value = { ...layout.value, mobile: [...blocks] };
  }

  /** Persist form data snapshot so it survives navigation to the builder. */
  function saveFormData(data: Partial<TemplateRequestFormData>): void {
    savedFormData.value = data ? { ...data } : null;
  }

  /** Clear all request state (e.g. after submission or abandonment). */
  function $reset(): void {
    templateId.value = null;
    templateName.value = null;
    layout.value = { desktop: [], mobile: [] };
    savedFormData.value = null;
    isInitialized.value = false;
  }

  return {
    // State
    templateId,
    templateName,
    layout,
    savedFormData,
    isInitialized,

    // Getters
    hasActiveRequest,

    // Actions
    initializeFromTemplate,
    updateDesktopLayout,
    updateMobileLayout,
    saveFormData,
    $reset,
  };
});
