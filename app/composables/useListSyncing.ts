/**
 * useListSyncing
 * Handles synchronization and constraint enforcement between desktop/mobile element lists
 */

import { watch } from 'vue';
import type { Ref } from 'vue';
import { useElementConstraints } from './useElementConstraints';
import type { ConstraintElement } from '~/config/elementConstraintUtils';

interface ListSyncOptions<T extends ConstraintElement = ConstraintElement> {
  desktopList: Ref<T[]>;
  mobileList: Ref<T[]>;
  syncEnabled: Ref<boolean>;
  onDesktopListUpdate: (list: T[]) => void;
  onMobileListUpdate: (list: T[]) => void;
}

export function useListSyncing<T extends ConstraintElement>(options: ListSyncOptions<T>): void {
  const { removeDuplicates, enforceElementPositions } = useElementConstraints();

  const applyConstraints = (list: T[]): T[] => {
    const unique = removeDuplicates(list as ConstraintElement[]) as T[];
    return enforceElementPositions(unique as ConstraintElement[]) as T[];
  };

  // Watch desktop list for changes
  watch(
    () => options.desktopList.value,
    (newVal) => {
      const positioned = applyConstraints(newVal);

      // Update desktop list if constraints changed it
      if (JSON.stringify(positioned) !== JSON.stringify(newVal)) {
        options.onDesktopListUpdate(positioned);
      }

      // Sync to mobile if enabled
      if (options.syncEnabled.value) {
        const mobilePositioned = applyConstraints(positioned);
        if (JSON.stringify(mobilePositioned) !== JSON.stringify(options.mobileList.value)) {
          options.onMobileListUpdate(mobilePositioned);
        }
      }
    },
    { deep: true }
  );

  // Watch mobile list for changes
  watch(
    () => options.mobileList.value,
    (newVal) => {
      const positioned = applyConstraints(newVal);

      // Update mobile list if constraints changed it
      if (JSON.stringify(positioned) !== JSON.stringify(newVal)) {
        options.onMobileListUpdate(positioned);
      }

      // Sync to desktop if enabled
      if (options.syncEnabled.value) {
        const desktopPositioned = applyConstraints(positioned);
        if (JSON.stringify(desktopPositioned) !== JSON.stringify(options.desktopList.value)) {
          options.onDesktopListUpdate(desktopPositioned);
        }
      }
    },
    { deep: true }
  );

  // Handle sync toggle - mirror desktop to mobile when sync is enabled
  watch(options.syncEnabled, (enabled) => {
    if (enabled) {
      const positioned = applyConstraints(options.desktopList.value);
      if (JSON.stringify(positioned) !== JSON.stringify(options.mobileList.value)) {
        options.onMobileListUpdate(positioned);
      }
    }
  });
}
