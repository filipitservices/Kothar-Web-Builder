<template>
  <div class="request-category-selector">
    <div class="request-category-selector__grid">
      <label
        v-for="category in categories"
        :key="category.value"
        class="request-category-card form-option"
        :class="{
          'form-option--selected': modelValue.includes(category.value),
          'form-option--read-only': readOnly
        }"
      >
        <input
          type="checkbox"
          :value="category.value"
          :checked="modelValue.includes(category.value)"
          :disabled="readOnly"
          class="form-option__input"
          :aria-label="`Select: ${category.label}`"
          @change="handleChange(category.value, $event)"
        />
        <span class="request-category-card__icon">
          <component :is="getIconComponent(category.value)" />
        </span>
        <span class="request-category-card__label">{{ category.label }}</span>
        <span class="request-category-card__check">
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
import { REQUEST_CATEGORIES } from '~/constants/formOptions';

interface CategoryOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    categories?: readonly CategoryOption[];
    readOnly?: boolean;
  }>(),
  {
    categories: () => REQUEST_CATEGORIES,
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
  if (target.checked) {
    emit('update:modelValue', [...props.modelValue, value]);
  } else {
    emit('update:modelValue', props.modelValue.filter((v) => v !== value));
  }
}

const PageIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' })
  ]);

const FeatureIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
    h('path', { d: 'M2 17l10 5 10-5' }),
    h('path', { d: 'M2 12l10 5 10-5' })
  ]);

const ContactIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' })
  ]);

const SocialProofIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
  ]);

const BookingIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
  ]);

const ServicesIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' })
  ]);

const GalleryIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
    h('polyline', { points: '21 15 16 10 5 21' })
  ]);

const SeoIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '11', cy: '11', r: '8' }),
    h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
  ]);

const MobileIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2', ry: '2' }),
    h('line', { x1: '12', y1: '18', x2: '12.01', y2: '18' })
  ]);

const CartIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '9', cy: '21', r: '1' }),
    h('circle', { cx: '20', cy: '21', r: '1' }),
    h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' })
  ]);

const BlogIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
  ]);

const FaqIcon: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
    h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
  ]);

const iconMap: Record<string, FunctionalComponent> = {
  'specific-page': PageIcon,
  'custom-feature': FeatureIcon,
  'contact-emphasis': ContactIcon,
  'social-proof': SocialProofIcon,
  'booking-support': BookingIcon,
  'services-detail': ServicesIcon,
  'portfolio-gallery': GalleryIcon,
  'seo-optimization': SeoIcon,
  'mobile-first': MobileIcon,
  'ecommerce-listing': CartIcon,
  'blog-content': BlogIcon,
  'faq-section': FaqIcon
};

function getIconComponent(value: string): FunctionalComponent {
  return iconMap[value] ?? PageIcon;
}
</script>

<style scoped>
.request-category-selector__grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.request-category-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  position: relative;
}

.request-category-card__icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background-color 0.15s ease;
}

.request-category-card__icon :deep(svg) {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
}

.form-option--selected .request-category-card__icon {
  background: var(--color-primary-tint);
}

.form-option--selected .request-category-card__icon :deep(svg) {
  color: var(--color-primary);
}

.request-category-card__label {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted-dark);
  line-height: 1.4;
}

.request-category-card__check {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  background: var(--color-border);
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.request-category-card__check svg {
  width: 0.625rem;
  height: 0.625rem;
  color: var(--color-white);
}

.form-option--selected .request-category-card__check {
  opacity: 1;
  transform: scale(1);
  background: var(--color-primary);
}
</style>
