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
      <option value="dash">Dash</option>
      <option value="line">Line</option>
      <option value="circle">◯</option>
      <option value="square">□</option>
      <option value="triangle">△</option>
      <option value="half_triangle">◲</option>
    </select>

    <!-- Text controls -->
    <select
      v-else
      v-model="textFontFamilyModel"
      :disabled="disabled"
      title="Font Family"
      class="compact-select"
    >
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Courier New">Courier</option>
      <option value="Verdana">Verdana</option>
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
      <button :disabled="disabled" @click="$emit('undo')" title="Undo">↶</button>
      <button :disabled="disabled" @click="$emit('redo')" title="Redo">↷</button>
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
  textFontFamily: string;
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
  'update:textFontFamily': [value: string];
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

const textFontFamilyModel = computed({
  get: () => props.textFontFamily,
  set: (value: string) => emit('update:textFontFamily', value)
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
  gap: 10px;
  align-items: center;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  transition: opacity 0.2s ease;
}

.controls-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.controls-group button {
  padding: 8px 12px;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #d6dee9;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.controls-group button:hover {
  background: #f3f6fb;
  border-color: #cbd5e1;
}

.controls-group button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.controls-group button:disabled:hover {
  background: #f8fafc;
  border-color: #d6dee9;
}

.compact-select,
.line-width {
  padding: 6px 10px;
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #d6dee9;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.compact-select {
  min-height: 32px;
  min-width: 90px;
}

.line-width {
  width: 80px;
  height: 20px;
  padding: 0;
  accent-color: #1e3a8a;
}

.compact-select:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}

.compact-select:disabled,
.line-width:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8fafc;
}

.color-picker {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 1px solid #d6dee9;
  border-radius: 8px;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
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
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.button-group button:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
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
  background: #d1d5db;
  border-radius: 2px;
}

.controls-group::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
