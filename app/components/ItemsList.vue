<template>
  <draggable
    :class="['list-group', renderMode === 'preview' ? 'list-group--preview' : 'list-group--canvas']"
    :list="items"
    :group="group"
    @change="handleDraggableChange"
    item-key="id"
    :disabled="disabled"
    :clone="cloneItem"
  >
    <template #item="{ element }">
      <div>
        <!-- Preview Mode: Sidebar Display -->
        <div v-if="renderMode === 'preview'" class="list-group-item">
          <div class="item-label">{{ element.label }}</div>
          <div class="item-type">{{ element.type }}</div>
        </div>

        <!-- Canvas Mode: Rendered Components -->
        <div v-else class="canvas-block" :data-type="element.type" :class="{ 'mobile-layout': screenType === 'mobile' }">
          <button class="delete-btn" @click.stop="emit('remove', element.id)" title="Remove element">×</button>
          
          <!-- Dynamic component rendering with blockId -->
          <component 
            :is="getComponent(element.type)" 
            :block-id="element.id"
            :screen-type="screenType" 
          />
        </div>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { defineAsyncComponent } from 'vue';
import type { BlockItem, BlockType } from '~/types/builder';

type ScreenType = 'desktop' | 'mobile';

interface DraggableGroup {
  name: string;
  pull?: 'clone' | 'cut' | true | false;
  put?: boolean | string[];
}

interface ItemsListProps {
  items: BlockItem[];
  group: DraggableGroup;
  disabled?: boolean;
  renderMode?: 'preview' | 'canvas';
  screenType?: ScreenType;
}

const props = withDefaults(defineProps<ItemsListProps>(), {
  disabled: false,
  renderMode: 'preview',
  screenType: 'desktop'
});

interface ItemsListEmits {
  change: [value: BlockItem[]];
  remove: [id: string];
}

const emit = defineEmits<ItemsListEmits>();

// Async component imports for better code splitting
const BLOCK_COMPONENTS = {
  hero: () => import('./BlockElements/HeroBlock.vue'),
  navbar: () => import('./BlockElements/NavBlock.vue'),
  footer: () => import('./BlockElements/FooterBlock.vue'),
  cta: () => import('./BlockElements/CtaBlock.vue'),
  features: () => import('./BlockElements/FeaturesBlock.vue'),
  services: () => import('./BlockElements/ServicesBlock.vue'),
  team: () => import('./BlockElements/TeamBlock.vue'),
  process: () => import('./BlockElements/ProcessBlock.vue'),
  testimonial: () => import('./BlockElements/TestimonialBlock.vue'),
  logos: () => import('./BlockElements/LogosBlock.vue'),
  credentials: () => import('./BlockElements/CredentialsBlock.vue'),
  location: () => import('./BlockElements/LocationBlock.vue'),
  faq: () => import('./BlockElements/FaqBlock.vue'),
  pricing: () => import('./BlockElements/PricingBlock.vue'),
  form: () => import('./BlockElements/FormBlock.vue'),
  stats: () => import('./BlockElements/StatsBlock.vue'),
  gallery: () => import('./BlockElements/GalleryBlock.vue'),
  text: () => import('./BlockElements/TextBlock.vue')
} as const satisfies Record<BlockType, () => Promise<any>>;

const getComponent = (type: BlockType) => {
  const loader = BLOCK_COMPONENTS[type];
  if (!loader) {
    console.warn(`Unknown block type: ${type}`);
    return null;
  }
  return defineAsyncComponent(() => loader() as any);
};

/**
 * Handle draggable change event
 * Normalizes Sortable.js event to emit array of items
 */
const handleDraggableChange = () => {
  // When items change, emit the updated array
  emit('change', props.items);
};

/**
 * Generate unique ID for cloned items
 */
const cloneItem = (original: BlockItem): BlockItem => ({
  ...original,
  id: `${original.type}-${crypto.randomUUID()}`
});
</script>

<style scoped>
.list-group {
  list-style: none;
  padding: 0;
  margin: 0;
  min-height: 0;
}

.list-group--canvas {
  height: 100%;
}

.list-group--preview {
  height: auto;
}

.list-group-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px 12px;
  margin: 6px;
  border-radius: 6px;
  cursor: move;
  transition: all 0.2s ease;
  font-weight: 600;
  color: #222;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-weight: 700;
}

.item-type {
  font-size: 11px;
  color: #667;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.list-group-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.list-group-item:active {
  opacity: 0.85;
  background: #dee2e6;
}

.canvas-block {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  box-shadow: none;
  cursor: grab;
  transition: transform 0.15s ease;
  position: relative;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
}

/* Avoid double borders when stacked */
.canvas-block + .canvas-block {
  border-top: none;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 10;
}

.canvas-block:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  transform: scale(1.05);
}
</style>
