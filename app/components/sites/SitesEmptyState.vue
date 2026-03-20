<!--
  SitesEmptyState — Empty state for Live Sites or Orders panel.
  Responsibility: Context-aware message and optional CTA when no items exist.
  Uses design tokens only.
-->
<template>
  <div class="sites-empty" role="status" :aria-live="live ? 'polite' : undefined">
    <p class="sites-empty__text">{{ message }}</p>
    <NuxtLink
      v-if="ctaHref"
      :to="ctaHref"
      class="sites-empty__cta"
      :aria-label="ctaAriaLabel"
    >
      {{ ctaLabel }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SitesEmptyState' });

const props = withDefaults(
  defineProps<{
    /** Context: 'sites' | 'orders' — determines default message and CTA. */
    context: 'sites' | 'orders';
    /** Override default message. */
    message?: string;
    /** Show CTA link (orders: link to Gallery). */
    showCta?: boolean;
    /** Use aria-live for dynamic updates. */
    live?: boolean;
  }>(),
  {
    showCta: true,
    live: false
  }
);

const message = computed(() => {
  if (props.message) return props.message;
  return props.context === 'sites'
    ? "You don't have any live websites yet. When a site is delivered, it will appear here."
    : "You don't have any orders yet. Submit a template request from the Gallery to get started.";
});

const ctaHref = computed(() => {
  if (!props.showCta || props.context !== 'orders') return null;
  return '/gallery';
});

const ctaLabel = computed(() => {
  if (props.context === 'orders') return 'Browse templates';
  return '';
});

const ctaAriaLabel = computed(() => {
  if (props.context === 'orders') return 'Go to Gallery to browse and request templates';
  return undefined;
});
</script>
