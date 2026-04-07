<template>
  <draggable
    v-model="internalItems"
    :class="['list-group', renderMode === 'preview' ? 'list-group--preview' : 'list-group--canvas']"
    :group="group"
    item-key="id"
    :disabled="disabled"
    :clone="cloneItem"
    :scroll="renderMode !== 'canvas'"
    @start="onSortableStart"
    @end="onSortableEnd"
  >
    <template #item="{ element }">
      <div>
        <!-- Preview Mode: Sidebar palette cards -->
        <div v-if="renderMode === 'preview'" class="available-item-card">
          <div class="available-item-card__inner">
            <span class="available-item-card__label">{{ element.label }}</span>
            <span class="available-item-card__type">{{ element.type }}</span>
          </div>
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
import { defineAsyncComponent, type Component, computed, type AsyncComponentLoader } from 'vue';
import type { BlockItem, BlockType } from '~/types/builder';
import { logger } from '~/utils/logger';

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
  /** Canvas: snapshot scroll before Sortable + Vue sync (Sortable AutoScroll off; see `scroll` prop). */
  'drag-start': [];
  /** Canvas: parent restores scroll after model/DOM settle. */
  'drag-end': [];
}

const emit = defineEmits<ItemsListEmits>();

// Bridge draggable's v-model to our parent-controlled items
const internalItems = computed<BlockItem[]>({
  get: () => props.items,
  set: (val) => {
    emit('change', val);
  },
});

// Async component imports for better code splitting.
// Each loader resolves to a Vue component that accepts the standard block props.
const BLOCK_COMPONENTS: Record<BlockType, AsyncComponentLoader<Component>> = {
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
} as const;

/**
 * Stable async component per block type. Calling defineAsyncComponent() inside the render
 * path produced a new constructor every render, so Vue tore down and remounted blocks on
 * every list update — resetting simulation scroll and feeling broken.
 */
const blockAsyncComponents: Partial<Record<BlockType, Component>> = {};

const getComponent = (type: BlockType): Component | null => {
  const existing = blockAsyncComponents[type];
  if (existing) {
    return existing;
  }
  const loader = BLOCK_COMPONENTS[type];
  if (!loader) {
    logger.warn(`Unknown block type: ${type}`);
    return null;
  }
  const comp = defineAsyncComponent(loader);
  blockAsyncComponents[type] = comp;
  return comp;
};

/**
 * Generate unique ID for cloned items
 */
const cloneItem = (original: BlockItem): BlockItem => ({
  ...original,
  id: `${original.type}-${crypto.randomUUID()}`
});

function onSortableStart(): void {
  if (props.renderMode === 'canvas') {
    emit('drag-start');
  }
}

function onSortableEnd(): void {
  if (props.renderMode === 'canvas') {
    emit('drag-end');
  }
}
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

/* Soft, layered “cloud” surfaces — tokens only (see style.css :root) */
.available-item-card {
  margin: var(--space-sm) var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  cursor: move;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.15s ease;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text) 6%, transparent);
  background:
    radial-gradient(
      120% 85% at 92% 8%,
      color-mix(in srgb, var(--color-accent-palette-tint) 50%, var(--color-white)) 0%,
      transparent 58%
    ),
    radial-gradient(
      110% 75% at 6% 92%,
      color-mix(in srgb, var(--color-accent-warm-tint) 42%, var(--color-white)) 0%,
      transparent 52%
    ),
    radial-gradient(
      90% 70% at 48% 42%,
      color-mix(in srgb, var(--color-primary-tint) 35%, var(--color-white)) 0%,
      transparent 62%
    ),
    radial-gradient(
      100% 100% at 70% 100%,
      color-mix(in srgb, var(--color-success-tint) 30%, var(--color-white)) 0%,
      transparent 45%
    ),
    linear-gradient(165deg, var(--color-white) 0%, var(--color-bg-muted) 100%);
}

.available-item-card:hover {
  border-color: var(--color-border-hover);
  box-shadow:
    var(--focus-ring-primary),
    0 var(--space-xs) var(--space-md) color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.available-item-card:active {
  opacity: 0.92;
}

.available-item-card__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-width: 0;
}

.available-item-card__label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
  letter-spacing: 0.01em;
  line-height: 1.35;
}

.available-item-card__type {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-primary-tint) 65%, var(--color-white));
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, var(--color-primary-tint));
}

.canvas-block {
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  box-shadow: none;
  cursor: grab;
  transition: transform 0.15s ease;
  position: relative;
  border: 1px dashed var(--color-border);
  background: var(--color-bg-muted);
}

/* Avoid double borders when stacked */
.canvas-block + .canvas-block {
  border-top: none;
}

.delete-btn {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  width: 1.375rem;
  height: 1.375rem;
  border: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-error) 92%, transparent);
  color: var(--color-white);
  font-weight: 700;
  line-height: 1.25rem;
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
