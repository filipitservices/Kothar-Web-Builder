<template>
  <div class="form-progress">
    <div class="form-progress__track">
      <div class="form-progress__fill" :style="{ width: percentage + '%' }"></div>
    </div>
    <span class="form-progress__label">{{ completed }} of {{ total }} fields completed</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  completed: number;
  total: number;
}

const props = defineProps<Props>();

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.completed / props.total) * 100);
});
</script>

<style scoped>
.form-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #fff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.form-progress__track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.form-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.form-progress__label {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
}

@media (max-width: 640px) {
  .form-progress {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .form-progress__label {
    text-align: center;
  }
}
</style>
