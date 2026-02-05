<template>
  <section class="showcase-section showcase-section--testimonials">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <div class="testimonials__grid">
        <div v-for="(testimonial, i) in data.items" :key="i" class="testimonials__card showcase-card">
          <div class="testimonials__stars">
            <svg 
              v-for="star in (testimonial.rating || 5)" 
              :key="star" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              class="showcase-icon showcase-icon--sm showcase-icon--star"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <p class="testimonials__quote">"{{ testimonial.quote }}"</p>
          <p class="testimonials__author">
            — {{ testimonial.author }}
            <span v-if="testimonial.location">, {{ testimonial.location }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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

defineProps<{
  data: TestimonialsData;
  viewMode: 'desktop' | 'mobile';
}>();
</script>

<style scoped>
.testimonials__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.testimonials__stars {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.testimonials__quote {
  font-size: 0.9em;
  font-style: italic;
  margin: 0 0 8px 0;
  color: var(--showcase-text);
  line-height: 1.5;
}

.testimonials__author {
  font-size: 0.8em;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
}
</style>
