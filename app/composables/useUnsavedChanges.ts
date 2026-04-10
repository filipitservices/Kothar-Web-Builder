/**
 * Registers the active page with the global unsaved-changes guard.
 *
 * Not used on `/sites/[id]`: hero/announcement update the store immediately while business
 * hours use a separate “Save hours” action — a single dirty flag would be misleading until
 * persistence semantics are unified.
 *
 * Auth termination (sign-out) bypasses the prompt via `prepareForAuthTerminatedNavigation()`
 * in `useAuth` and via the unsaved guard’s unauthenticated check (see plugin).
 */
import { onMounted, onUnmounted, useId, type MaybeRefOrGetter } from 'vue';
import { useUnsavedChangesStore } from '~/stores/unsavedChanges';

export interface UseUnsavedChangesOptions {
  isDirty: MaybeRefOrGetter<boolean>;
  hasUnsavedSession: MaybeRefOrGetter<boolean>;
  onDiscard: () => void | Promise<void>;
  onStashLeave?: () => void | Promise<void>;
  stashAllowed?: MaybeRefOrGetter<boolean>;
}

/**
 * Registers the current page with the global unsaved-changes guard (router + beforeunload + dialog).
 * Unregisters on unmount.
 */
export function useUnsavedChanges(options: UseUnsavedChangesOptions): void {
  const store = useUnsavedChangesStore();
  const id = useId();

  onMounted(() => {
    store.register({
      id,
      isDirty: options.isDirty,
      hasUnsavedSession: options.hasUnsavedSession,
      onDiscard: options.onDiscard,
      onStashLeave: options.onStashLeave,
      stashAllowed: options.stashAllowed,
    });
  });

  onUnmounted(() => {
    store.unregister(id);
  });
}
