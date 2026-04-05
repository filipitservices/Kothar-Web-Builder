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

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const unsaved = useUnsavedChangesStore();
  const authStore = useAuthStore();

  router.beforeEach((to) => {
    if (!authStore.isAuthenticated) {
      unsaved.closeModalStay();
      unsaved.consumeAllowNext();
      return true;
    }
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
