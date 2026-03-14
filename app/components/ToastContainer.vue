<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
        >
          <span class="toast__icon" aria-hidden="true">
            <svg v-if="toast.type === 'error'" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="toast.type === 'success'" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </span>
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast__close"
            :aria-label="`Dismiss notification`"
            @click="toastStore.dismiss(toast.id)"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '~/stores/toast';

defineOptions({ name: 'ToastContainer' });

const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: min(420px, calc(100vw - var(--space-xl) * 2));
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  font-size: 0.9375rem;
  font-weight: 500;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: toast-in 0.3s ease-out;
}

.toast--error {
  background: var(--color-error-tint);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.toast--success {
  background: var(--color-success-tint);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.toast--info {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.toast__icon {
  flex-shrink: 0;
}

.toast__message {
  flex: 1;
  line-height: 1.4;
}

.toast__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs);
  background: none;
  border: none;
  color: inherit;
  opacity: 0.7;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: opacity 0.15s ease;
}

.toast__close:hover {
  opacity: 1;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}

</style>
