<template>
  <section class="show-sect show-sect--testimonials">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>

      <!-- Featured first quote when 3+ testimonials -->
      <div v-if="featuredItem" class="testimonials__featured">
        <div class="testimonials__quote-mark" aria-hidden="true">"</div>
        <div class="testimonials__stars">
          <svg
            v-for="star in (featuredItem.rating ?? 5)"
            :key="star"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="testimonials__star"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <p class="testimonials__featured-quote">"{{ featuredItem.quote }}"</p>
        <p class="testimonials__featured-author">
          <span class="testimonials__dot" aria-hidden="true"></span>
          {{ featuredItem.author }}
          <span v-if="featuredItem.location" class="testimonials__location">, {{ featuredItem.location }}</span>
        </p>
      </div>

      <!-- Secondary testimonials grid -->
      <div v-if="secondaryItems.length" class="testimonials__grid">
        <div v-for="(item, i) in secondaryItems" :key="i" class="testimonials__card">
          <div class="testimonials__stars">
            <svg
              v-for="star in (item.rating ?? 5)"
              :key="star"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="testimonials__star"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <p class="testimonials__quote">"{{ item.quote }}"</p>
          <p class="testimonials__author">
            <span class="testimonials__dot" aria-hidden="true"></span>
            {{ item.author }}
            <span v-if="item.location" class="testimonials__location">, {{ item.location }}</span>
          </p>
        </div>
      </div>

      <!-- When only 1-2 testimonials: show them all as cards -->
      <div v-if="!featuredItem" class="testimonials__grid">
        <div v-for="(item, i) in data.items" :key="i" class="testimonials__card">
          <div class="testimonials__stars">
            <svg
              v-for="star in (item.rating ?? 5)"
              :key="star"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="testimonials__star"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <p class="testimonials__quote">"{{ item.quote }}"</p>
          <p class="testimonials__author">
            <span class="testimonials__dot" aria-hidden="true"></span>
            {{ item.author }}
            <span v-if="item.location" class="testimonials__location">, {{ item.location }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TestimonialItem {
  quote: string;
  author: string;
  location?: string;
  rating?: number;
}

interface TestimonialsData {
  title?: string;
  items: TestimonialItem[];
}

const props = defineProps<{
  data: TestimonialsData;
  viewMode: 'desktop' | 'mobile';
}>();

const featuredItem = computed(() =>
  props.data.items.length >= 3 ? props.data.items[0] : null
);

const secondaryItems = computed(() =>
  props.data.items.length >= 3 ? props.data.items.slice(1) : []
);
</script>

<style scoped>
.show-sect--testimonials {
  background: color-mix(in srgb, var(--showcase-primary) 4%, var(--showcase-bg));
}

/* Stars */
.testimonials__stars {
  display: flex;
  gap: 2px;
  margin-bottom: var(--space-sm);
}

.testimonials__star {
  width: 13px;
  height: 13px;
  color: #f59e0b;
  flex-shrink: 0;
}

/* Featured large quote */
.testimonials__featured {
  position: relative;
  padding: var(--space-lg) var(--space-lg) var(--space-lg) var(--space-2xl);
  background: var(--showcase-bg);
  border-left: 4px solid var(--showcase-accent);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  margin-bottom: var(--space-md);
  overflow: hidden;
}

.testimonials__quote-mark {
  position: absolute;
  top: -8px;
  left: var(--space-md);
  font-size: 5em;
  font-family: var(--sf-heading), Georgia, serif;
  font-weight: 700;
  color: color-mix(in srgb, var(--showcase-primary) 10%, transparent);
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.testimonials__featured-quote {
  font-size: 0.95em;
  font-style: italic;
  line-height: 1.65;
  color: var(--showcase-text);
  margin: 0 0 var(--space-sm) 0;
  position: relative;
}

.testimonials__featured-author {
  font-size: 0.8em;
  font-weight: 700;
  color: color-mix(in srgb, var(--showcase-text) 65%, var(--showcase-bg));
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

/* Grid of secondary / all cards */
.testimonials__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.testimonials__card {
  padding: var(--space-md);
  background: var(--showcase-bg);
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 12%, transparent);
  border-left: 3px solid var(--showcase-accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.testimonials__quote {
  font-size: 0.85em;
  font-style: italic;
  margin: 0 0 var(--space-sm) 0;
  color: var(--showcase-text);
  line-height: 1.55;
}

.testimonials__author {
  font-size: 0.775em;
  font-weight: 700;
  color: color-mix(in srgb, var(--showcase-text) 58%, var(--showcase-bg));
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.testimonials__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--showcase-accent);
  flex-shrink: 0;
}

.testimonials__location {
  font-weight: 400;
}
</style>
