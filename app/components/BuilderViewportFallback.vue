<template>
  <main class="builder-fallback" role="main" aria-labelledby="builder-fallback-title">
    <div class="builder-fallback__card">
      <p class="builder-fallback__eyebrow">Layout editor</p>
      <h1 id="builder-fallback-title" class="builder-fallback__title">Open this editor on a larger screen</h1>
      <p class="builder-fallback__text">
        The visual page layout editor is available on screens wider than {{ minWidth - 1 }}px to keep editing reliable.
      </p>
      <NuxtLink :to="backTo" class="builder-fallback__action">
        {{ backLabel }}
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
interface BuilderViewportFallbackProps {
  minWidth: number;
  backTo: string;
  backLabel: string;
}

defineProps<BuilderViewportFallbackProps>();
</script>

<style scoped>
.builder-fallback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--color-bg-muted);
}

.builder-fallback__card {
  width: 100%;
  max-width: 34rem;
  padding: var(--space-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.builder-fallback__eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.builder-fallback__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.5rem;
  line-height: 1.3;
}

.builder-fallback__text {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.builder-fallback__action {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted-dark);
  background: var(--color-bg);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.builder-fallback__action:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-muted);
  text-decoration: none;
}

.builder-fallback__action:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring-primary);
}
</style>
