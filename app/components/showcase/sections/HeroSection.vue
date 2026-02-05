<template>
  <section class="showcase-section showcase-section--hero">
    <div class="hero__inner">
      <div class="hero__content">
        <h1 class="hero__headline">{{ data.headline }}</h1>
        <p class="hero__subheadline">{{ data.subheadline }}</p>
        <div class="hero__ctas">
          <button class="showcase-btn showcase-btn--primary">{{ data.primaryCta }}</button>
          <button v-if="data.secondaryCta" class="showcase-btn showcase-btn--secondary">
            {{ data.secondaryCta }}
          </button>
        </div>
        <p v-if="data.phone" class="hero__phone">{{ data.phone }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface HeroData {
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta?: string;
  phone?: string;
}

defineProps<{
  data: HeroData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.showcase-section--hero {
  background: linear-gradient(135deg, var(--showcase-primary), color-mix(in srgb, var(--showcase-primary) 70%, black));
  color: #fff;
  padding: 48px 16px;
  text-align: center;
}

.hero__inner {
  max-width: 100%;
}

.hero__headline {
  font-size: 1.75em;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.view-mobile .hero__headline {
  font-size: 1.4em;
}

.hero__subheadline {
  font-size: 0.9em;
  opacity: 0.9;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.hero__ctas {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero__phone {
  margin: 12px 0 0 0;
  font-size: 0.85em;
  opacity: 0.9;
}
</style>
