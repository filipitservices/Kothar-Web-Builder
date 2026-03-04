<template>
  <section class="show-sect show-sect--stats">
    <div class="show-sect__inner">
      <div class="stats__grid">
        <div v-for="stat in data.items" :key="stat.label" class="stats__item">
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
  background: var(--showcase-primary);
  color: #fff;
  padding: 24px 16px;
}

.stats__grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 16px;
}

.stats__item {
  text-align: center;
}

.stats__value {
  font-size: 1.75em;
  font-weight: 700;
}

.stats__label {
  font-size: 0.75em;
  opacity: 0.9;
}
</style>
