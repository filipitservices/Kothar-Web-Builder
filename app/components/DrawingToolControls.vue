<template>
  <div class="controls-group" :class="{ disabled }">
    <!-- Text/Draw mode toggle -->
    <DualSwitch
      :model-value="isTextMode"
      @update:model-value="$emit('update:isTextMode', $event)"
      left-label="🖊️ Draw"
      right-label="✏️ Text"
      :disabled="disabled"
      :title="isTextMode ? 'Switch to Draw mode' : 'Switch to Text mode'"
      compact
    />

    <!-- Draw controls -->
    <select
      v-if="!isTextMode"
      v-model="strokeTypeModel"
      :disabled="disabled"
      title="Stroke Type"
      class="compact-select"
    >
      <option value="dash">Freehand (dash)</option>
      <option value="line">Straight line</option>
      <option value="circle">Circle</option>
      <option value="square">Square</option>
      <option value="triangle">Triangle</option>
      <option value="half_triangle">Right triangle</option>
    </select>

    <!-- Text controls -->
    <select
      v-else
      v-model="textEmphasisModel"
      :disabled="disabled"
      title="Text Emphasis"
      class="compact-select"
    >
      <option value="normal">Normal</option>
      <option value="bold">Bold</option>
      <option value="italic">Italic</option>
    </select>

    <!-- Color picker (both modes) -->
    <input
      type="color"
      v-model="colorModel"
      :disabled="disabled"
      :title="isTextMode ? 'Text Color' : 'Color'"
      class="color-picker"
    />

    <!-- Slider (both modes) -->
    <input
      v-if="!isTextMode"
      type="range"
      v-model.number="lineWidthModel"
      :disabled="disabled"
      min="1"
      max="50"
      title="Line Width"
      class="line-width"
    />
    <input
      v-else
      type="range"
      v-model.number="textFontSizeModel"
      :disabled="disabled"
      min="8"
      max="22"
      title="Font Size"
      class="line-width"
    />

    <!-- Shared action buttons -->
    <div class="button-group">
      <button :disabled="disabled || isTextMode" @click="$emit('undo')" title="Undo">↶</button>
      <button :disabled="disabled || isTextMode" @click="$emit('redo')" title="Redo">↷</button>
    </div>

    <button class="trash-btn" :disabled="disabled" @click="$emit('clear')" title="Clear all">🗑️</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DualSwitch from './DualSwitch.vue';

interface Props {
  isTextMode: boolean;
  strokeType: string;
  color: string;
  lineWidth: number;
  textFontSize: number;
  textColor: string;
  textEmphasis: 'normal' | 'bold' | 'italic';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

interface Emits {
  'update:isTextMode': [value: boolean];
  'update:strokeType': [value: string];
  'update:color': [value: string];
  'update:lineWidth': [value: number];
  'update:textFontSize': [value: number];
  'update:textColor': [value: string];
  'update:textEmphasis': [value: 'normal' | 'bold' | 'italic'];
  undo: [];
  redo: [];
  clear: [];
}

const emit = defineEmits<Emits>();

// Create computed writable refs for v-model
const strokeTypeModel = computed({
  get: () => props.strokeType,
  set: (value: string) => emit('update:strokeType', value)
});

const textEmphasisModel = computed({
  get: () => props.textEmphasis,
  set: (value: 'normal' | 'bold' | 'italic') => emit('update:textEmphasis', value)
});

const colorModel = computed({
  get: () => props.isTextMode ? props.textColor : props.color,
  set: (value: string) => {
    if (props.isTextMode) {
      emit('update:textColor', value);
    } else {
      emit('update:color', value);
    }
  }
});

const lineWidthModel = computed({
  get: () => props.lineWidth,
  set: (value: number) => emit('update:lineWidth', value)
});

const textFontSizeModel = computed({
  get: () => props.textFontSize,
  set: (value: number) => emit('update:textFontSize', value)
});
</script>

<style scoped>
.controls-group {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgb(15 23 42 / 6%);
  transition: opacity 0.2s ease;
}

.controls-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.controls-group button {
  padding: var(--space-sm) 0.75rem;
  background: var(--color-white);
  color: var(--color-text-muted-dark);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgb(15 23 42 / 6%);
}

.controls-group button:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.controls-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-bg-subtle);
}

.controls-group button:disabled:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border);
}

.compact-select,
.line-width {
  padding: 6px 10px;
  background: var(--color-bg-subtle);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

.compact-select {
  min-height: 32px;
  min-width: 90px;
}

.line-width {
  width: 80px;
  height: 20px;
  padding: 0;
  accent-color: var(--color-primary);
}

.compact-select:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg);
}

.compact-select:disabled,
.line-width:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--color-bg-subtle);
}

.color-picker {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
}

.color-picker:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 1px 2px rgb(15 23 42 / 6%);
}

.button-group button {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 0;
  margin: 0;
}

.button-group button:first-child {
  border-right: none;
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.button-group button:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.trash-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

/* Scrollbar styling for overflow */
.controls-group::-webkit-scrollbar {
  height: 4px;
}

.controls-group::-webkit-scrollbar-track {
  background: transparent;
}

.controls-group::-webkit-scrollbar-thumb {
  background: var(--color-border-hover);
  border-radius: 2px;
}

.controls-group::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
</style>
