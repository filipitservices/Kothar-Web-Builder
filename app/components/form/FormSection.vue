<template>
  <fieldset class="form-section" :class="{ 'form-section--featured': featured }">
    <legend class="form-section__legend">
      <span class="form-section__icon" :class="`form-section__icon--${variant}`">
        <slot name="icon" />
      </span>
      <span class="form-section__text">
        <span class="form-section__title">{{ title }}</span>
        <span v-if="hint" class="form-section__hint">{{ hint }}</span>
      </span>
      <span v-if="step" class="form-section__step">{{ step }}</span>
    </legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  hint?: string;
  step?: number | string;
  variant?: 'palette' | 'building' | 'contact' | 'target' | 'sparkle' | 'branding' | 'business' | 'requests';
  featured?: boolean;
}

withDefaults(defineProps<Props>(), {
  hint: '',
  step: undefined,
  variant: 'building',
  featured: false
});
</script>

<style scoped>
.form-section {
  border: none;
  padding: var(--space-lg);
  margin: 0 0 var(--space-md) 0;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  border-color: var(--color-border-hover);
}

.form-section:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring-primary);
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-section--featured {
  background: var(--color-bg-muted);
  border-color: var(--color-primary-tint);
}

/* Inner spacing for form elements */
.form-section :deep(.form-group) {
  margin-bottom: var(--space-lg);
}

.form-section :deep(.form-group:last-child) {
  margin-bottom: 0;
}

.form-section :deep(.form-row) {
  margin-bottom: var(--space-lg);
}

.form-section :deep(.form-row:last-child) {
  margin-bottom: 0;
}

/* Legend */
.form-section__legend {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0;
  margin-bottom: var(--space-lg);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

/* Icon container */
.form-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.form-section__icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

/* Icon variants – use tokens where possible; subtle tints for distinction */
.form-section__icon--palette {
  background: var(--color-primary-tint);
  color: var(--color-primary);
}

.form-section__icon--building {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--contact {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--target {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--sparkle {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--branding {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--business {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

.form-section__icon--requests {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
}

/* Text content */
.form-section__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
}

.form-section__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.form-section__hint {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-text-muted);
  line-height: 1.3;
}

/* Step indicator */
.form-section__step {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-bg-subtle);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .form-section__legend {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .form-section__step {
    order: -1;
    margin-left: auto;
  }
}
</style>
