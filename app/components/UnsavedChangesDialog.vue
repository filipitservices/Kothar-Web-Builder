<template>
  <Teleport to="body">
    <div
      v-if="unsaved.modalOpen"
      class="modal-overlay"
      role="presentation"
      @click.self="onStay"
    >
      <div
        class="modal-container unsaved-changes-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-desc"
        tabindex="-1"
        ref="dialogRef"
        @keydown.escape.prevent="onStay"
      >
        <div class="modal-header">
          <h2 id="unsaved-changes-title" class="text-title">Leave without saving?</h2>
          <button
            type="button"
            class="modal-close"
            title="Stay on page"
            aria-label="Stay on page"
            @click="onStay"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body unsaved-changes-dialog__body">
          <p id="unsaved-changes-desc" class="text-muted">
            You have an in-progress request. If you leave now, unsaved progress may be lost.
          </p>
        </div>
        <div class="modal-footer unsaved-changes-dialog__footer">
          <button type="button" class="btn btn--secondary" @click="onStay">
            Stay on page
          </button>
          <button
            type="button"
            class="btn btn--danger"
            :disabled="discarding"
            @click="onDiscardLeave"
          >
            {{ discarding ? 'Leaving…' : 'Discard changes' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUnsavedChangesStore } from '~/stores/unsavedChanges';

defineOptions({ name: 'UnsavedChangesDialog' });

const unsaved = useUnsavedChangesStore();
const router = useRouter();
const dialogRef = ref<HTMLElement | null>(null);
const discarding = ref(false);

function onStay(): void {
  unsaved.closeModalStay();
}

watch(
  () => unsaved.modalOpen,
  async (open) => {
    if (open) {
      await nextTick();
      dialogRef.value?.focus();
    }
  }
);

async function onDiscardLeave(): Promise<void> {
  const target = unsaved.pendingTo;
  if (!target || discarding.value) return;
  discarding.value = true;
  try {
    await unsaved.runDiscard();
    unsaved.closeModalStay();
    unsaved.requestAllowNext();
    await router.push(target);
  } catch {
    unsaved.consumeAllowNext();
  } finally {
    discarding.value = false;
  }
}
</script>

<style scoped>
.unsaved-changes-dialog {
  max-width: 28rem;
}

.unsaved-changes-dialog__body {
  padding: var(--space-lg);
}

.unsaved-changes-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
