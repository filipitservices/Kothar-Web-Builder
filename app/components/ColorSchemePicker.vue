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
          :style="selectedPresetId === preset.id ? presetSelectedSurfaceStyle(preset) : undefined"
          :aria-pressed="selectedPresetId === preset.id"
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
          <div
            v-if="selectedPresetId === preset.id"
            class="color-preset-check"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="color-preset-check__icon">
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
              @input="onColorInput(colorDef.key, $event)"
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
import {
  COLOR_PRESETS,
  COLOR_DEFINITIONS,
  findMatchingPreset,
  isValidHexColor,
  sameColorCustomization,
  normalizeColorCustomization
} from '~/constants/colorPresets';

interface Props {
  /** Current color values */
  colors: ColorCustomization;
  /** Default colors to reset to */
  defaultColors: ColorCustomization;
  /**
   * When this value changes (hydration, template change, scope id), Presets vs Custom tab
   * re-syncs from whether `colors` match a curated preset — not while the user edits colors.
   */
  colorUiResetKey: string;
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

watch(
  () => props.colorUiResetKey,
  () => {
    colorMode.value =
      findMatchingPreset(props.colors) !== null ? 'presets' : 'custom';
  },
  { immediate: true }
);

/**
 * Check if colors have been changed from defaults
 */
const hasChanges = computed(() => {
  const cur = normalizeColorCustomization(props.colors);
  const def = normalizeColorCustomization(props.defaultColors);
  if (!cur || !def) {
    return true;
  }
  return !sameColorCustomization(cur, def);
});

/**
 * Subtle selected-card wash derived from the preset itself (low contrast; static only).
 */
function presetSelectedSurfaceStyle(preset: ColorPreset): Record<string, string> {
  const { primary, accent, background } = preset.colors;
  return {
    '--preset-surface-a': `color-mix(in srgb, ${primary} 10%, transparent)`,
    '--preset-surface-b': `color-mix(in srgb, ${accent} 8%, transparent)`,
    '--preset-surface-mid': `color-mix(in srgb, ${background} 40%, transparent)`
  };
}

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
function onColorInput(key: keyof ColorCustomization, event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  handleColorInput(key, target.value);
}

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
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.color-scheme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-bg-muted);
  border-bottom: 1px solid var(--color-border);
}

.color-scheme-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted-dark);
}

.color-scheme-hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
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
  gap: var(--space-sm);
}

.color-preset-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  position: relative;
  isolation: isolate;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.color-preset-card:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-muted);
}

.color-preset-card--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 32%, transparent),
    var(--focus-ring-primary);
}

.color-preset-card--selected:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-tint);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent),
    var(--focus-ring-primary);
}

.color-preset-card--selected::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: linear-gradient(
    145deg,
    var(--preset-surface-a, transparent),
    var(--preset-surface-mid, transparent) 50%,
    var(--preset-surface-b, transparent)
  );
  pointer-events: none;
}

.color-preset-card:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}

.color-preset-card--selected:focus-visible {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent),
    var(--focus-ring-primary);
}

.color-preset-swatches {
  display: flex;
  gap: 4px;
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
}

.color-preset-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted-dark);
  line-height: 1.3;
}

.color-preset-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.color-preset-check {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text) 6%, transparent);
  color: var(--color-primary);
}

.color-preset-check__icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
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
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
  flex-shrink: 0;
}

.color-reset-btn:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text-muted-dark);
  background: var(--color-bg-muted);
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
  border: 3px solid var(--color-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-text) 12%, transparent),
    0 2px 6px color-mix(in srgb, var(--color-text) 8%, transparent);
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
    0 0 0 2px var(--color-primary),
    0 0 0 4px color-mix(in srgb, var(--color-primary) 18%, transparent);
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
  color: var(--color-text-muted-dark);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.color-custom-value {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-placeholder);
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
