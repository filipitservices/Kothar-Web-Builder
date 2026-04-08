<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      role="presentation"
      @click.self="onKeepSaved"
    >
      <div
        class="modal-container builder-stash-restore-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-stash-restore-title"
        aria-describedby="builder-stash-restore-desc"
        tabindex="-1"
        ref="dialogRef"
        @keydown.escape.prevent="onKeepSaved"
      >
        <div class="modal-header">
          <h2 id="builder-stash-restore-title" class="text-title">Resume stashed layout?</h2>
          <button
            type="button"
            class="modal-close"
            title="Keep saved version"
            aria-label="Keep saved version"
            @click="onKeepSaved"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body builder-stash-restore-dialog__body">
          <p id="builder-stash-restore-desc" class="text-muted">
            You saved a sketch of this page in this browser session. You can continue that work or
            keep the last saved version from your account.
          </p>
        </div>
        <div class="modal-footer builder-stash-restore-dialog__footer">
          <button type="button" class="btn btn--secondary" @click="onKeepSaved">
            Keep saved version
          </button>
          <button type="button" class="btn btn--primary" @click="$emit('resume')">
            Resume stashed work
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

defineOptions({ name: 'BuilderStashRestoreDialog' });

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  resume: [];
  'keep-saved': [];
}>();

const dialogRef = ref<HTMLElement | null>(null);

function onKeepSaved(): void {
  emit('keep-saved');
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      dialogRef.value?.focus();
    }
  },
);
</script>

<style scoped>
.builder-stash-restore-dialog {
  max-width: 28rem;
}

.builder-stash-restore-dialog__body {
  padding: var(--space-lg);
}

.builder-stash-restore-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
