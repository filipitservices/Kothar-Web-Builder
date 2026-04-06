<template>
  <fieldset
    class="form-section"
    :class="[
      `form-section--${variant}`,
      { 'form-section--featured': featured }
    ]"
  >
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
  --section-accent: var(--color-primary);
  --section-surface: var(--color-bg);
  /* Section-scoped field chrome (request form); variants override */
  --fs-field-border: var(--color-border);
  --fs-field-border-hover: var(--color-border-hover);
  --fs-field-focus: var(--color-primary);
  border: none;
  padding: var(--space-lg);
  margin: 0 0 var(--space-md) 0;
  background: var(--section-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  border-color: var(--color-border-hover);
}

.form-section--branding:hover {
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 22%, var(--color-border-hover));
}

.form-section--contact:hover {
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 18%, var(--color-border-hover));
}

.form-section--palette:hover {
  border-color: color-mix(in srgb, var(--color-primary) 16%, var(--color-border-hover));
}

.form-section--business:hover {
  border-color: color-mix(in srgb, var(--color-primary) 14%, var(--color-border-hover));
}

.form-section:focus-within {
  border-color: var(--fs-field-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 10%, transparent);
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-section--featured {
  background: var(--color-bg);
  border-color: var(--color-border);
}

.form-section--palette {
  --section-accent: var(--color-primary);
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary-tint) 38%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-primary-tint) 14%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-primary) 17%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-primary) 24%, var(--color-border-hover));
  --fs-field-focus: var(--color-primary);
}

.form-section--branding {
  --section-accent: color-mix(in srgb, var(--color-accent-warm-deep) 58%, var(--color-text-muted-dark));
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-accent-warm-tint) 32%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-accent-warm-tint) 10%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-accent-warm-deep) 19%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-accent-warm-deep) 26%, var(--color-border-hover));
  --fs-field-focus: var(--color-accent-warm-deep);
}

.form-section--business {
  --section-accent: var(--color-primary);
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary-tint) 58%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-primary-tint) 28%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-primary) 25%, var(--color-border-hover));
  --fs-field-focus: var(--color-primary);
}

.form-section--contact {
  --section-accent: color-mix(in srgb, var(--color-accent-warm-deep) 42%, var(--color-text-muted-dark));
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-accent-warm-tint) 52%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-accent-warm-tint) 22%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-accent-warm-deep) 17%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-accent-warm-deep) 24%, var(--color-border-hover));
  --fs-field-focus: var(--color-accent-warm-deep);
}

.form-section--target {
  --section-accent: var(--color-success);
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-success-tint) 58%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-success-tint) 28%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-success) 20%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-success) 28%, var(--color-border-hover));
  --fs-field-focus: var(--color-success);
}

.form-section--requests {
  --section-accent: var(--color-primary-dark);
  --section-surface: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary-tint) 34%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-primary-tint) 16%, var(--color-bg)) 100%
  );
  --fs-field-border: color-mix(in srgb, var(--color-primary-dark) 18%, var(--color-border));
  --fs-field-border-hover: color-mix(in srgb, var(--color-primary-dark) 26%, var(--color-border-hover));
  --fs-field-focus: var(--color-primary-dark);
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
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0;
  margin-bottom: var(--space-lg);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.form-section--palette .form-section__legend::after,
.form-section--branding .form-section__legend::after,
.form-section--business .form-section__legend::after,
.form-section--contact .form-section__legend::after,
.form-section--target .form-section__legend::after,
.form-section--requests .form-section__legend::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--space-sm) * -1);
  height: 2px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--section-accent) 22%, transparent);
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
  background: color-mix(in srgb, var(--color-accent-warm-deep) 14%, var(--color-bg));
  color: color-mix(in srgb, var(--color-accent-warm-deep) 55%, var(--color-text-muted-dark));
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
  background: color-mix(in srgb, var(--color-accent-warm-deep) 16%, var(--color-bg));
  color: var(--color-accent-warm-deep);
}

.form-section__icon--business {
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-bg));
  color: var(--color-primary);
}

.form-section__icon--requests {
  background: color-mix(in srgb, var(--color-primary-dark) 14%, var(--color-bg));
  color: var(--color-primary-dark);
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
  background: color-mix(in srgb, var(--section-accent) 12%, var(--color-bg));
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--section-accent);
  flex-shrink: 0;
}

/* --------------------------------------------------------------------------
   Section-themed controls (request form): borders + focus match each fieldset
   -------------------------------------------------------------------------- */
.form-section :deep(.form-input:not(:disabled):not(.form-input--invalid)),
.form-section :deep(.form-textarea:not(:disabled):not(.form-textarea--invalid)),
.form-section :deep(.icon-input__field),
.form-section :deep(.location-input__field),
.form-section :deep(.preferred-url-input),
.form-section :deep(.tag-input__field) {
  border-color: var(--fs-field-border);
}

