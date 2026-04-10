<script setup lang="ts">
import { computed } from 'vue';

interface CTAData {
  variant?: 'centered' | 'banner' | 'split' | 'minimal' | 'urgent';
  /** Primary heading — accepts either 'title' (component-canonical) or 'headline' (store shorthand) */
  title?: string;
  headline?: string;
  /** Supporting text — accepts either 'subtitle' or 'subheadline' */
  subtitle?: string;
  subheadline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  note?: string;
  features?: string[];
  phone?: string;
}

const props = defineProps<{
  data: CTAData;
  viewMode: 'desktop' | 'mobile';
}>();

const variant = computed(() => props.data.variant ?? 'centered');
const title = computed(() => props.data.title ?? props.data.headline ?? '');
const subtitle = computed(() => props.data.subtitle ?? props.data.subheadline ?? undefined);
const primaryCta = computed(() => props.data.primaryCta ?? '');
</script>

<template>
  <section
    class="cta-section show-sect"
    :class="[`cta-section--${variant}`, `view-${viewMode}`]"
  >
    <!-- Centered Variant (default) -->
    <template v-if="variant === 'centered'">
      <div class="cta-centered">
        <h2 class="cta-title">{{ title }}</h2>
        <p v-if="subtitle" class="cta-subtitle">{{ subtitle }}</p>
        <div class="cta-actions">
          <button class="show-btn show-btn--cta show-btn--large">{{ primaryCta }}</button>
          <button v-if="data.secondaryCta" class="show-btn show-btn--outline show-btn--large">
            {{ data.secondaryCta }}
          </button>
        </div>
        <div v-if="data.phone" class="cta-phone">
          <svg viewBox="0 0 20 20" fill="currentColor" class="cta-phone__icon">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
          {{ data.phone }}
        </div>
        <p v-if="data.note" class="cta-note">{{ data.note }}</p>
      </div>
    </template>

    <!-- Banner Variant -->
    <template v-else-if="variant === 'banner'">
      <div class="cta-banner">
        <div class="cta-banner__content">
          <h2 class="cta-title cta-title--light">{{ title }}</h2>
          <p v-if="subtitle" class="cta-subtitle cta-subtitle--light">{{ subtitle }}</p>
        </div>
        <div class="cta-banner__action">
          <button class="show-btn show-btn--cta show-btn--large">{{ primaryCta }}</button>
        </div>
      </div>
    </template>

    <!-- Split Variant -->
    <template v-else-if="variant === 'split'">
      <div class="cta-split">
        <div class="cta-split__content">
          <h2 class="cta-title">{{ title }}</h2>
          <p v-if="subtitle" class="cta-subtitle">{{ subtitle }}</p>
          <ul v-if="data.features?.length" class="cta-features">
            <li v-for="(feature, idx) in data.features" :key="idx">
              <svg class="cta-feature-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              {{ feature }}
            </li>
          </ul>
        </div>
        <div class="cta-split__form">
          <form class="cta-form" @submit.prevent>
            <input type="email" placeholder="Enter your email" class="cta-input" />
            <button type="submit" class="show-btn show-btn--cta">{{ primaryCta }}</button>
          </form>
          <p v-if="data.note" class="cta-note">{{ data.note }}</p>
        </div>
      </div>
    </template>

    <!-- Minimal Variant -->
    <template v-else-if="variant === 'minimal'">
      <div class="cta-minimal">
        <div class="cta-minimal__content">
          <h2 class="cta-title cta-title--minimal">{{ title }}</h2>
          <p v-if="subtitle" class="cta-subtitle">{{ subtitle }}</p>
        </div>
        <button class="show-btn show-btn--outline">
          {{ primaryCta }}
          <svg class="show-icon show-icon--sm" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- Urgent Variant -->
    <template v-else-if="variant === 'urgent'">
      <div class="cta-urgent">
        <div class="cta-urgent__badge">Limited Time</div>
        <h2 class="cta-title cta-title--light cta-title--urgent">{{ title }}</h2>
        <p v-if="subtitle" class="cta-subtitle cta-subtitle--light">{{ subtitle }}</p>
        <div class="cta-actions">
          <button class="show-btn show-btn--cta show-btn--large">{{ primaryCta }}</button>
        </div>
        <p v-if="data.note" class="cta-note cta-note--light">{{ data.note }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* CTA-specific button variant: accent background, primary text — high contrast */
.show-btn--cta {
  background: var(--showcase-accent);
  color: var(--showcase-primary);
  border: none;
}

.cta-section {
  background: color-mix(in srgb, var(--showcase-primary) 6%, var(--showcase-bg));
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--showcase-primary), var(--showcase-accent));
}

