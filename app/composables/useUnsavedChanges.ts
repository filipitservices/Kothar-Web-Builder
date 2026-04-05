/**
 * Registers the active page with the global unsaved-changes guard.
 *
 * Not used on `/sites/[id]`: hero/announcement update the store immediately while business
 * hours use a separate “Save hours” action — a single dirty flag would be misleading until
 * persistence semantics are unified.
 */
import { onMounted, onUnmounted, useId, type MaybeRefOrGetter } from 'vue';
import { useUnsavedChangesStore } from '~/stores/unsavedChanges';

export interface UseUnsavedChangesOptions {
  isDirty: MaybeRefOrGetter<boolean>;
  onDiscard: () => void | Promise<void>;
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
      onDiscard: options.onDiscard,
    });
  });

  onUnmounted(() => {
    store.unregister(id);
  });
}
