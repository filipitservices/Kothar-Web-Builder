<template>
  <section class="show-sect show-sect--faq">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="faq__list">
        <div v-for="(item, i) in data.items" :key="i" class="faq__item">
          <h3 class="faq__question">{{ item.question }}</h3>
          <p class="faq__answer">{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  title?: string;
  items: FaqItem[];
}

defineProps<{
  data: FaqData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.faq__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq__item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.faq__question {
  font-size: 0.9em;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.faq__answer {
  font-size: 0.8em;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}
</style>
