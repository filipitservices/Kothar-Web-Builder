<template>
  <section class="show-sect show-sect--about">
    <div class="show-sect__inner">
      <div class="about__card">
        <h2 v-if="data.title" class="about__title">{{ data.title }}</h2>
        <p class="about__content">{{ data.content }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface AboutData {
  title?: string;
  content: string;
}

defineProps<{
  data: AboutData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.show-sect--about {
  background: color-mix(in srgb, var(--showcase-secondary, var(--showcase-primary)) 6%, var(--showcase-bg));
}

.about__card {
  border-left: 4px solid var(--showcase-accent);
  padding-left: var(--space-lg);
  max-width: 680px;
  margin: 0 auto;
}

.about__title {
  font-size: 1.2em;
  font-weight: 700;
  color: var(--showcase-primary);
  margin: 0 0 var(--space-sm) 0;
}

.about__content {
  font-size: 0.9em;
  line-height: 1.8;
  color: color-mix(in srgb, var(--showcase-text) 82%, var(--showcase-bg));
  margin: 0;
}
</style>
