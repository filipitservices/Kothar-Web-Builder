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

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-content">
        <h2 class="features-title">Why Choose {{ appConfig.appName }}?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-heading">Visual Builder</h3>
            <p class="feature-description">
              Drag pre-built blocks onto your canvas. No HTML, CSS, or coding knowledge required.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-heading">Dual-Screen Preview</h3>
            <p class="feature-description">
              Design for desktop and mobile simultaneously. See exactly how your site looks on any device.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✏️</div>
            <h3 class="feature-heading">Inline Editing</h3>
            <p class="feature-description">
              Click and type directly on blocks. Edit content in real-time without modal dialogs.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-heading">Smart Customization</h3>
            <p class="feature-description">
              Customize blocks with your business info. Global data syncs across all components.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-heading">Rich Components</h3>
            <p class="feature-description">
              Hero sections, navigation, footers, forms, galleries, pricing tables, and more.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3 class="feature-heading">Design System</h3>
            <p class="feature-description">
              Consistent spacing, typography, and colors. Professional-looking sites built instantly.
            </p>
          </div>
        </div>
      </div>
    </section>

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

<style src="~/assets/css/style.css"></style>
<style scoped src="~/assets/css/landing.css"></style>