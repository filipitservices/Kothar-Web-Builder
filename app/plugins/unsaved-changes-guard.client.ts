/**
 * Intercepts in-app navigation when the active page reports unsaved edits, and
 * sets beforeunload when leaving the tab/refresh. Single source: useUnsavedChangesStore.hasUnsaved.
 *
 * Does not block navigation when there is no authenticated user: sign-out clears the session
 * before the post-logout navigateTo runs, but editable pages may still register as dirty until
 * unmount — without this bypass, users would see the modal and remain trapped on the page.
 *
 * Modern browsers ignore custom beforeunload text; we only set returnValue per MDN.
 */

import { useUnsavedChangesStore } from '~/stores/unsavedChanges';
import { useAuthStore } from '~/stores/auth';
import { getEditingFlowScope, isLeavingEditingFlow } from '~/utils/editingFlowScope';

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const unsaved = useUnsavedChangesStore();
  const authStore = useAuthStore();

  router.beforeEach((to, from) => {
    if (!authStore.isAuthenticated) {
      unsaved.closeModalStay();
      unsaved.consumeAllowNext();
      return true;
    }
    if (!unsaved.active) {
      return true;
    }
    if (unsaved.allowNext) {
      unsaved.consumeAllowNext();
      return true;
    }

    const fromScope = getEditingFlowScope(from);
    const shouldPrompt =
      fromScope.kind === 'editing'
        ? isLeavingEditingFlow(from, to) && unsaved.shouldPromptOnLeaveFlow
        : unsaved.hasDirtyEdits;
    if (!shouldPrompt) {
      return true;
    }
    unsaved.openIntercept(to);
    return false;
  });

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!unsaved.shouldPromptOnLeaveFlow) return;
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', onBeforeUnload);
});
