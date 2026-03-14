/**
 * Toast Composable
 *
 * Thin wrapper around the toast store for showing transient notifications.
 */

import { useToastStore } from '~/stores/toast';
import type { ToastType } from '~/stores/toast';

export function useToast() {
  const store = useToastStore();
  return {
    show: (message: string, type?: ToastType) => store.show(message, type ?? 'info'),
    showError: (message: string) => store.show(message, 'error'),
    showSuccess: (message: string) => store.show(message, 'success'),
    dismiss: store.dismiss,
    dismissAll: store.dismissAll,
  };
}
