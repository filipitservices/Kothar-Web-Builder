<template>
  <div class="landing-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Order Websites Visually</h1>
        <div class="hero-hl" role="status">
          <span class="hero-hl-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <p class="hero-hl-text">Own a small business? This was built for you.</p>
        </div>
        <p class="hero-subtitle">
          Choose or layout a professional design yourself, tell us what your business needs — <b>get a polished website delivered fast</b>.
        </p>
        <NuxtLink :to="isAuthenticated ? '/dashboard' : '/login'" class="hero-cta">
          {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started Free' }}
        </NuxtLink>
      </div>
    </section>

    <!-- Features: three stacked sections -->
    <div class="feat">
      <LandingSectionAi />
      <LandingSectionDesigners />
      <LandingSectionDelivery />
    </div>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Build Your Website?</h2>
        <p class="cta-subtitle">Create a professional site without code. Start now.</p>
        <NuxtLink :to="isAuthenticated ? '/dashboard' : '/login'" class="cta-button">
          {{ isAuthenticated ? 'Go to Dashboard' : 'Launch Builder' }}
        </NuxtLink>
      </div>
    </section>

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

const { isAuthenticated } = useAuth();
const appConfig = useAppConfig();
</script>

<style scoped src="~/assets/css/landing.css"></style>