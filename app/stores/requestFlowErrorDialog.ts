/**
 * Global blocking error dialog for request/order flows (create, submit, update, layout save, finalize).
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  RequestFlowErrorContent,
  RequestFlowErrorFlowContext,
} from '~/types/requestFlowError';
import { normalizeRequestFlowError } from '~/utils/normalizeRequestFlowError';
import { logger } from '~/utils/logger';

export const useRequestFlowErrorDialogStore = defineStore('requestFlowErrorDialog', () => {
  const open = ref(false);
  const content = ref<RequestFlowErrorContent | null>(null);

  function presentError(err: unknown, flowContext: RequestFlowErrorFlowContext): void {
    const normalized = normalizeRequestFlowError(err, flowContext);
    logger.error('[requestFlowError]', flowContext, err);
    content.value = normalized;
    open.value = true;
  }

  function dismiss(): void {
    open.value = false;
    content.value = null;
  }

  return {
    open,
    content,
    presentError,
    dismiss,
  };
});
