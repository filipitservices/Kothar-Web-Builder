<template>
  <section class="show-sect show-sect--stats">
    <div class="show-sect__inner">
      <div class="stats__grid">
        <div
          v-for="(stat, i) in data.items"
          :key="stat.label"
          class="stats__item"
          :class="{ 'stats__item--divider': i < data.items.length - 1 }"
        >
          <div class="stats__value">{{ stat.value }}</div>
          <div class="stats__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface StatItem {
  value: string;
  label: string;
}

interface StatsData {
  items: StatItem[];
}

defineProps<{
  data: StatsData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.show-sect--stats {
  background: linear-gradient(
    135deg,
    var(--showcase-primary) 0%,
    color-mix(in srgb, var(--showcase-primary) 78%, black) 100%
  );
  color: var(--color-white);
  padding: var(--space-xl) var(--space-md);
}

.stats__grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.stats__item {
  text-align: center;
  position: relative;
  flex: 1;
  min-width: 80px;
}

.stats__item--divider::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background: rgba(255, 255, 255, 0.22);
}

.stats__value {
  font-size: 2.1em;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--showcase-accent);
}

.stats__label {
  font-size: 0.68em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
}
</style>
