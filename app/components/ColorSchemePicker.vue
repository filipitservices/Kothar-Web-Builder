<template>
  <div class="color-scheme-picker">
    <!-- Header with mode toggle -->
    <div class="color-scheme-header">
      <span class="color-scheme-title">Color Scheme</span>
      <div class="toggle-group">
        <button
          type="button"
          class="toggle-group__btn"
          :class="{ 'toggle-group__btn--active': colorMode === 'presets' }"
          @click="setColorMode('presets')"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          Presets
        </button>
        <button
          type="button"
          class="toggle-group__btn"
          :class="{ 'toggle-group__btn--active': colorMode === 'custom' }"
          @click="setColorMode('custom')"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clip-rule="evenodd"/>
          </svg>
          Custom
        </button>
      </div>
    </div>

    <!-- Presets Mode -->
    <div v-if="colorMode === 'presets'" class="color-presets-panel">
      <p class="color-scheme-hint">Select a color palette that matches your brand style.</p>
      
      <div class="color-presets-grid">
        <button
          v-for="preset in COLOR_PRESETS"
          :key="preset.id"
          type="button"
          class="color-preset-card"
          :class="{ 'color-preset-card--selected': selectedPresetId === preset.id }"
          @click="selectPreset(preset)"
        >
          <div class="color-preset-swatches">
            <span 
              class="preset-swatch preset-swatch--primary" 
              :style="{ backgroundColor: preset.colors.primary }"
            ></span>
            <span 
              class="preset-swatch preset-swatch--secondary" 
              :style="{ backgroundColor: preset.colors.secondary }"
            ></span>
            <span 
              class="preset-swatch preset-swatch--accent" 
              :style="{ backgroundColor: preset.colors.accent }"
            ></span>
            <span 
              class="preset-swatch preset-swatch--bg" 
              :style="{ backgroundColor: preset.colors.background }"
            ></span>
            <span 
              class="preset-swatch preset-swatch--text" 
              :style="{ backgroundColor: preset.colors.text }"
            ></span>
          </div>
          <div class="color-preset-info">
            <span class="color-preset-name">{{ preset.name }}</span>
            <span class="color-preset-description">{{ preset.description }}</span>
          </div>
          <div v-if="selectedPresetId === preset.id" class="color-preset-check">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Custom Mode -->
    <div v-else class="color-custom-panel">
      <div class="color-custom-header">
        <p class="color-scheme-hint">Fine-tune each color to match your brand perfectly.</p>
        <button
          v-if="hasChanges"
          type="button"
          class="color-reset-btn"
          @click="handleReset"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Reset
        </button>
      </div>
      
      <div class="color-custom-grid">
        <div
          v-for="colorDef in COLOR_DEFINITIONS"
          :key="colorDef.key"
          class="color-custom-item"
        >
          <label class="color-custom-control">
            <input
              type="color"
              :value="colors[colorDef.key]"
              class="color-custom-input"
              @input="handleColorInput(colorDef.key, ($event.target as HTMLInputElement).value)"
            />
            <span
              class="color-custom-swatch"
              :style="{ backgroundColor: colors[colorDef.key] }"
            >
              <svg class="color-custom-edit-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </span>
          </label>
          <div class="color-custom-meta">
            <span class="color-custom-label">{{ colorDef.label }}</span>
            <span class="color-custom-value">{{ colors[colorDef.key] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ColorCustomization, ColorPreset, ColorMode } from '~/types/templateRequest';
import { COLOR_PRESETS, COLOR_DEFINITIONS, findMatchingPreset, isValidHexColor } from '~/constants/colorPresets';

interface Props {
  /** Current color values */
  colors: ColorCustomization;
  /** Default colors to reset to */
  defaultColors: ColorCustomization;
}

interface Emits {
  (e: 'update:colors', colors: ColorCustomization): void;
  (e: 'reset'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Color mode: 'presets' for preset selection, 'custom' for manual editing
 */
const colorMode = ref<ColorMode>('presets');

/**
 * Currently selected preset ID (null if no preset matches)
 */
const selectedPresetId = computed(() => findMatchingPreset(props.colors));

/**
 * Check if colors have been changed from defaults
 */
const hasChanges = computed(() => {
  return (
    props.colors.primary !== props.defaultColors.primary ||
    props.colors.secondary !== props.defaultColors.secondary ||
    props.colors.accent !== props.defaultColors.accent ||
    props.colors.background !== props.defaultColors.background ||
    props.colors.text !== props.defaultColors.text
  );
});

/**
 * Set color mode
 */
function setColorMode(mode: ColorMode): void {
  colorMode.value = mode;
}

/**
 * Select a preset and emit the new colors
 */
function selectPreset(preset: ColorPreset): void {
  emit('update:colors', { ...preset.colors });
}

/**
 * Handle individual color input change
 */
function handleColorInput(key: keyof ColorCustomization, value: string): void {
  if (!isValidHexColor(value)) {
    return;
  }
  
  emit('update:colors', {
    ...props.colors,
    [key]: value
  });
}

/**
 * Handle reset button click
 */
function handleReset(): void {
  emit('reset');
}
</script>

<style scoped>
/**
 * ColorSchemePicker - Self-contained color picker component
 * Uses design system tokens from components.css
 */

.color-scheme-picker {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.color-scheme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fafbfc;
  border-bottom: 1px solid #f0f1f3;
}

.color-scheme-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.color-scheme-hint {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* ==========================================================================
   PRESETS PANEL
   ========================================================================== */

.color-presets-panel {
  padding: 1.25rem;
}

.color-presets-panel .color-scheme-hint {
  margin-bottom: 1rem;
}

.color-presets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.color-preset-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.color-preset-card:hover {
  border-color: #d1d5db;
  background: #fafbfc;
}

.color-preset-card--selected {
  border-color: #1e3a8a;
  background: rgba(30, 58, 138, 0.03);
  box-shadow: 0 0 0 1px #1e3a8a;
}

.color-preset-card--selected:hover {
  border-color: #1e3a8a;
  background: rgba(30, 58, 138, 0.05);
}

.color-preset-swatches {
  display: flex;
  gap: 4px;
}

.preset-swatch {
  width: 100%;
  height: 24px;
  border-radius: 4px;
  flex: 1;
}

.preset-swatch--primary {
  border-radius: 4px 0 0 4px;
}

.preset-swatch--text {
  border-radius: 0 4px 4px 0;
}

.color-preset-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.color-preset-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.3;
}

.color-preset-description {
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.3;
}

.color-preset-check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  color: #1e3a8a;
}

.color-preset-check svg {
  width: 100%;
  height: 100%;
}

/* ==========================================================================
   CUSTOM PANEL
   ========================================================================== */

.color-custom-panel {
  padding: 1.25rem;
}

.color-custom-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.color-custom-header .color-scheme-hint {
  flex: 1;
}

.color-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.color-reset-btn:hover {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
}

.color-reset-btn svg {
  width: 14px;
  height: 14px;
}

.color-custom-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.color-custom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.color-custom-control {
  position: relative;
  cursor: pointer;
  width: 100%;
  max-width: 56px;
}

.color-custom-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-custom-swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  border: 3px solid #fff;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-custom-edit-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transition: opacity 0.15s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.color-custom-control:hover .color-custom-swatch {
  transform: scale(1.05);
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.12);
}

.color-custom-control:hover .color-custom-edit-icon {
  opacity: 1;
}

.color-custom-control:focus-within .color-custom-swatch {
  transform: scale(1.05);
  box-shadow: 
    0 0 0 2px #1e3a8a,
    0 0 0 4px rgba(30, 58, 138, 0.15);
}

.color-custom-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  text-align: center;
}

.color-custom-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.color-custom-value {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
}

/* ==========================================================================
   RESPONSIVE
   ========================================================================== */

@media (max-width: 640px) {
  .color-scheme-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }

  .color-presets-panel {
    padding: 1rem;
  }

  .color-presets-grid {
    grid-template-columns: 1fr;
  }

  .color-preset-card {
    padding: 0.75rem;
  }

  .color-custom-panel {
    padding: 1rem;
  }

  .color-custom-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .color-custom-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .color-custom-swatch {
    border-radius: 8px;
    border-width: 2px;
  }

  .color-custom-label {
    font-size: 0.625rem;
  }

  .color-custom-value {
    font-size: 0.5625rem;
  }
}

@media (max-width: 400px) {
  .color-custom-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}
</style>
