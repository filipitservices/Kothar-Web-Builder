<template>
  <section class="showcase-section showcase-section--gallery">
    <div class="showcase-section__inner">
      <h2 v-if="data.title" class="showcase-section__title">{{ data.title }}</h2>
      <div v-if="data.categories" class="gallery__categories">
        <span v-for="cat in data.categories" :key="cat" class="gallery__category">{{ cat }}</span>
      </div>
      <div class="gallery__grid" :class="{ 'gallery__grid--mobile': viewMode === 'mobile' }">
        <div v-for="(image, i) in galleryItems" :key="i" class="gallery__item">
          <div class="gallery__placeholder showcase-placeholder"></div>
          <p v-if="getCaption(image)" class="gallery__caption">{{ getCaption(image) }}</p>
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

const galleryItems = computed(() => {
  const items = props.data.images || props.data.projects || 6;
  if (typeof items === 'number') {
    return Array.from({ length: items }, (_, i) => i);
  }
  return items;
});

const getCaption = (image: unknown): string | null => {
  if (typeof image === 'object' && image !== null) {
    const img = image as GalleryImage;
    return img.caption || img.name || null;
  }
  return null;
};
</script>

<style scoped>
.gallery__categories {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.gallery__category {
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.75em;
  color: #6b7280;
}

.gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery__grid--mobile {
  grid-template-columns: repeat(2, 1fr);
}

.gallery__item {
  aspect-ratio: 1;
  position: relative;
}

.gallery__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.gallery__caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.65em;
  margin: 0;
  border-radius: 0 0 6px 6px;
}
</style>
