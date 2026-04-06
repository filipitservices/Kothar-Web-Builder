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

    <div v-if="modelValue === 'other'" class="industry-card-grid__custom">
      <label :for="customInputId" class="industry-card-grid__custom-label">
        Please describe your industry <span class="required">*</span>
      </label>
      <input
        :id="customInputId"
        type="text"
        class="form-input"
        :class="{ 'form-input--invalid': customValueError }"
        placeholder="e.g., Event planning, Pet grooming, Solar installation..."
        :value="customValue"
        :readonly="readOnly"
        :disabled="readOnly"
        @input="onCustomInput"
        @blur="$emit('customBlur')"
      />
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
    /** Custom industry text when "other" is selected. */
    customValue?: string;
    /** Whether the custom value has a validation error. */
    customValueError?: boolean;
    /** Drives the selected-option gradient wash (same system as color presets). */
    selectionSurfaceColors: ColorCustomization;
    options?: readonly IndustryOption[];
    name?: string;
    label?: string;
    readOnly?: boolean;
  }>(),
  {
    customValue: '',
    customValueError: false,
    options: () => INDUSTRY_OPTIONS,
    name: 'industry',
    label: 'Industry',
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:customValue', value: string): void;
  (e: 'customBlur'): void;
}>();

const uid = Math.random().toString(36).slice(2, 9);
const labelId = computed(() => `industry-label-${props.name}-${uid}`);
const customInputId = computed(() => `industry-custom-${uid}`);

function handleSelect(value: string): void {
  if (props.readOnly) return;
  emit('update:modelValue', value);
}

function onCustomInput(event: Event): void {
  if (props.readOnly) return;
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    emit('update:customValue', target.value);
  }
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

.industry-card-grid__custom {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
}

.industry-card-grid__custom-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted-dark);
  line-height: 1.3;
}

.industry-card-grid__custom-label .required {
  color: var(--color-error);
  margin-left: 2px;
}
</style>
