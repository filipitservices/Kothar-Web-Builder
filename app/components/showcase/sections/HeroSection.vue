<template>
  <section
    class="show-sect show-sect--hero"
    :class="[
      `hero--${backgroundStyle}`,
      viewMode === 'mobile' && 'hero--mobile'
    ]"
  >
    <!-- Gradient style: split layout with phone chip -->
    <template v-if="backgroundStyle === 'gradient'">
      <div class="hero__split">
        <div class="hero__split-content">
          <p v-if="data.subheadline" class="hero__eyebrow">{{ data.subheadline }}</p>
          <h1 class="hero__headline">{{ data.headline }}</h1>
          <div class="hero__ctas">
            <button class="hero__btn hero__btn--primary">{{ data.primaryCta }}</button>
            <button v-if="data.secondaryCta" class="hero__btn hero__btn--ghost">
              {{ data.secondaryCta }}
            </button>
          </div>
        </div>
        <div v-if="data.phone" class="hero__phone-chip">
          <div class="hero__phone-label">Call Anytime</div>
          <div class="hero__phone-number">{{ data.phone }}</div>
          <div class="hero__phone-sub">24/7 Emergency Service</div>
        </div>
      </div>
    </template>

    <!-- Professional style: left-aligned serif / corporate heading stack -->
    <template v-else-if="backgroundStyle === 'professional'">
      <div class="hero__pro">
        <div class="hero__pro-rule"></div>
        <h1 class="hero__headline hero__headline--pro">{{ data.headline }}</h1>
        <p v-if="data.subheadline" class="hero__subtitle--pro">{{ data.subheadline }}</p>
        <div class="hero__ctas hero__ctas--pro">
          <button class="hero__btn hero__btn--primary">{{ data.primaryCta }}</button>
          <button v-if="data.secondaryCta" class="hero__btn hero__btn--outline-light">
            {{ data.secondaryCta }}
          </button>
        </div>
      </div>
    </template>

    <!-- Default/image style: centered with visual placeholder panel -->
    <template v-else>
      <div class="hero__default">
        <div class="hero__default-content">
          <h1 class="hero__headline">{{ data.headline }}</h1>
          <p v-if="data.subheadline" class="hero__subheadline">{{ data.subheadline }}</p>
          <div class="hero__ctas">
            <button class="hero__btn hero__btn--primary">{{ data.primaryCta }}</button>
            <button v-if="data.secondaryCta" class="hero__btn hero__btn--ghost">
              {{ data.secondaryCta }}
            </button>
          </div>
          <p v-if="data.phone" class="hero__phone-inline">{{ data.phone }}</p>
        </div>
        <div class="hero__image-panel">
          <div class="hero__image-glow"></div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface HeroData {
  headline: string;
  subheadline?: string;
  primaryCta: string;
  secondaryCta?: string;
  phone?: string;
  backgroundStyle?: 'gradient' | 'professional' | 'image';
}

const props = defineProps<{
  data: HeroData;
  viewMode: 'desktop' | 'mobile';
}>();

const backgroundStyle = computed(() => props.data.backgroundStyle ?? 'image');
</script>

<style scoped>
/* ===== BASE ===== */
.show-sect--hero {
  padding: 0;
  position: relative;
  overflow: hidden;
  color: var(--color-white);
}

/* ===== GRADIENT VARIANT (trade / local services) ===== */
.hero--gradient {
  background: linear-gradient(
    135deg,
    var(--showcase-primary) 0%,
    color-mix(in srgb, var(--showcase-primary) 68%, black) 100%
  );
  padding: var(--space-xl) var(--space-lg);
}

.hero__split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.hero--mobile .hero__split {
  flex-direction: column;
  text-align: center;
}

.hero__split-content {
  flex: 1;
  min-width: 0;
}

.hero__eyebrow {
  font-size: 0.72em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--showcase-accent);
  margin: 0 0 var(--space-sm) 0;
  opacity: 0.95;
}

.hero__phone-chip {
  flex-shrink: 0;
  background: color-mix(in srgb, var(--showcase-accent) 18%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--showcase-accent) 55%, transparent);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  text-align: center;
  min-width: 130px;
}

.hero--mobile .hero__phone-chip {
  width: 100%;
}

.hero__phone-label {
  font-size: 0.62em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--showcase-accent);
  margin-bottom: 4px;
}

.hero__phone-number {
  font-size: 1.05em;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-white);
}

.hero__phone-sub {
  font-size: 0.6em;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 3px;
}

/* ===== PROFESSIONAL VARIANT (law / formal) ===== */
.hero--professional {
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--showcase-primary) 94%, black) 0%,
    color-mix(in srgb, var(--showcase-primary) 60%, black) 100%
  );
  padding: var(--space-2xl) var(--space-lg);
}

.hero__pro {
  max-width: 580px;
}

.hero--mobile .hero__pro {
  max-width: 100%;
}

.hero__pro-rule {
  width: 40px;
  height: 3px;
  background: var(--showcase-secondary, var(--showcase-accent));
  margin-bottom: var(--space-md);
  border-radius: 2px;
}

.hero__headline--pro {
  font-family: var(--sf-heading), Georgia, 'Times New Roman', serif;
  font-size: 1.9em;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin: 0 0 var(--space-md) 0;
  color: var(--color-white);
}

.hero--mobile .hero__headline--pro {
  font-size: 1.5em;
}

.hero__subtitle--pro {
  font-size: 0.875em;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0 0 var(--space-lg) 0;
  font-style: italic;
}

.hero__ctas--pro {
  gap: var(--space-sm);
}

/* ===== DEFAULT / IMAGE VARIANT ===== */
.hero--image {
  background: linear-gradient(
    135deg,
    var(--showcase-primary) 0%,
    color-mix(in srgb, var(--showcase-primary) 75%, black) 100%
  );
}

.hero__default {
  display: flex;
  min-height: 160px;
}

.hero--mobile .hero__default {
  flex-direction: column;
  min-height: auto;
}

.hero__default-content {
  flex: 1;
  padding: var(--space-xl) var(--space-lg);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero--mobile .hero__default-content {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
}

.hero__image-panel {
  width: 38%;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--showcase-secondary, var(--showcase-accent)) 28%, transparent);
  position: relative;
  overflow: hidden;
  clip-path: polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.hero--mobile .hero__image-panel {
  display: none;
}

.hero__image-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 60% 40%,
    color-mix(in srgb, var(--showcase-accent) 40%, transparent) 0%,
    transparent 70%
  );
}

/* ===== SHARED TEXT ===== */
.hero__headline {
  font-size: 1.65em;
  font-weight: 700;
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-white);
}

.hero--mobile .hero__headline {
  font-size: 1.3em;
}

.hero__subheadline {
  font-size: 0.875em;
  opacity: 0.85;
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.55;
  color: var(--color-white);
}

.hero__phone-inline {
  margin: var(--space-sm) 0 0 0;
  font-size: 0.8em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== SHARED CTAS ===== */
.hero__ctas {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.hero--mobile .hero__ctas { justify-content: center; }

.hero__btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.85em;
  cursor: pointer;
  border: none;
  transition: filter 0.15s ease;
}

.hero__btn--primary {
  background: var(--showcase-accent);
  color: var(--showcase-primary);
}

.hero__btn--ghost {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-white);
  border: 1.5px solid rgba(255, 255, 255, 0.38);
}

.hero__btn--outline-light {
  background: transparent;
  color: rgba(255, 255, 255, 0.88);
  border: 1.5px solid rgba(255, 255, 255, 0.35);
}
</style>
