<template>
  <div class="guided-description" role="group" :aria-labelledby="labelId">
    <span :id="labelId" class="guided-description__sr-label">{{ label }}</span>
    <div class="guided-description__blocks">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="guided-description__block"
        :class="{ 'guided-description__block--filled': block.value.trim() !== '' }"
      >
        <label :for="block.id" class="guided-description__block-label">{{ block.label }}</label>
        <textarea
          :id="block.id"
          :value="block.value"
          :placeholder="block.placeholder"
          :readonly="readOnly"
          :disabled="readOnly"
          class="guided-description__block-input"
          rows="2"
          @input="onBlockInput(index, $event)"
          @blur="$emit('blur')"
        />
      </div>
    </div>
    <p v-if="hint" class="guided-description__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const BLOCK_SEP = '\n\n';

const BLOCKS_CONFIG: ReadonlyArray<{ id: string; label: string; placeholder: string }> = [
  { id: 'block-what', label: 'What we do', placeholder: 'e.g. We provide residential and commercial plumbing repairs and installations.' },
  { id: 'block-who', label: 'Who we serve', placeholder: 'e.g. Homeowners, property managers, and local businesses in the Greater Metro area.' },
  { id: 'block-difference', label: 'What sets us apart', placeholder: 'e.g. 24/7 emergency service, licensed and insured, 15 years of experience.' }
];

interface BlockDisplay {
  id: string;
  label: string;
  placeholder: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    hint?: string;
    readOnly?: boolean;
  }>(),
  {
    label: 'Tell us about your business',
    hint: '',
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blur'): void;
}>();

function parseValue(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed === '') return ['', '', ''];
  const parts = trimmed.split(BLOCK_SEP);
  return [
    parts[0] ?? '',
    parts[1] ?? '',
    parts[2] ?? (parts.slice(2).join(BLOCK_SEP) || '')
  ];
}

function serialize(values: string[]): string {
  return values.map((v) => v.trim()).filter(Boolean).join(BLOCK_SEP);
}

const blocks = computed<BlockDisplay[]>(() => {
  const values = parseValue(props.modelValue);
  return BLOCKS_CONFIG.map((c, i) => ({
    ...c,
    value: values[i] ?? ''
  }));
});

function onBlockInput(index: number, event: Event): void {
  if (props.readOnly) return;
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement)) return;
  const currentValues = blocks.value.map((b) => b.value);
  const nextValues = currentValues.map((v, i) => (i === index ? target.value : v));
  emit('update:modelValue', serialize(nextValues));
}

const labelId = computed(() => `guided-desc-${Math.random().toString(36).slice(2, 9)}`);
</script>

<style scoped>
.guided-description {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.guided-description__sr-label {
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

.guided-description__blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.guided-description__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.guided-description__block:hover {
  border-color: var(--color-border-hover);
}

.guided-description__block:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}

.guided-description__block--filled {
  background: var(--color-bg-muted);
  border-color: var(--color-border);
}

.guided-description__block-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted-dark);
  line-height: 1.3;
}

.guided-description__block-input {
  width: 100%;
  min-height: 2.5rem;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-family: inherit;
  color: var(--color-text);
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.guided-description__block-input::placeholder {
  color: var(--color-placeholder);
}

.guided-description__block-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.guided-description__block-input:disabled,
.guided-description__block-input[readonly] {
  background: var(--color-bg-muted);
  cursor: default;
}

.guided-description__hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}
</style>
