<!--
  SitesWelcomeHeader — My Sites page header with title, subtitle, and Gallery CTA.
  Responsibility: Present page purpose and primary cross-navigation to Gallery.
  Uses design tokens only; no inline styles.
-->
<template>
  <section class="sites-welcome" aria-labelledby="sites-welcome-title">
    <div class="sites-welcome__top">
      <div class="sites-welcome__text">
        <h1 id="sites-welcome-title" class="sites-welcome-title">My Sites</h1>
        <p class="sites-welcome-subtitle">
          Manage your live websites and track template requests. Make updates, adjust content, or request changes from our team.
        </p>
      </div>
      <div class="sites-gallery-cta">
        <p class="sites-gallery-cta__headline">Discover layout templates</p>
        <NuxtLink
          to="/gallery"
          class="sites-gallery-cta__btn"
          aria-label="Open Gallery — browse professional website templates"
        >
          Open Gallery
          <svg class="sites-gallery-cta__arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'SitesWelcomeHeader' });
</script>
