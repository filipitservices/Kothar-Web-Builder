<script setup lang="ts">
/**
 * CTASection - Call-to-action sections with multiple styles
 * 
 * Supported variants:
 * - centered: Centered text with button (default)
 * - banner: Full-width colored banner
 * - split: Text + form side by side
 * - minimal: Clean, understated style
 * - urgent: High-emphasis, urgent style
 */

interface CTAData {
  variant?: 'centered' | 'banner' | 'split' | 'minimal' | 'urgent';
  title: string;
  subtitle?: string;
  primaryCta: string;
  secondaryCta?: string;
  note?: string;
  features?: string[];
}

const props = defineProps<{
  data: CTAData;
  viewMode: 'desktop' | 'mobile';
}>();

const variant = computed(() => props.data.variant || 'centered');
</script>

<template>
  <section 
    class="cta-section showcase-section"
    :class="[
      `cta-section--${variant}`,
      `view-${viewMode}`
    ]"
  >
    <!-- Centered Variant -->
    <template v-if="variant === 'centered'">
      <div class="cta-centered">
        <h2 class="cta-title">{{ data.title }}</h2>
        <p v-if="data.subtitle" class="cta-subtitle">{{ data.subtitle }}</p>
        
        <div class="cta-actions">
          <button class="showcase-btn showcase-btn--primary-filled showcase-btn--large">
            {{ data.primaryCta }}
          </button>
          <button v-if="data.secondaryCta" class="showcase-btn showcase-btn--ghost">
            {{ data.secondaryCta }}
          </button>
        </div>
        
        <p v-if="data.note" class="cta-note">{{ data.note }}</p>
      </div>
    </template>

    <!-- Banner Variant -->
    <template v-else-if="variant === 'banner'">
      <div class="cta-banner">
        <div class="cta-banner__content">
          <h2 class="cta-title cta-title--light">{{ data.title }}</h2>
          <p v-if="data.subtitle" class="cta-subtitle cta-subtitle--light">{{ data.subtitle }}</p>
        </div>
        <div class="cta-banner__action">
          <button class="showcase-btn showcase-btn--primary showcase-btn--large">
            {{ data.primaryCta }}
          </button>
        </div>
      </div>
    </template>

    <!-- Split Variant -->
    <template v-else-if="variant === 'split'">
      <div class="cta-split">
        <div class="cta-split__content">
          <h2 class="cta-title">{{ data.title }}</h2>
          <p v-if="data.subtitle" class="cta-subtitle">{{ data.subtitle }}</p>
          
          <ul v-if="data.features?.length" class="cta-features">
            <li v-for="(feature, idx) in data.features" :key="idx">
              <svg class="showcase-icon showcase-icon--sm showcase-icon--primary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>
        <div class="cta-split__form">
          <form class="cta-form" @submit.prevent>
            <input type="email" placeholder="Enter your email" class="cta-input" />
            <button type="submit" class="showcase-btn showcase-btn--primary-filled">
              {{ data.primaryCta }}
            </button>
          </form>
          <p v-if="data.note" class="cta-note">{{ data.note }}</p>
        </div>
      </div>
    </template>

    <!-- Minimal Variant -->
    <template v-else-if="variant === 'minimal'">
      <div class="cta-minimal">
        <div class="cta-minimal__content">
          <h2 class="cta-title cta-title--minimal">{{ data.title }}</h2>
          <p v-if="data.subtitle" class="cta-subtitle">{{ data.subtitle }}</p>
        </div>
        <button class="showcase-btn showcase-btn--outline">
          {{ data.primaryCta }}
          <svg class="showcase-icon showcase-icon--sm" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- Urgent Variant -->
    <template v-else-if="variant === 'urgent'">
      <div class="cta-urgent">
        <div class="cta-urgent__badge">Limited Time</div>
        <h2 class="cta-title cta-title--light cta-title--urgent">{{ data.title }}</h2>
        <p v-if="data.subtitle" class="cta-subtitle cta-subtitle--light">{{ data.subtitle }}</p>
        
        <div class="cta-actions">
          <button class="showcase-btn showcase-btn--primary showcase-btn--large showcase-btn--pill">
            {{ data.primaryCta }}
          </button>
        </div>
        
        <p v-if="data.note" class="cta-note cta-note--light">{{ data.note }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.cta-section {
  background: #f9fafb;
}

.cta-section--banner,
.cta-section--urgent {
  background: linear-gradient(135deg, var(--showcase-primary), color-mix(in srgb, var(--showcase-primary) 70%, black));
  color: #fff;
}

.cta-section--minimal {
  background: var(--showcase-bg);
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

/* Common Elements */
.cta-title {
  font-size: 1.5em;
  font-weight: 700;
  color: var(--showcase-primary);
  margin: 0 0 8px 0;
}

.cta-title--light {
  color: #fff;
}

.cta-title--minimal {
  font-size: 1.2em;
}

.cta-title--urgent {
  font-size: 1.8em;
}

.cta-subtitle {
  font-size: 0.9em;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.cta-subtitle--light {
  color: rgba(255, 255, 255, 0.85);
}

.cta-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-note {
  font-size: 0.75em;
  color: #9ca3af;
  margin: 12px 0 0 0;
}

.cta-note--light {
  color: rgba(255, 255, 255, 0.7);
}

.cta-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.cta-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85em;
  color: #4b5563;
  padding: 4px 0;
}

/* Form Elements */
.cta-form {
  display: flex;
  gap: 10px;
}

.view-mobile .cta-form {
  flex-direction: column;
}

.cta-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.9em;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.cta-input:focus {
  outline: none;
  border-color: var(--showcase-primary);
}

/* ===== CENTERED VARIANT ===== */
.cta-centered {
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.cta-centered .cta-actions {
  justify-content: center;
}

/* ===== BANNER VARIANT ===== */
.cta-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.view-mobile .cta-banner {
  flex-direction: column;
  text-align: center;
}

.cta-banner__content .cta-title,
.cta-banner__content .cta-subtitle {
  margin-bottom: 4px;
}

.cta-banner__content .cta-subtitle {
  margin-bottom: 0;
}

/* ===== SPLIT VARIANT ===== */
.cta-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.view-mobile .cta-split {
  grid-template-columns: 1fr;
  gap: 24px;
}

.cta-split__form {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

/* ===== MINIMAL VARIANT ===== */
.cta-minimal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.view-mobile .cta-minimal {
  flex-direction: column;
  text-align: center;
}

.cta-minimal__content .cta-subtitle {
  margin-bottom: 0;
}

/* ===== URGENT VARIANT ===== */
.cta-urgent {
  text-align: center;
  padding: 16px 0;
}

.cta-urgent__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.7em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.cta-urgent .cta-actions {
  justify-content: center;
}
</style>
