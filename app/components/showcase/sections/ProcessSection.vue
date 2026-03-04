<template>
  <section class="show-sect show-sect--process">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="process__steps">
        <div v-for="step in data.steps" :key="step.number" class="process__step">
          <div class="process__number">{{ step.number }}</div>
          <div class="process__content">
            <h3 class="process__title">{{ step.title }}</h3>
            <p class="process__description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

interface ProcessData {
  title?: string;
  steps: ProcessStep[];
}

defineProps<{
  data: ProcessData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.process__steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.process__step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.process__number {
  width: 32px;
  height: 32px;
  background: var(--showcase-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9em;
  flex-shrink: 0;
}

.process__content {
  flex: 1;
}

.process__title {
  font-size: 0.95em;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.process__description {
  font-size: 0.8em;
  color: #6b7280;
  margin: 0;
}
</style>
