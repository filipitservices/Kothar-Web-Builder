<template>
  <section class="showcase-section showcase-section--pricing">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <div class="pricing__grid">
        <div 
          v-for="(plan, i) in data.items" 
          :key="i" 
          class="pricing__card showcase-card"
          :class="{ 'showcase-card--featured': i === 1 }"
        >
          <h3 class="pricing__name">{{ plan.name }}</h3>
          <div class="pricing__price">{{ plan.price }}</div>
          <p class="pricing__description">{{ plan.description }}</p>
          <button class="showcase-btn showcase-btn--outline">Select Plan</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface PricingPlan {
  name: string;
  price: string;
  description: string;
}

interface PricingData {
  title?: string;
  items: PricingPlan[];
}

defineProps<{
  data: PricingData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.pricing__card {
  text-align: center;
}

.pricing__name {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.pricing__price {
  font-size: 1.5em;
  font-weight: 700;
  color: var(--showcase-primary);
  margin-bottom: 8px;
}

.pricing__description {
  font-size: 0.75em;
  color: #6b7280;
  margin: 0 0 12px 0;
}
</style>
