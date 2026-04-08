<template>
  <div class="screen-header">
    <h2>{{ title }}</h2>
    <span v-if="showDrawingActive" class="drawing-pill">Drawing on</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  showDrawingActive: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-muted);
}

.screen-header h2 {
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  color: var(--color-text);
}

.drawing-pill {
  font-size: 11px;
  line-height: 1;
  font-weight: 600;
  color: var(--color-success);
  background: var(--color-success-tint);
  border: 1px solid var(--color-success);
  border-radius: 999px;
  padding: var(--space-xs) var(--space-sm);
}
</style>
