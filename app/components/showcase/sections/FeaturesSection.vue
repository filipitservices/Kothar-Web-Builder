<template>
  <section class="showcase-section showcase-section--features">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <div class="features__grid">
        <div v-for="feature in data.items" :key="feature.title" class="features__item">
          <h3 class="features__title">{{ feature.title }}</h3>
          <p class="features__description">{{ feature.description }}</p>
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
.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.features__item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.features__title {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--showcase-primary);
}

.features__description {
  font-size: 0.8em;
  color: #6b7280;
  margin: 0;
}
</style>
