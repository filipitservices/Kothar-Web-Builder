<template>
  <div class="years-input" role="group" :aria-labelledby="labelId">
    <span :id="labelId" class="years-input__sr-label">{{ label }}</span>
    <div class="years-input__segments">
      <label
        v-for="opt in segmentOptions"
        :key="opt.value === '' ? 'none' : opt.value"
        class="years-input__segment form-option"
        :class="{
          'form-option--selected': segmentDisplay === opt.value,
          'form-option--read-only': readOnly
        }"
      >
        <input
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="segmentDisplay === opt.value"
          :disabled="readOnly"
          class="form-option__input"
          :aria-label="`Years in business: ${opt.label}`"
          @change="handleSegmentChange(opt.value)"
        />
        <span class="years-input__segment-label">{{ opt.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

const SEGMENTS = [
  { value: '', label: 'Not specified' },
  { value: '0', label: 'Just starting' },
  { value: '1', label: '1–2 years' },
  { value: '4', label: '3–5 years' },
  { value: '8', label: '6–10 years' },
  { value: '15', label: '11–20 years' },
  { value: '25', label: '20+ years' }
] as const;

const segmentValues: readonly string[] = SEGMENTS.map((s) => s.value);
function isSegmentValue(v: string): boolean {
  return segmentValues.includes(v);
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    name?: string;
    label?: string;
    readOnly?: boolean;
  }>(),
  {
    name: 'yearsInBusiness',
    label: 'Years in business',
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
}>();

const segmentOptions = SEGMENTS;
const segmentDisplay = computed(() => {
  const v = props.modelValue.trim();
  return v === '' || isSegmentValue(v) ? v : '';
});

const labelId = computed(() => `years-label-${props.name}-${Math.random().toString(36).slice(2, 9)}`);

watch(
  () => props.modelValue.trim(),
  (trimmed) => {
    if (trimmed !== '' && !isSegmentValue(trimmed)) {
      emit('update:modelValue', '');
    }
  },
  { immediate: true }
);

function handleSegmentChange(value: string): void {
  if (props.readOnly) return;
  emit('update:modelValue', value);
  emit('blur');
}
</script>

<style scoped>
.years-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.years-input__sr-label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.years-input__segments {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.years-input__segment {
  display: inline-flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
}

.years-input__segment-label {
  position: relative;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted-dark);
}

.form-option--selected .years-input__segment-label {
  color: var(--color-primary);
}
</style>
