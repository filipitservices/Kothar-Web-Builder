<template>
  <section class="show-sect show-sect--process">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="process__steps" :class="{ 'process__steps--mobile': viewMode === 'mobile' }">
        <div
          v-for="(step, i) in data.steps"
          :key="step.number"
          class="process__step"
          :class="{ 'process__step--last': i === data.steps.length - 1 }"
        >
          <div class="process__number-col">
            <div class="process__number">{{ step.number }}</div>
            <div v-if="i < data.steps.length - 1" class="process__connector" aria-hidden="true"></div>
          </div>
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
  number: number | string;
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
.show-sect--process {
  background: color-mix(in srgb, var(--showcase-primary) 5%, var(--showcase-bg));
}

.process__steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.process__step {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.process__number-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.process__number {
  width: 36px;
  height: 36px;
  background: var(--showcase-accent);
  color: var(--showcase-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875em;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.process__connector {
  flex: 1;
  width: 2px;
  min-height: 24px;
  margin: 4px 0;
  background: repeating-linear-gradient(
    to bottom,
    color-mix(in srgb, var(--showcase-primary) 28%, transparent) 0,
    color-mix(in srgb, var(--showcase-primary) 28%, transparent) 4px,
    transparent 4px,
    transparent 8px
  );
}

.process__content {
  flex: 1;
  padding-bottom: var(--space-lg);
}

.process__step--last .process__content {
  padding-bottom: 0;
}

.process__title {
  font-size: 0.9em;
  font-weight: 700;
  margin: 4px 0 3px 0;
  color: var(--showcase-text);
  line-height: 1.3;
}

.process__description {
  font-size: 0.775em;
  color: color-mix(in srgb, var(--showcase-text) 60%, var(--showcase-bg));
  margin: 0;
  line-height: 1.5;
}
</style>
