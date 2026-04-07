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
                    stroke-width="1.25"
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

/** Tiny 20×20 stroke icons: one simple path each, reads at ~1.125rem. */
interface PreviewIconPath {
  readonly d: string;
}

const PREVIEW_ICON_PATHS: Record<BlockType, readonly PreviewIconPath[]> = {
  hero: [{ d: 'M4 6h12v8H4z' }],
  navbar: [{ d: 'M4 7h12M4 10h12M4 13h8' }],
  footer: [{ d: 'M4 5h12v6H4zM4 13h12v3H4z' }],
  cta: [{ d: 'M10 5L5 15h10L10 5z' }],
  features: [{ d: 'M10 5v10M5 10h10' }],
  services: [{ d: 'M4 7h12M4 10h12M4 13h12' }],
  team: [{ d: 'M6 5v10M10 5v10M14 5v10' }],
  process: [{ d: 'M5 10h8M11 7l3 3-3 3' }],
  testimonial: [{ d: 'M6 7h8v6H6z' }],
  logos: [{ d: 'M4 7h3.5v6H4zM8.25 7h3.5v6h-3.5zM12.5 7h3.5v6h-3.5z' }],
  credentials: [{ d: 'M6.5 10.5l2.5 2.5 5.5-6' }],
  /* Pin: circle + open V below (reads clearly at small size) */
  location: [{ d: 'M10 7a2.5 2.5 0 1 1-.01 0zM7.5 14.5L10 10l2.5 4.5' }],
  /* Chat bubble: rounded rect + tail (Q&A) */
  faq: [{ d: 'M5 7h10v4h-5l-2 2v-2H5z' }],
  pricing: [{ d: 'M5 6h10v7H5z' }],
  form: [{ d: 'M5 5h10v9H5zM8 8h6M8 11h4' }],
  stats: [{ d: 'M4 12h3v4H4zM8.5 9h3v7h-3zM13 6h3v10h-3z' }],
  gallery: [{ d: 'M5 5h10v9H5z' }],
  text: [{ d: 'M5 6h10M5 10h10M5 14h6' }]
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

/* Lively soft pink: layered glow + tonal variation — tokens only */
.available-item-card {
  margin: var(--space-sm) var(--space-sm);
  padding: var(--space-md) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-border) 72%,
      color-mix(in srgb, var(--color-accent-palette-tint) 65%, var(--color-accent-palette-deep))
    );
  cursor: move;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, opacity 0.15s ease;
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--color-text) 5%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-white) 55%, transparent),
    0 14px 28px -12px color-mix(in srgb, var(--color-accent-palette-deep) 9%, transparent);
  background:
    radial-gradient(
      ellipse 115% 95% at 50% -8%,
      color-mix(in srgb, var(--color-accent-palette-tint) 78%, var(--color-white)) 0%,
      transparent 52%
    ),
    radial-gradient(
      95% 75% at 96% 12%,
      color-mix(in srgb, var(--color-accent-palette-deep) 14%, var(--color-white)) 0%,
      transparent 46%
    ),
    radial-gradient(
      85% 70% at 4% 88%,
      color-mix(in srgb, var(--color-primary-tint) 42%, var(--color-white)) 0%,
      transparent 50%
    ),
    radial-gradient(
      100% 85% at 48% 52%,
      color-mix(in srgb, var(--color-accent-palette-tint) 32%, var(--color-white)) 0%,
      transparent 58%
    ),
    radial-gradient(
      110% 90% at 72% 100%,
      color-mix(in srgb, var(--color-accent-warm-tint) 22%, var(--color-white)) 0%,
      transparent 40%
    ),
    linear-gradient(
      156deg,
      var(--color-white) 0%,
      color-mix(in srgb, var(--color-accent-palette-tint) 28%, var(--color-white)) 32%,
      color-mix(in srgb, var(--color-bg-muted) 78%, var(--color-accent-palette-tint)) 72%,
      color-mix(in srgb, var(--color-accent-palette-tint) 18%, var(--color-bg-muted)) 100%
    );
}

.available-item-card:hover {
  border-color: color-mix(in srgb, var(--color-border-hover) 55%, var(--color-accent-palette-deep));
  box-shadow:
    var(--focus-ring-primary),
    0 1px 2px color-mix(in srgb, var(--color-text) 5%, transparent),
    0 0 0 1px color-mix(in srgb, var(--color-white) 45%, var(--color-accent-palette-tint)),
    0 var(--space-xs) var(--space-md) color-mix(in srgb, var(--color-accent-palette-deep) 14%, transparent),
    0 18px 36px -14px color-mix(in srgb, var(--color-accent-palette-deep) 11%, transparent);
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
  color: color-mix(in srgb, var(--color-accent-palette-deep) 44%, var(--color-text-muted-dark));
  background:
    radial-gradient(
      90% 90% at 35% 25%,
      color-mix(in srgb, var(--color-white) 55%, var(--color-accent-palette-tint)) 0%,
      color-mix(in srgb, var(--color-accent-palette-tint) 48%, var(--color-white)) 100%
    );
  border: 1px solid color-mix(in srgb, var(--color-border) 55%, var(--color-accent-palette-tint));
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-white) 65%, transparent),
    0 1px 3px color-mix(in srgb, var(--color-accent-palette-deep) 7%, transparent);
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
  color: color-mix(in srgb, var(--color-text-muted) 70%, var(--color-accent-palette-deep));
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-primary-tint) 42%, var(--color-accent-palette-tint)) 0%,
    color-mix(in srgb, var(--color-accent-palette-tint) 58%, var(--color-white)) 100%
  );
  border: 1px solid color-mix(in srgb, var(--color-border) 58%, var(--color-accent-palette-tint));
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-white) 50%, transparent);
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
