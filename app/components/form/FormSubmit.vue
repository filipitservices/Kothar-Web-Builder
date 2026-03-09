<template>
  <div class="form-submit">
    <div class="form-submit__content">
      <div class="form-submit__info">
        <h3 class="form-submit__title">{{ title }}</h3>
        <p class="form-submit__description">{{ description }}</p>
      </div>
      <button type="submit" class="form-submit__btn" :disabled="loading">
        <span v-if="loading" class="form-submit__loading">
          <svg class="form-submit__spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60" stroke-linecap="round"/>
          </svg>
          {{ loadingText }}
        </span>
        <span v-else class="form-submit__btn-content">
          {{ buttonText }}
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  buttonText?: string;
  loadingText?: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: 'Ready to get started?',
  description: "We'll review your request and get back to you within 1-2 business days with a personalized proposal.",
  buttonText: 'Submit Request',
  loadingText: 'Submitting...',
  loading: false
});
</script>

<style scoped>
.form-submit {
  margin-top: var(--space-2xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: 0 10px 30px rgba(30, 58, 138, 0.15);
}

.form-submit__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
}

.form-submit__info {
  flex: 1;
}

.form-submit__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-white);
  margin: 0 0 var(--space-xs) 0;
}

.form-submit__description {
  font-size: 0.875rem;
  color: var(--color-white);
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.form-submit__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem var(--space-xl);
  background: var(--color-white);
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-submit__btn:hover:not(:disabled) {
  background: var(--color-primary-tint);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.form-submit__btn:active:not(:disabled) {
  transform: translateY(0);
}

.form-submit__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-submit__btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-submit__btn-content svg {
  width: 18px;
  height: 18px;
}

.form-submit__loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-submit__spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .form-submit {
    padding: var(--space-lg);
  }

  .form-submit__content {
    flex-direction: column;
    text-align: center;
  }

  .form-submit__info {
    margin-bottom: 0.5rem;
  }

  .form-submit__btn {
    width: 100%;
  }
}
</style>
