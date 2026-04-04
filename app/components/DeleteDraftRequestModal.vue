<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click.self="emitClose"
    >
      <div
        class="modal-container delete-draft-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-draft-request-title"
      >
        <div class="modal-header">
          <h2 id="delete-draft-request-title" class="text-title">Delete this draft?</h2>
          <button
            type="button"
            class="modal-close"
            title="Close"
            aria-label="Close"
            :disabled="deleting"
            @click="emitClose"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body delete-draft-request-modal__body">
          <p class="text-muted">
            This removes your saved progress for
            <strong class="delete-draft-request-modal__name">{{ templateName }}</strong>.
            Your daily request creation limit is unchanged. This cannot be undone.
          </p>
        </div>
        <div class="modal-footer delete-draft-request-modal__footer">
          <button
            type="button"
            class="btn btn--secondary"
            :disabled="deleting"
            @click="emitClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn--danger"
            :disabled="deleting"
            @click="emit('confirm')"
          >
            {{ deleting ? 'Deleting…' : 'Delete draft' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'DeleteDraftRequestModal' });

const props = withDefaults(
  defineProps<{
    open: boolean;
    templateName: string;
    deleting?: boolean;
  }>(),
  { deleting: false }
);

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

function emitClose(): void {
  if (props.deleting) return;
  emit('close');
}
</script>

<style scoped>
.delete-draft-request-modal {
  max-width: 28rem;
}

.delete-draft-request-modal__body {
  padding: var(--space-lg);
}

.delete-draft-request-modal__name {
  color: var(--color-text);
  font-weight: 600;
}

.delete-draft-request-modal__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
