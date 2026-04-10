<template>
  <section class="show-sect show-sect--services">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="show-sect__subtitle">{{ data.subtitle }}</p>
      <div
        class="services__grid"
        :class="[
          `services__grid--${gridClass}`,
          viewMode === 'mobile' && 'services__grid--mobile'
        ]"
      >
        <div
          v-for="service in data.items"
          :key="service.name"
          class="services__card"
        >
          <div class="services__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="services__icon">
              <path v-if="service.icon === 'emergency'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path v-else-if="service.icon === 'drain'" stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7M19 15l-7 7-7-7"/>
              <path v-else-if="service.icon === 'heater'" stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
              <path v-else-if="service.icon === 'pipe'" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7"/>
              <path v-else-if="service.icon === 'bathroom'" stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 10V8a2 2 0 012-2h14a2 2 0 012 2v2M3 10l1 10h16l1-10"/>
              <path v-else-if="service.icon === 'commercial'" stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              <path v-else-if="service.icon === 'panel'" stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
              <path v-else-if="service.icon === 'wiring'" stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              <path v-else-if="service.icon === 'light'" stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              <path v-else-if="service.icon === 'generator'" stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              <path v-else-if="service.icon === 'ev'" stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7zM5 3v2M19 3v2M5 19v2M19 19v2"/>
              <path v-else-if="service.icon === 'safety'" stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              <!-- fallback icon -->
              <template v-else>
                <circle cx="12" cy="12" r="9"/>
                <path stroke-linecap="round" d="M12 8v4l2.5 2.5"/>
              </template>
            </svg>
          </div>
          <div class="services__text">
            <h3 class="services__name">{{ service.name }}</h3>
            <p class="services__description">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ServiceItem {
  name: string;
  description: string;
  icon?: string;
}

interface ServicesData {
  title?: string;
  subtitle?: string;
  items: ServiceItem[];
}

const props = defineProps<{
  data: ServicesData;
  viewMode: 'desktop' | 'mobile';
}>();

const gridClass = computed(() => {
  const count = props.data.items.length;
  if (count <= 3) return 'cols3';
  if (count === 4) return 'cols4';
  return 'cols3'; // 6 items → 3×2
});
</script>

<style scoped>
.show-sect--services {
  background: var(--showcase-bg);
}

.services__grid {
  display: grid;
  gap: var(--space-md);
}

.services__grid--cols3 {
  grid-template-columns: repeat(3, 1fr);
}

.services__grid--cols4 {
  grid-template-columns: repeat(4, 1fr);
}

.services__grid--mobile,
.services__grid--cols4.services__grid--mobile {
  grid-template-columns: repeat(2, 1fr);
}

.services__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--showcase-bg);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 14%, transparent);
  border-left: 3px solid var(--showcase-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.services__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--showcase-primary) 11%, var(--showcase-bg));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.services__icon {
  width: 18px;
  height: 18px;
  color: var(--showcase-primary);
}

.services__text {
  flex: 1;
}

.services__name {
  font-size: 0.875em;
  font-weight: 700;
  margin: 0 0 3px 0;
  color: var(--showcase-text);
  line-height: 1.3;
}

.services__description {
  font-size: 0.75em;
  color: color-mix(in srgb, var(--showcase-text) 60%, var(--showcase-bg));
  margin: 0;
  line-height: 1.45;
}
</style>