.form-section :deep(.form-input:not(:disabled):not(.form-input--invalid):hover),
.form-section :deep(.form-textarea:not(:disabled):not(.form-textarea--invalid):hover),
.form-section :deep(.icon-input__field:hover),
.form-section :deep(.location-input__field:hover),
.form-section :deep(.preferred-url-input:hover),
.form-section :deep(.tag-input__field:hover) {
  border-color: var(--fs-field-border-hover);
}

.form-section :deep(.form-input:not(:disabled):not(.form-input--invalid):focus),
.form-section :deep(.form-textarea:not(:disabled):not(.form-textarea--invalid):focus),
.form-section :deep(.icon-input:focus-within .icon-input__field),
.form-section :deep(.location-input__field:focus),
.form-section :deep(.preferred-url-input:focus),
.form-section :deep(.tag-input__field:focus) {
  border-color: var(--fs-field-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 9%, transparent);
}

.form-section :deep(.icon-input:focus-within .icon-input__icon) {
  color: var(--fs-field-focus);
}

.form-section :deep(.location-input__suggestions),
.form-section :deep(.tag-input__suggestions) {
  border-color: var(--fs-field-border);
  box-shadow: 0 var(--space-sm) var(--space-lg) color-mix(in srgb, var(--fs-field-focus) 7%, transparent);
}

.form-section--palette :deep(.color-scheme-picker) {
  border-color: var(--fs-field-border);
}

.form-section--palette :deep(.color-scheme-header) {
  border-bottom-color: color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
}

.form-section--palette :deep(.toggle-group__btn--active) {
  box-shadow:
    0 var(--space-xs) var(--space-sm) color-mix(in srgb, var(--color-primary) 8%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.form-section--palette :deep(.color-custom-control:focus-within .color-custom-swatch) {
  box-shadow:
    0 0 0 2px var(--fs-field-focus),
    0 0 0 5px color-mix(in srgb, var(--fs-field-focus) 14%, transparent);
}

.form-section--branding :deep(.upload.upload--brand) {
  --upload-border: color-mix(in srgb, var(--color-accent-warm-deep) 28%, var(--color-border));
  --upload-border-strong: color-mix(in srgb, var(--color-accent-warm-deep) 40%, var(--color-border-hover));
}

.form-section--branding :deep(.upload.upload--logo) {
  --upload-border: color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  --upload-border-strong: color-mix(in srgb, var(--color-primary) 34%, var(--color-border-hover));
}

/* Selectable cards: section-native borders + airy layered wash (not user palette) */
.form-section--business :deep(.form-option:focus-within:not(.form-option--selected)) {
  border-color: color-mix(in srgb, var(--color-primary) 32%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.form-section--business :deep(.form-option.form-option--selected) {
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  background: var(--color-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 14%, transparent),
    0 var(--space-md) var(--space-xl) color-mix(in srgb, var(--color-primary) 9%, transparent);
}

.form-section--business :deep(.form-option.form-option--selected:hover:not(.form-option--read-only)) {
  border-color: color-mix(in srgb, var(--color-primary) 36%, var(--color-border-hover));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 18%, transparent),
    0 var(--space-md) var(--space-2xl) color-mix(in srgb, var(--color-primary) 11%, transparent);
}

.form-section--business :deep(.form-option.form-option--selected:focus-within) {
  border-color: var(--fs-field-focus);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--fs-field-focus) 20%, transparent),
    0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 9%, transparent);
}

.form-section--business :deep(.form-option.form-option--selected::before) {
  background:
    radial-gradient(ellipse 135% 92% at 14% 20%, color-mix(in srgb, var(--color-accent-warm-tint) 52%, transparent) 0%, transparent 58%),
    radial-gradient(ellipse 100% 78% at 92% 32%, color-mix(in srgb, var(--color-primary-tint) 46%, transparent) 0%, transparent 54%),
    radial-gradient(ellipse 72% 58% at 48% 94%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 46%),
    linear-gradient(
      171deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-white) 99.2%, var(--color-primary-tint)) 44%,
      var(--color-white) 72%,
      color-mix(in srgb, var(--color-white) 98%, var(--color-accent-warm-tint)) 100%
    );
}

.form-section--contact :deep(.form-option:focus-within:not(.form-option--selected)) {
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 30%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent-warm-deep) 8%, transparent);
}

.form-section--contact :deep(.form-option.form-option--selected) {
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 28%, var(--color-border));
  background: var(--color-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-accent-warm-deep) 13%, transparent),
    0 var(--space-md) var(--space-xl) color-mix(in srgb, var(--color-accent-warm-deep) 8%, transparent);
}

.form-section--contact :deep(.form-option.form-option--selected:hover:not(.form-option--read-only)) {
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 34%, var(--color-border-hover));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-accent-warm-deep) 17%, transparent),
    0 var(--space-md) var(--space-2xl) color-mix(in srgb, var(--color-accent-warm-deep) 10%, transparent);
}