.cta-section--banner,
.cta-section--urgent {
  background: linear-gradient(135deg,
    var(--showcase-primary),
    color-mix(in srgb, var(--showcase-primary) 72%, black)
  );
  color: var(--color-white);
}

.cta-section--banner::before,
.cta-section--urgent::before {
  display: none;
}

.cta-section--minimal {
  background: var(--showcase-bg);
  border-top: 1px solid color-mix(in srgb, var(--showcase-primary) 14%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--showcase-primary) 14%, transparent);
}

.cta-section--minimal::before {
  display: none;
}

/* --- Common text --- */

.cta-title {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--showcase-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.25;
}

.cta-title--light { color: var(--color-white); }
.cta-title--minimal { font-size: 1.15em; }
.cta-title--urgent { font-size: 1.6em; }

.cta-subtitle {
  font-size: 0.875em;
  color: color-mix(in srgb, var(--showcase-text) 65%, var(--showcase-bg));
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.55;
}

.cta-subtitle--light { color: rgba(255, 255, 255, 0.82); }

.cta-actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.cta-note {
  font-size: 0.72em;
  color: color-mix(in srgb, var(--showcase-text) 50%, transparent);
  margin: var(--space-sm) 0 0 0;
}

.cta-note--light { color: rgba(255, 255, 255, 0.6); }

/* Phone display */
.cta-phone {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  background: color-mix(in srgb, var(--showcase-primary) 10%, var(--showcase-bg));
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 22%, transparent);
  border-radius: var(--radius-xl);
  font-size: 0.8em;
  font-weight: 700;
  color: var(--showcase-primary);
}

.cta-phone__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Feature list */
.cta-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-md) 0;
}

.cta-features li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.85em;
  color: color-mix(in srgb, var(--showcase-text) 80%, var(--showcase-bg));
  padding: 3px 0;
}

.cta-feature-icon {
  width: 14px;
  height: 14px;
  color: var(--showcase-accent);
  flex-shrink: 0;
}

/* Form */
.cta-form {
  display: flex;
  gap: var(--space-sm);
}

.view-mobile .cta-form { flex-direction: column; }

.cta-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875em;
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 22%, transparent);
  border-radius: var(--radius-md);
  background: var(--showcase-bg);
  color: var(--showcase-text);
  outline: none;
}

/* ===== CENTERED ===== */
.cta-centered {
  text-align: center;
  max-width: 520px;
  margin: 0 auto;
}

.cta-centered .cta-actions { justify-content: center; }
.cta-centered .cta-phone { margin-left: auto; margin-right: auto; }

/* ===== BANNER ===== */
.cta-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
  flex-wrap: wrap;
}

.view-mobile .cta-banner {
  flex-direction: column;
  text-align: center;
}

.cta-banner__content .cta-title,
.cta-banner__content .cta-subtitle {
  margin-bottom: var(--space-xs);
}

/* ===== SPLIT ===== */
.cta-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
}

.view-mobile .cta-split {
  grid-template-columns: 1fr;
  gap: var(--space-lg);
}

.cta-split__form {
  background: var(--showcase-bg);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 16%, transparent);
}

/* ===== MINIMAL ===== */
.cta-minimal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.view-mobile .cta-minimal {
  flex-direction: column;
  text-align: center;
}

.cta-minimal__content .cta-subtitle { margin-bottom: 0; }

/* ===== URGENT ===== */
.cta-urgent {
  text-align: center;
  padding: var(--space-md) 0;
}

.cta-urgent__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  padding: 5px var(--space-md);
  border-radius: var(--radius-xl);
  font-size: 0.68em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-md);
}

.cta-urgent .cta-actions { justify-content: center; }
</style>
