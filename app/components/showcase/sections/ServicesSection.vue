<template>
  <section class="show-sect show-sect--services">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="show-sect__subtitle">{{ data.subtitle }}</p>
      <div class="services__grid" :class="{ 'services__grid--mobile': viewMode === 'mobile' }">
        <div v-for="service in data.items" :key="service.name" class="services__card show-card">
          <div class="services__icon show-icon show-icon--lg show-icon--primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="services__name">{{ service.name }}</h3>
          <p class="services__description">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ServiceItem {
  name: string;
  description: string;
}

interface ServicesData {
  title?: string;
  subtitle?: string;
  items: ServiceItem[];
}

defineProps<{
  data: ServicesData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.services__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.services__grid--mobile {
  grid-template-columns: 1fr 1fr;
}

.services__card {
  text-align: center;
}

.services__icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  color: var(--showcase-primary);
}

.services__icon svg {
  width: 100%;
  height: 100%;
}

.services__name {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--showcase-text);
}

.services__description {
  font-size: 0.75em;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}
</style>
