/**
 * Intercepts in-app navigation when the active page reports unsaved edits, and
 * sets beforeunload when leaving the tab/refresh. Single source: useUnsavedChangesStore.hasUnsaved.
 *
 * Modern browsers ignore custom beforeunload text; we only set returnValue per MDN.
 */

import { useUnsavedChangesStore } from '~/stores/unsavedChanges';

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const unsaved = useUnsavedChangesStore();

  router.beforeEach((to) => {
    if (!unsaved.hasUnsaved) {
      return true;
    }
    if (unsaved.allowNext) {
      unsaved.consumeAllowNext();
      return true;
    }
    unsaved.openIntercept(to);
    return false;
  });

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!unsaved.hasUnsaved) return;
    e.preventDefault();
    e.returnValue = '';
  };

  window.addEventListener('beforeunload', onBeforeUnload);
});
