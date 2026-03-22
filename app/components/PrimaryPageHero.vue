<!--
  PrimaryPageHero — shared primary hero (same structure and styles as My Sites header).
  Single source of truth for the bold primary hero + inverse CTA; used by /sites and /gallery.
-->
<template>
  <section class="sites-welcome" :aria-labelledby="resolvedTitleId">
    <div class="sites-welcome__top">
      <div class="sites-welcome__text">
        <h1 :id="resolvedTitleId" class="sites-welcome-title">{{ title }}</h1>
        <p class="sites-welcome-subtitle">{{ subtitle }}</p>
      </div>
      <div class="sites-gallery-cta">
        <p class="sites-gallery-cta__headline">{{ ctaHeadline }}</p>
        <NuxtLink
          :to="ctaTo"
          class="sites-gallery-cta__btn"
          :aria-label="ctaAriaLabel"
        >
          {{ ctaLabel }}
          <svg class="sites-gallery-cta__arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    ctaHeadline: string;
    ctaLabel: string;
    /** Route path, hash path, or string accepted by NuxtLink `to` */
    ctaTo: string;
    ctaAriaLabel: string;
    titleId?: string;
  }>(),
  {
    titleId: undefined,
  }
);

const resolvedTitleId = computed(() => props.titleId ?? 'primary-page-hero-title');
</script>

<style src="~/assets/css/sites-hero.css"></style>
