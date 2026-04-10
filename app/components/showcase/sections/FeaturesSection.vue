<template>
  <section class="show-sect show-sect--features">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="features__list">
        <div v-for="feature in data.items" :key="feature.title" class="features__item">
          <div class="features__check">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="features__body">
            <h3 class="features__title">{{ feature.title }}</h3>
            <p class="features__description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FeatureItem {
  title: string;
  description: string;
}

interface FeaturesData {
  title?: string;
  items: FeatureItem[];
}

defineProps<{
  data: FeaturesData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.show-sect--features {
  background: color-mix(in srgb, var(--showcase-primary) 5%, var(--showcase-bg));
}

.features__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: var(--space-md);
}

.features__item {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-start;
  padding: var(--space-md);
  background: var(--showcase-bg);
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 10%, transparent);
}

.features__check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--showcase-accent);
  color: var(--showcase-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.features__check svg {
  width: 12px;
  height: 12px;
}

.features__body {
  flex: 1;
  min-width: 0;
}

.features__title {
  font-size: 0.875em;
  font-weight: 700;
  margin: 0 0 3px 0;
  color: var(--showcase-primary);
  line-height: 1.3;
}

.features__description {
  font-size: 0.775em;
  color: color-mix(in srgb, var(--showcase-text) 65%, var(--showcase-bg));
  margin: 0;
  line-height: 1.45;
}
</style>
