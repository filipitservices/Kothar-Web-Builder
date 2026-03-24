<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click.self="emitClose"
    >
      <div
        class="modal-container submission-access-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-access-title"
      >
        <div class="modal-header">
          <h2 id="submission-access-title" class="text-title">Submit your request</h2>
          <button
            type="button"
            class="modal-close"
            title="Close"
            aria-label="Close"
            :disabled="checkoutLoading"
            @click="emitClose"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body submission-access-modal__body">
          <p class="text-muted">
            A membership is required to send your request to our team. You can keep editing your
            layout and details until you are ready. When you have access, submit again from this page.
          </p>
        </div>
        <div class="modal-footer submission-access-modal__footer">
          <button
            type="button"
            class="btn btn--secondary"
            :disabled="checkoutLoading"
            @click="emitClose"
          >
            Not now
          </button>
          <button
            type="button"
            class="btn btn--primary"
            :disabled="checkoutLoading"
            @click="emit('continue')"
          >
            <span v-if="checkoutLoading">Opening…</span>
            <span v-else>Continue to membership</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'SubmissionAccessModal' });

const props = defineProps<{
  open: boolean;
  checkoutLoading?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  continue: [];
}>();

function emitClose(): void {
  if (props.checkoutLoading) return;
  emit('close');
}
</script>

<style scoped>
.submission-access-modal {
  max-width: 28rem;
}

.submission-access-modal__body {
  padding: var(--space-lg);
}

.submission-access-modal__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
