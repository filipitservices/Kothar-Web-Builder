<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click.self="onCancel"
    >
      <div
        class="modal-container builder-leave-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
        tabindex="-1"
        ref="dialogRef"
        @keydown.escape.prevent="onCancel"
      >
        <div class="modal-header">
          <h2 :id="titleId" class="text-title">Save layout changes?</h2>
          <button
            type="button"
            class="modal-close"
            title="Stay in editor"
            aria-label="Stay in editor"
            @click="onCancel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body builder-leave-dialog__body">
          <p :id="descId" class="text-muted">
            You have unsaved changes to this page layout or annotations. Choose whether to save them
            before leaving, or leave without saving.
          </p>
        </div>
        <div class="modal-footer builder-leave-dialog__footer">
          <button type="button" class="btn btn--secondary" :disabled="saving" @click="onCancel">
            Cancel
          </button>
          <button type="button" class="btn btn--danger" :disabled="saving" @click="onDiscard">
            Discard
          </button>
          <button type="button" class="btn btn--primary" :disabled="saving" @click="onSave">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, useId, computed } from 'vue';

defineOptions({ name: 'BuilderLeaveDialog' });

const props = defineProps<{
  open: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  discard: [];
  save: [];
}>();

const titleId = useId();
const descId = useId();
const dialogRef = ref<HTMLElement | null>(null);
const saving = computed(() => props.saving ?? false);
function onCancel(): void {
  if (saving.value) return;
  emit('cancel');
}

function onDiscard(): void {
  if (saving.value) return;
  emit('discard');
}

function onSave(): void {
  if (saving.value) return;
  emit('save');
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      dialogRef.value?.focus();
    }
  }
);
</script>

<style scoped>
.builder-leave-dialog {
  max-width: 28rem;
}

.builder-leave-dialog__body {
  padding: var(--space-lg);
}

.builder-leave-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
