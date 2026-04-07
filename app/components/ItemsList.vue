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
            <span class="available-item-card__lead">
              <span class="available-item-card__icon-wrap" aria-hidden="true">
                <svg
                  class="available-item-card__svg"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    v-for="(seg, idx) in previewIconSegments(element.type)"
                    :key="idx"
                    :d="seg.d"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="available-item-card__label">{{ element.label }}</span>
            </span>
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

/** Minimal 20×20 stroke icons for palette rows (one path or several). */
interface PreviewIconPath {
  readonly d: string;
}

const PREVIEW_ICON_PATHS: Record<BlockType, readonly PreviewIconPath[]> = {
  hero: [{ d: 'M3 5.5h14v3H3zM3 10h14v6H3z' }],
  navbar: [{ d: 'M3 6.5h14M3 10h14M3 13.5h9' }],
  footer: [{ d: 'M3 4.5h14v4.5H3zM3 11h14v5H3z' }],
  cta: [{ d: 'M10 4.5L4.5 15h11L10 4.5z' }],
  features: [{ d: 'M3.5 3.5h5v5h-5zM11.5 3.5h5v5h-5zM3.5 11.5h5v5h-5zM11.5 11.5h5v5h-5z' }],
  services: [{ d: 'M3.5 6.5h3v3h-3zM8.5 6.5H17M3.5 11.5h3v3h-3zM8.5 11.5H17M3.5 16.5h3v1h-3zM8.5 16.5H15' }],
  team: [{ d: 'M5.5 5.5h2.25v2.25H5.5zM11.25 5.5h2.25v2.25h-2.25zM4 14.5h12' }],
  process: [{ d: 'M5 10h9M11 7l3 3-3 3' }],
  testimonial: [{ d: 'M6.5 6.5h7v7h-7zM8 9.5h4M8 12h3' }],
  logos: [{ d: 'M3 7h3.5v6H3zM8.25 5.5h3.5v7.5h-3.5zM13.5 8h3.5v5h-3.5z' }],
  credentials: [{ d: 'M10 4l5 3v4.5c0 2.75-2 5-5 6-3-1-5-3.25-5-6V7l5-3z' }],
  location: [{ d: 'M10 4.75a3 3 0 0 0-3 3c0 2.25 3 6.75 3 6.75s3-4.5 3-6.75a3 3 0 0 0-3-3zM10 7.75a1.25 1.25 0 1 1 0 .01z' }],
  faq: [
    { d: 'M10 5a3.25 3.25 0 1 1 0 .01z' },
    { d: 'M10 9.5v1.25M10 13.25h.01' }
  ],
  pricing: [{ d: 'M5.5 7l4-2.5 6.5 6.5-4 4L5.5 11V7zM12 8.5h.01' }],
  form: [{ d: 'M4 5h12v11H4zM7 8.5h6M7 11.5h6M7 14.5h4' }],
  stats: [{ d: 'M4 14h3.5v3H4zM8.25 11.5h3.5v5.5h-3.5zM12.5 8h3.5v9h-3.5z' }],
  gallery: [{ d: 'M4 5.5h12v10H4zM6.5 13l2.5-3.5 2 2L14 9l3.5 3.5V14H6.5z' }],
  text: [{ d: 'M5 5.5h10M5 9.5h10M5 13.5h7' }]
} as const;

function previewIconSegments(type: BlockType): readonly PreviewIconPath[] {
  const segs = PREVIEW_ICON_PATHS[type];
  return segs ?? PREVIEW_ICON_PATHS.text;
}

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

/* Soft cloudy base + restrained warm (orange) accent — tokens only */
.available-item-card {
  margin: var(--space-sm) var(--space-sm);
  padding: var(--space-md) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--color-border) 88%, var(--color-accent-warm-tint));
  cursor: move;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.15s ease;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text) 6%, transparent);
  background:
    radial-gradient(
      95% 80% at 8% 18%,
      color-mix(in srgb, var(--color-accent-warm-tint) 55%, var(--color-white)) 0%,
      transparent 50%
    ),
    radial-gradient(
      120% 85% at 92% 8%,
      color-mix(in srgb, var(--color-accent-palette-tint) 48%, var(--color-white)) 0%,
      transparent 58%
    ),
    radial-gradient(
      110% 75% at 6% 92%,
      color-mix(in srgb, var(--color-accent-warm-tint) 38%, var(--color-white)) 0%,
      transparent 52%
    ),
    radial-gradient(
      90% 70% at 48% 42%,
      color-mix(in srgb, var(--color-primary-tint) 35%, var(--color-white)) 0%,
      transparent 62%
    ),
    radial-gradient(
      100% 100% at 70% 100%,
      color-mix(in srgb, var(--color-success-tint) 28%, var(--color-white)) 0%,
      transparent 45%
    ),
    linear-gradient(
      168deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-bg-muted) 92%, var(--color-accent-warm-tint)) 100%
    );
}

.available-item-card:hover {
  border-color: color-mix(in srgb, var(--color-border-hover) 75%, var(--color-accent-warm-deep));
  box-shadow:
    var(--focus-ring-primary),
    0 var(--space-xs) var(--space-md) color-mix(in srgb, var(--color-accent-warm-deep) 10%, transparent);
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

.available-item-card__lead {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
}

.available-item-card__icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  color: color-mix(in srgb, var(--color-accent-warm-deep) 42%, var(--color-text-muted));
  background: color-mix(in srgb, var(--color-accent-warm-tint) 45%, var(--color-white));
  border: 1px solid color-mix(in srgb, var(--color-border) 70%, var(--color-accent-warm-tint));
}

.available-item-card__svg {
  width: 1.125rem;
  height: 1.125rem;
  display: block;
}

.available-item-card__label {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
  letter-spacing: 0.01em;
  line-height: 1.4;
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
  background: color-mix(in srgb, var(--color-primary-tint) 55%, var(--color-accent-warm-tint));
  border: 1px solid color-mix(in srgb, var(--color-border) 72%, var(--color-accent-warm-tint));
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
