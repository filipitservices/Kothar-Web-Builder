<template>
  <section class="show-sect show-sect--gallery">
    <div class="show-sect__inner">
      <h2 v-if="data.title" class="show-sect__title">{{ data.title }}</h2>

      <div v-if="data.categories?.length" class="gallery__categories">
        <span v-for="cat in data.categories" :key="cat" class="gallery__category">{{ cat }}</span>
      </div>

      <div
        class="gallery__grid"
        :class="[
          `gallery__grid--${gridVariant}`,
          viewMode === 'mobile' && 'gallery__grid--mobile'
        ]"
      >
        <div
          v-for="(item, i) in galleryItems"
          :key="i"
          class="gallery__item"
          :class="i === 0 && 'gallery__item--featured'"
        >
          <div class="gallery__placeholder"></div>
          <p v-if="getCaption(item)" class="gallery__caption">{{ getCaption(item) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface GalleryImage {
  caption?: string;
  name?: string;
  category?: string;
}

interface GalleryData {
  title?: string;
  categories?: string[];
  images?: GalleryImage[] | number;
  projects?: GalleryImage[] | number;
}

const props = defineProps<{
  data: GalleryData;
  viewMode: 'desktop' | 'mobile';
}>();

const galleryItems = computed<(GalleryImage | number)[]>(() => {
  const raw = props.data.images ?? props.data.projects ?? 6;
  if (typeof raw === 'number') {
    return Array.from({ length: raw }, (_, i) => i);
  }
  return raw;
});

const gridVariant = computed(() => {
  const count = galleryItems.value.length;
  if (count <= 3) return 'sm';
  if (count <= 6) return 'md';
  return 'lg';
});

function getCaption(item: GalleryImage | number): string | null {
  if (typeof item === 'number') return null;
  return item.caption ?? item.name ?? null;
}
</script>

<style scoped>
.show-sect--gallery {
  background: var(--showcase-bg);
}

/* Category pills */
.gallery__categories {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.gallery__category {
  padding: 3px var(--space-sm);
  background: color-mix(in srgb, var(--showcase-primary) 10%, var(--showcase-bg));
  border: 1px solid color-mix(in srgb, var(--showcase-primary) 20%, transparent);
  border-radius: var(--radius-xl);
  font-size: 0.72em;
  font-weight: 600;
  color: var(--showcase-primary);
}

/* Grids */
.gallery__grid {
  display: grid;
  gap: var(--space-sm);
}

/* sm: 3 items → equal columns */
.gallery__grid--sm {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
}

/* md / lg: featured first item spans 2 rows */
.gallery__grid--md {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 80px 80px;
}

.gallery__grid--lg {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 70px 70px;
}

.gallery__grid--mobile {
  grid-template-columns: repeat(2, 1fr) !important;
  grid-template-rows: auto !important;
}

.gallery__item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.gallery__item--featured:not(.gallery__grid--mobile .gallery__item--featured) {
  grid-row: 1 / 3;
  grid-column: 1 / 2;
}

.gallery__grid--sm .gallery__item {
  aspect-ratio: 4 / 3;
}

/* Placeholder with themed gradient */
.gallery__placeholder {
  width: 100%;
  height: 100%;
  min-height: 70px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--showcase-primary) 22%, var(--showcase-bg)) 0%,
    color-mix(in srgb, var(--showcase-accent) 28%, var(--showcase-bg)) 100%
  );
}

.gallery__item--featured .gallery__placeholder {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--showcase-primary) 35%, var(--showcase-bg)) 0%,
    color-mix(in srgb, var(--showcase-secondary, var(--showcase-accent)) 38%, var(--showcase-bg)) 100%
  );
}

.gallery__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px var(--space-sm);
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.55) 0%,
    transparent 100%
  );
  color: var(--color-white);
  font-size: 0.62em;
  font-weight: 500;
  margin: 0;
}
</style>
