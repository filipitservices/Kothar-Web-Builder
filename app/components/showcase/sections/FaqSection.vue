<template>
  <section class="show-sect show-sect--faq">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>
      <div class="faq__list">
        <div v-for="(item, i) in data.items" :key="i" class="faq__item">
          <div class="faq__header">
            <svg viewBox="0 0 20 20" fill="currentColor" class="faq__icon">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            <h3 class="faq__question">{{ item.question }}</h3>
          </div>
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
.show-sect--faq {
  background: var(--showcase-bg);
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq__item {
  padding: var(--space-md) var(--space-md) var(--space-md) var(--space-lg);
  border-left: 3px solid var(--showcase-primary);
  border-bottom: 1px solid color-mix(in srgb, var(--showcase-primary) 10%, transparent);
  background: var(--showcase-bg);
  transition: background 0.15s ease;
}

.faq__item:first-child {
  border-top: 1px solid color-mix(in srgb, var(--showcase-primary) 10%, transparent);
}

.faq__item:last-child {
  border-bottom: 1px solid color-mix(in srgb, var(--showcase-primary) 10%, transparent);
}

.faq__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.faq__icon {
  width: 15px;
  height: 15px;
  color: var(--showcase-accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.faq__question {
  font-size: 0.875em;
  font-weight: 700;
  margin: 0;
  color: var(--showcase-primary);
  line-height: 1.3;
}

.faq__answer {
  font-size: 0.78em;
  color: color-mix(in srgb, var(--showcase-text) 65%, var(--showcase-bg));
  margin: 0;
  line-height: 1.55;
  padding-left: calc(15px + var(--space-sm));
}
</style>
