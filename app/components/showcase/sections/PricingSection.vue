<template>
  <section class="show-sect show-sect--pricing">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="pricing__grid" :class="{ 'pricing__grid--mobile': viewMode === 'mobile' }">
        <div
          v-for="(plan, i) in data.items"
          :key="i"
          class="pricing__card"
          :class="{ 'pricing__card--featured': isFeatured(i, data.items.length) }"
        >
          <div v-if="isFeatured(i, data.items.length)" class="pricing__badge">Most Popular</div>
          <h3 class="pricing__name">{{ plan.name }}</h3>
          <div class="pricing__price">{{ plan.price }}</div>
          <p class="pricing__description">{{ plan.description }}</p>
          <button
            class="pricing__btn"
            :class="isFeatured(i, data.items.length) ? 'pricing__btn--accent' : 'pricing__btn--outline'"
          >
            Get Started
          </button>
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

function isFeatured(index: number, total: number): boolean {
  if (total <= 1) return true;
  if (total === 2) return index === 1;
  return index === Math.floor(total / 2);
}
</script>

<style scoped>
.show-sect--pricing {
  background: color-mix(in srgb, var(--showcase-primary) 4%, var(--showcase-bg));
}

.pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-md);
  align-items: end;
}

.pricing__grid--mobile {
  grid-template-columns: 1fr;
}

.pricing__card {
  position: relative;
  padding: var(--space-lg) var(--space-md);
  background: var(--showcase-bg);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 18%, transparent);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pricing__card--featured {
  background: var(--showcase-primary);
  border-color: var(--showcase-primary);
  padding-top: calc(var(--space-lg) + var(--space-xs));
  box-shadow: 0 4px 20px color-mix(in srgb, var(--showcase-primary) 30%, transparent);
}

.pricing__badge {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--showcase-accent);
  color: var(--showcase-primary);
  font-size: 0.62em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px var(--space-sm);
  border-radius: var(--radius-xl);
  white-space: nowrap;
}

.pricing__name {
  font-size: 0.875em;
  font-weight: 700;
  margin: 0;
  color: var(--showcase-text);
}

.pricing__card--featured .pricing__name {
  color: rgba(255, 255, 255, 0.9);
}

.pricing__price {
  font-size: 1.75em;
  font-weight: 700;
  color: var(--showcase-primary);
  line-height: 1;
  letter-spacing: -0.03em;
}

.pricing__card--featured .pricing__price {
  color: var(--showcase-accent);
}

.pricing__description {
  font-size: 0.72em;
  color: color-mix(in srgb, var(--showcase-text) 60%, var(--showcase-bg));
  margin: 0;
  line-height: 1.45;
  flex: 1;
}

.pricing__card--featured .pricing__description {
  color: rgba(255, 255, 255, 0.72);
}

.pricing__btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 0.8em;
  font-weight: 700;
  cursor: pointer;
  border: none;
  margin-top: var(--space-xs);
}

.pricing__btn--outline {
  background: transparent;
  border: 1.5px solid color-mix(in srgb, var(--showcase-primary) 38%, transparent);
  color: var(--showcase-primary);
}

.pricing__btn--accent {
  background: var(--showcase-accent);
  color: var(--showcase-primary);
}
</style>
