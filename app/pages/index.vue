<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Request Websites Visually</h1>
        <div class="hero-hl" role="status">
          <span class="hero-hl-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <p class="hero-hl-text">For businesses that need quality without losing control.</p>
        </div>
        <p class="hero-subtitle">
          Customize the direction with our guided workflow, work minimally and visually, and get a polished site delivered faster than generic builders with more care and quality than pure AI.
        </p>
        <NuxtLink :to="isAuthenticated ? '/gallery' : '/login'" class="hero-cta">
          {{ isAuthenticated ? 'Open Gallery' : 'Get Started Free' }}
        </NuxtLink>
      </div>
    </section>

    <!-- Features: three stacked sections -->
    <div class="feat">
      <LandingSectionAi />
      <LandingSectionDesigners />
      <LandingSectionDelivery />
    </div>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; 2026 {{ appConfig.appName }}. All rights reserved.</p>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy</a>
          <a href="#" class="footer-link">Terms</a>
          <a href="#" class="footer-link">Help</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  middleware: 'landing'
});

const { isAuthenticated } = useAuth();
const appConfig = useAppConfig();
</script>

<style scoped src="~/assets/css/landing.css"></style>