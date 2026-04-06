<template>
  <div class="goal-selector">
    <div class="goal-selector__grid">
      <label
        v-for="goal in goals"
        :key="goal.value"
        class="goal-card form-option"
        :class="{
          'form-option--selected': modelValue.includes(goal.value),
          'form-option--read-only': readOnly
        }"
        :style="
          modelValue.includes(goal.value)
            ? selectionSurfaceCustomProperties(selectionSurfaceColors)
            : undefined
        "
      >
        <input
          type="checkbox"
          :value="goal.value"
          :checked="modelValue.includes(goal.value)"
          :disabled="readOnly"
          class="form-option__input"
          :aria-label="`Select: ${goal.label}`"
          @change="handleChange(goal.value, $event)"
        />
        <span class="goal-card__icon">
          <component :is="getIconComponent(goal.value)" />
        </span>
        <span class="goal-card__label">{{ goal.label }}</span>
        <span class="goal-card__check">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue';
import type { ColorCustomization } from '~/types/templateRequest';
import { selectionSurfaceCustomProperties } from '~/utils/colorSurfaceWash';

interface GoalOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    goals: readonly GoalOption[];
    modelValue: string[];
    /** Drives the selected-option gradient wash (same system as color presets). */
    selectionSurfaceColors: ColorCustomization;
    readOnly?: boolean;
  }>(),
  {
    readOnly: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

function handleChange(value: string, event: Event): void {
  if (props.readOnly) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const checked = target.checked;
  if (checked) {
    emit('update:modelValue', [...props.modelValue, value]);
  } else {
    emit('update:modelValue', props.modelValue.filter((v) => v !== value));
  }
}

/**
 * Icon components for each goal type
 */
const LeadsIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '9', cy: '7', r: '4' }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
]);

const ShowcaseIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '2', y: '3', width: '20', height: '14', rx: '2', ry: '2' }),
  h('line', { x1: '8', y1: '21', x2: '16', y2: '21' }),
  h('line', { x1: '12', y1: '17', x2: '12', y2: '21' })
]);

const CredibilityIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
]);

const SeoIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('circle', { cx: '11', cy: '11', r: '8' }),
  h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
]);

const BookingIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
  h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
  h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
  h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
]);

const EcommerceIcon: FunctionalComponent = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('circle', { cx: '9', cy: '21', r: '1' }),
  h('circle', { cx: '20', cy: '21', r: '1' }),
  h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' })
]);

/**
 * Get the appropriate icon component for a goal value
 */
function getIconComponent(value: string): FunctionalComponent {
  const iconMap: Record<string, FunctionalComponent> = {
    'generate-leads': LeadsIcon,
    'showcase-services': ShowcaseIcon,
    'build-credibility': CredibilityIcon,
    'local-seo': SeoIcon,
    'booking': BookingIcon,
    'ecommerce': EcommerceIcon
  };
  return iconMap[value] || EcommerceIcon;
}
</script>

<style scoped>
.goal-selector__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.goal-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-bg);
  position: relative;
}

.goal-card__icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.goal-card__icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
}

.form-option--selected .goal-card__icon {
  background: var(--color-primary-tint);
}

.form-option--selected .goal-card__icon :deep(svg) {
  color: var(--color-primary);
}

.goal-card__label {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted-dark);
  line-height: 1.4;
}

.goal-card__check {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--color-border);
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.goal-card__check svg {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-white);
}

.form-option--selected .goal-card__check {
  opacity: 1;
  transform: scale(1);
  background: var(--color-primary);
}
</style>