.form-section--contact :deep(.form-option.form-option--selected:focus-within) {
  border-color: var(--fs-field-focus);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--fs-field-focus) 18%, transparent),
    0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 9%, transparent);
}

.form-section--contact :deep(.form-option.form-option--selected::before) {
  background:
    radial-gradient(ellipse 128% 88% at 86% 18%, color-mix(in srgb, var(--color-primary-tint) 46%, transparent) 0%, transparent 56%),
    radial-gradient(ellipse 96% 76% at 12% 70%, color-mix(in srgb, var(--color-accent-warm-tint) 42%, transparent) 0%, transparent 52%),
    radial-gradient(ellipse 58% 48% at 50% 4%, color-mix(in srgb, var(--color-accent-warm-deep) 10%, transparent) 0%, transparent 40%),
    linear-gradient(
      166deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-white) 98.8%, var(--color-primary-tint)) 52%,
      var(--color-white) 100%
    );
}

.form-section--target :deep(.form-option:focus-within:not(.form-option--selected):not(.form-option--disabled)) {
  border-color: color-mix(in srgb, var(--color-success) 34%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 8%, transparent);
}

.form-section--target :deep(.form-option.form-option--selected:not(.form-option--disabled)) {
  border-color: color-mix(in srgb, var(--color-success) 30%, var(--color-border));
  background: var(--color-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-success) 14%, transparent),
    0 var(--space-md) var(--space-xl) color-mix(in srgb, var(--color-success) 9%, transparent);
}

.form-section--target :deep(.form-option.form-option--selected:hover:not(.form-option--read-only):not(.form-option--disabled)) {
  border-color: color-mix(in srgb, var(--color-success) 36%, var(--color-border-hover));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-success) 18%, transparent),
    0 var(--space-md) var(--space-2xl) color-mix(in srgb, var(--color-success) 11%, transparent);
}

.form-section--target :deep(.form-option.form-option--selected:focus-within) {
  border-color: var(--fs-field-focus);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--fs-field-focus) 20%, transparent),
    0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 9%, transparent);
}

.form-section--target :deep(.form-option.form-option--selected:not(.form-option--disabled)::before) {
  background:
    radial-gradient(ellipse 132% 90% at 22% 28%, color-mix(in srgb, var(--color-success-tint) 52%, transparent) 0%, transparent 56%),
    radial-gradient(ellipse 94% 74% at 84% 62%, color-mix(in srgb, var(--color-primary-tint) 34%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse 56% 44% at 40% 6%, color-mix(in srgb, var(--color-accent-warm-tint) 34%, transparent) 0%, transparent 42%),
    linear-gradient(
      177deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-white) 99%, var(--color-success-tint)) 38%,
      var(--color-white) 76%,
      color-mix(in srgb, var(--color-white) 98.5%, var(--color-primary-tint)) 100%
    );
}

.form-section--requests :deep(.form-option:focus-within:not(.form-option--selected)) {
  border-color: color-mix(in srgb, var(--color-primary-dark) 30%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-dark) 8%, transparent);
}

.form-section--requests :deep(.form-option.form-option--selected) {
  border-color: color-mix(in srgb, var(--color-primary-dark) 28%, var(--color-border));
  background: var(--color-bg);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary-dark) 13%, transparent),
    0 var(--space-md) var(--space-xl) color-mix(in srgb, var(--color-primary-dark) 8%, transparent);
}

.form-section--requests :deep(.form-option.form-option--selected:hover:not(.form-option--read-only)) {
  border-color: color-mix(in srgb, var(--color-primary-dark) 34%, var(--color-border-hover));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary-dark) 17%, transparent),
    0 var(--space-md) var(--space-2xl) color-mix(in srgb, var(--color-primary-dark) 10%, transparent);
}

.form-section--requests :deep(.form-option.form-option--selected:focus-within) {
  border-color: var(--fs-field-focus);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--fs-field-focus) 18%, transparent),
    0 0 0 3px color-mix(in srgb, var(--fs-field-focus) 9%, transparent);
}

.form-section--requests :deep(.form-option.form-option--selected::before) {
  background:
    radial-gradient(ellipse 130% 86% at 78% 24%, color-mix(in srgb, var(--color-accent-warm-tint) 44%, transparent) 0%, transparent 56%),
    radial-gradient(ellipse 90% 76% at 14% 58%, color-mix(in srgb, var(--color-primary-tint) 38%, transparent) 0%, transparent 52%),
    radial-gradient(ellipse 64% 50% at 52% 90%, color-mix(in srgb, var(--color-success) 9%, transparent) 0%, transparent 42%),
    linear-gradient(
      169deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-white) 98.5%, var(--color-primary-tint)) 48%,
      var(--color-white) 100%
    );
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
