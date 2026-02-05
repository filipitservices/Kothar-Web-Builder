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
  variant?: 'palette' | 'building' | 'contact' | 'target' | 'sparkle';
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
  padding: 1.5rem;
  margin: 0 0 1rem 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  border-color: #d1d5db;
}

.form-section:focus-within {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.06);
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-section--featured {
  background: linear-gradient(135deg, #fafbfc 0%, #fff 100%);
  border-color: #e0e7ff;
}

/* Inner spacing for form elements */
.form-section :deep(.form-group) {
  margin-bottom: 1.25rem;
}

.form-section :deep(.form-group:last-child) {
  margin-bottom: 0;
}

.form-section :deep(.form-row) {
  margin-bottom: 1.25rem;
}

.form-section :deep(.form-row:last-child) {
  margin-bottom: 0;
}

/* Legend */
.form-section__legend {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

/* Icon container */
.form-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.form-section__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Icon variants */
.form-section__icon--palette {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  color: #1e3a8a;
}

.form-section__icon--building {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.form-section__icon--contact {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.form-section__icon--target {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.form-section__icon--sparkle {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #6d28d9;
}

/* Text content */
.form-section__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.form-section__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.form-section__hint {
  font-size: 0.8125rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.3;
}

/* Step indicator */
.form-section__step {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
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
