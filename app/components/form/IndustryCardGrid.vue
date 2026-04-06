<template>
  <div class="industry-card-grid" role="group" :aria-labelledby="labelId" :aria-disabled="readOnly">
    <span :id="labelId" class="industry-card-grid__sr-label">{{ label }}</span>
    <div class="industry-card-grid__list">
      <label
        v-for="option in options"
        :key="option.value"
        class="industry-card form-option"
        :class="{
          'form-option--selected': modelValue === option.value,
          'form-option--read-only': readOnly
        }"
        :style="
          modelValue === option.value
            ? selectionSurfaceCustomProperties(selectionSurfaceColors)
            : undefined
        "
      >
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="readOnly"
          class="form-option__input"
          :aria-label="`Select industry: ${option.label}`"
          @change="handleSelect(option.value)"
        />
        <span class="industry-card__label">{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ColorCustomization } from '~/types/templateRequest';
import { INDUSTRY_OPTIONS } from '~/constants/formOptions';
import { selectionSurfaceCustomProperties } from '~/utils/colorSurfaceWash';

interface IndustryOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    /** Drives the selected-option gradient wash (same system as color presets). */
    selectionSurfaceColors: ColorCustomization;
    options?: readonly IndustryOption[];
    name?: string;
    label?: string;
    readOnly?: boolean;
  }>(),
  {
    options: () => INDUSTRY_OPTIONS,
    name: 'industry',
    label: 'Industry',
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const labelId = computed(() => `industry-label-${props.name}-${Math.random().toString(36).slice(2, 9)}`);

function handleSelect(value: string): void {
  if (props.readOnly) return;
  emit('update:modelValue', value);
}
</script>

<style scoped>
.industry-card-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.industry-card-grid__sr-label {
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

.industry-card-grid__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.industry-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
}

.industry-card__label {
  position: relative;
  z-index: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted-dark);
  line-height: 1.3;
}

.form-option--selected .industry-card__label {
  color: var(--color-primary);
}
</style>
