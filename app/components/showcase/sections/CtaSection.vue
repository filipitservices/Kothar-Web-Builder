<template>
  <section class="showcase-section showcase-section--cta">
    <div class="showcase-section__inner">
      <h2 class="cta__headline">{{ data.headline }}</h2>
      <p v-if="data.subheadline" class="cta__subheadline">{{ data.subheadline }}</p>
      <button class="showcase-btn showcase-btn--primary showcase-btn--large">
        {{ data.primaryCta }}
      </button>
      <p v-if="data.phone" class="cta__phone">Or call: {{ data.phone }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CtaData {
  headline: string;
  subheadline?: string;
  primaryCta: string;
  phone?: string;
}

defineProps<{
  data: CtaData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.showcase-section--cta {
  background: linear-gradient(135deg, var(--showcase-primary), color-mix(in srgb, var(--showcase-primary) 70%, black));
  color: #fff;
  text-align: center;
  padding: 40px 16px;
}

.cta__headline {
  font-size: 1.4em;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.cta__subheadline {
  font-size: 0.9em;
  opacity: 0.9;
  margin: 0 0 16px 0;
}

.cta__phone {
  margin: 12px 0 0 0;
  font-size: 0.85em;
  opacity: 0.9;
}
</style>
