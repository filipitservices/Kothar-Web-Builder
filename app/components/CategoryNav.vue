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
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
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
  background: var(--color-bg);
  flex-shrink: 0;
  padding: 0 var(--space-sm);
}

.category-nav-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--color-border);
  margin: 0 var(--space-xs);
  flex-shrink: 0;
}

.category-nav-btn {
  padding: var(--space-sm) var(--space-sm);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  margin-left: var(--space-sm);
}

.category-nav-btn:hover {
  color: var(--color-text-muted-dark);
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-white));
}

.category-nav-btn.is-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 700;
}
</style>
