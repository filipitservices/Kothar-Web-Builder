<template>
  <section class="showcase-section showcase-section--about">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <p class="about__content">{{ data.content }}</p>
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
.about__content {
  font-size: 0.9em;
  line-height: 1.7;
  text-align: center;
  margin: 0;
}
</style>
