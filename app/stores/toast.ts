/**
 * Toast Store
 *
 * Manages transient notification toasts. Single source of truth for toast state.
 * Used for feedback like daily limit errors, save confirmations, etc.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

const TOAST_DURATION_MS = 6000;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function show(message: string, type: ToastType = 'info'): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, message, type, createdAt: Date.now() };
    toasts.value = [...toasts.value, toast];

    const timer = setTimeout(() => {
      dismiss(id);
      timers.delete(id);
    }, TOAST_DURATION_MS);
    timers.set(id, timer);
  }

  function dismiss(id: string): void {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function dismissAll(): void {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    toasts.value = [];
  }

  return { toasts, show, dismiss, dismissAll };
});
