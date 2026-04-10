<template>
  <Teleport to="body">
    <div
      v-if="store.open && store.content"
      class="modal-overlay modal-overlay--elevated"
      role="presentation"
      @click.self="onDismiss"
    >
      <div
        ref="dialogRef"
        class="modal-container request-flow-error-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="request-flow-error-title"
        aria-describedby="request-flow-error-desc"
        tabindex="-1"
        @keydown.escape.prevent="onDismiss"
      >
        <div class="modal-header request-flow-error-modal__header">
          <div class="request-flow-error-modal__title-wrap">
            <h2 id="request-flow-error-title" class="text-title">
              {{ store.content.title }}
            </h2>
          </div>
          <button
            type="button"
            class="modal-close"
            title="Close"
            aria-label="Close"
            @click="onDismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body request-flow-error-modal__body">
          <p id="request-flow-error-desc" class="text-body request-flow-error-modal__lead">
            {{ store.content.description }}
          </p>
          <p class="text-muted request-flow-error-modal__next">
            <strong class="request-flow-error-modal__next-label">What to do next:</strong>
            {{ store.content.nextStep }}
          </p>
          <details
            v-if="store.content.debugDetail"
            class="request-flow-error-modal__details"
          >
            <summary class="request-flow-error-modal__summary">Technical details</summary>
            <pre class="request-flow-error-modal__pre">{{ store.content.debugDetail }}</pre>
          </details>
        </div>
        <div class="modal-footer request-flow-error-modal__footer">
          <button type="button" class="btn btn--primary" @click="onDismiss">OK</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useRequestFlowErrorDialogStore } from '~/stores/requestFlowErrorDialog';

defineOptions({ name: 'RequestFlowErrorModal' });

const store = useRequestFlowErrorDialogStore();
const dialogRef = ref<HTMLElement | null>(null);

function onDismiss(): void {
  store.dismiss();
}

watch(
  () => store.open,
  async (isOpen) => {
    if (isOpen && store.content) {
      await nextTick();
      dialogRef.value?.focus();
    }
  }
);
</script>

<style scoped>
.request-flow-error-modal {
  max-width: 32rem;
  border: 1px solid var(--color-border);
}

.request-flow-error-modal__header {
  border-left: 4px solid var(--color-error);
  background: var(--color-error-tint);
}

.request-flow-error-modal__title-wrap {
  flex: 1;
  min-width: 0;
  padding-right: var(--space-sm);
}

.request-flow-error-modal__body {
  padding: var(--space-lg);
}

.request-flow-error-modal__lead {
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.request-flow-error-modal__next {
  margin-bottom: 0;
  line-height: 1.55;
}

.request-flow-error-modal__next-label {
  font-weight: 600;
  color: var(--color-text-muted-dark);
}

.request-flow-error-modal__details {
  margin-top: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-muted);
}

.request-flow-error-modal__summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-muted-dark);
  user-select: none;
}

.request-flow-error-modal__pre {
  margin: var(--space-sm) 0 0;
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
}

.request-flow-error-modal__footer {
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.text-body {
  font-size: 1rem;
  line-height: 1.6;
}
</style>
