<template>
  <nav ref="navRef" class="category-nav" @wheel.prevent="handleWheel">
    <div class="category-nav-all-wrapper">
      <button
        class="category-nav-btn"
        :class="{ 'is-active': selectedCategory === null }"
        @click="$emit('select', null)"
      >
        All
      </button>
      <div class="category-nav-divider"></div>
    </div>
    <button
      v-for="category in categories"
      :key="category"
      class="category-nav-btn"
      :class="{ 'is-active': selectedCategory === category }"
      @click="$emit('select', category)"
    >
      {{ getCategoryLabel(category) }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  getCategoryLabel: (category: string) => string;
}

const props = defineProps<CategoryNavProps>();

defineEmits<{
  select: [category: string | null];
}>();

const navRef = ref<HTMLElement | null>(null);

function centerActiveCategoryInNav(): void {
  const nav = navRef.value;
  if (!nav) return;
  const active = nav.querySelector('.category-nav-btn.is-active');
  if (!(active instanceof HTMLElement)) return;

  const navRect = nav.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const navCenterX = navRect.left + navRect.width / 2;
  const btnCenterX = activeRect.left + activeRect.width / 2;
  const delta = btnCenterX - navCenterX;
  if (Math.abs(delta) < 1) return;

  const targetScrollLeft = nav.scrollLeft + delta;
  const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
  const left = Math.max(0, Math.min(targetScrollLeft, maxScroll));
  nav.scrollTo({ left, behavior: 'smooth' });
}

watch(
  () => props.selectedCategory,
  async () => {
    await nextTick();
    requestAnimationFrame(() => {
      centerActiveCategoryInNav();
    });
  },
  { flush: 'post' }
);

const handleWheel = (event: WheelEvent) => {
  const nav = navRef.value;
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;
  
  const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
  nav.scrollLeft += delta;
};
</script>

<style scoped>
.category-nav {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.category-nav::-webkit-scrollbar {
  display: none;
}

.category-nav-all-wrapper {
  position: sticky;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  background: white;
  flex-shrink: 0;
  padding: 0 8px;
}

.category-nav-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
  flex-shrink: 0;
}

.category-nav-btn {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: #64748b;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.category-nav-btn:hover {
  color: #334155;
  background: rgba(30, 58, 138, 0.04);
}

.category-nav-btn.is-active {
  color: #1e3a8a;
  border-bottom-color: #1e3a8a;
  font-weight: 700;
}
</style>
