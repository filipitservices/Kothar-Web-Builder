/**
 * Request Layout Store
 *
 * Single source of truth for the page layout being edited as part of a
 * request / order.  Persists across route navigation (request page ↔ builder)
 * so the user can enter the builder, rearrange sections, return to the
 * request page, and submit — all without losing layout state.
 *
 * The store also converts ShowcaseTemplate sections into builder BlockItem[]
 * so the builder can render the template structure directly.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { BlockItem, BlockType } from '~/types/builder';
import type { ShowcaseTemplate, ShowcaseSection } from '~/stores/showcase';
import type { OrderLayout, OrderLayoutBlock, BuilderAnnotations } from '~/types/order';

/* -------------------------------------------------------------------------- */
/*  Showcase section → builder block mapping                                  */
/* -------------------------------------------------------------------------- */

const SECTION_TO_BLOCK: Record<string, { type: BlockType; label: string }> = {
  nav:          { type: 'navbar',      label: 'Navigation' },
  hero:         { type: 'hero',        label: 'Hero Section' },
  services:     { type: 'services',    label: 'Services' },
  about:        { type: 'text',        label: 'About' },
  features:     { type: 'features',    label: 'Features' },
  testimonials: { type: 'testimonial', label: 'Testimonials' },
  team:         { type: 'team',        label: 'Team' },
  pricing:      { type: 'pricing',     label: 'Pricing' },
  gallery:      { type: 'gallery',     label: 'Gallery' },
  contact:      { type: 'form',        label: 'Contact Form' },
  cta:          { type: 'cta',         label: 'Call To Action' },
  faq:          { type: 'faq',         label: 'FAQ' },
  stats:        { type: 'stats',       label: 'Stats' },
  process:      { type: 'process',     label: 'Process' },
  trust:        { type: 'credentials', label: 'Trust & Credentials' },
  location:     { type: 'location',    label: 'Location & Hours' },
};

function generateBlockId(blockType: string): string {
  return `${blockType}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function sectionToBlock(section: ShowcaseSection): BlockItem {
  const mapping = SECTION_TO_BLOCK[section.type];
  const type: BlockType = (mapping?.type ?? 'text') as BlockType;
  const label = mapping?.label ?? section.type;
  return { id: generateBlockId(type), type, label };
}

function createEmptyBuilderAnnotations(): BuilderAnnotations {
  return {
    version: 1,
    desktop: { strokes: [], textBoxes: [] },
    mobile: { strokes: [], textBoxes: [] },
  };
}

function cloneBuilderAnnotations(value?: BuilderAnnotations): BuilderAnnotations {
  const source = value ?? createEmptyBuilderAnnotations();
  return {
    version: 1,
    desktop: {
      strokes: [...source.desktop.strokes],
      textBoxes: source.desktop.textBoxes.map((box) => ({ ...box })),
    },
    mobile: {
      strokes: [...source.mobile.strokes],
      textBoxes: source.mobile.textBoxes.map((box) => ({ ...box })),
    },
  };
}

/**
 * Convert a ShowcaseTemplate's sections array into builder BlockItem[].
 * Prepends a navbar block when the showcase does not already start with a
 * `nav` section, and appends a footer block to match builder conventions.
 */
export function showcaseSectionsToBlocks(sections: ShowcaseSection[]): BlockItem[] {
  const content = sections.map(sectionToBlock);
  const footer: BlockItem = { id: generateBlockId('footer'), type: 'footer', label: 'Footer' };
  const needsSyntheticNav = sections[0]?.type !== 'nav';
  if (needsSyntheticNav) {
    const nav: BlockItem = { id: generateBlockId('navbar'), type: 'navbar', label: 'Navigation' };
    return [nav, ...content, footer];
  }
  return [...content, footer];
}

/* -------------------------------------------------------------------------- */
/*  Store                                                                     */
/* -------------------------------------------------------------------------- */

export const useRequestLayoutStore = defineStore('requestLayout', () => {
  /** Whether a request / order editing session is active. */
  const active = ref(false);

  /** Current block layout (single layout shared by desktop & mobile). */
  const blocks = ref<BlockItem[]>([]);

  /** Snapshot of the original layout for customization detection. */
  const originalBlocks = ref<BlockItem[]>([]);
  const builderAnnotations = ref<BuilderAnnotations>(createEmptyBuilderAnnotations());

  /** Source showcase template id (new request flow). */
  const sourceTemplateId = ref<string | null>(null);

  /** Source order id (order edit flow). */
  const sourceOrderId = ref<string | null>(null);

  /** Route to navigate back to when leaving the builder. */
  const returnRoute = ref<string | null>(null);

  /**
   * JSON fingerprint of the last persisted / accepted layout (load or successful save).
   * Used for unsaved-changes detection; do not confuse with isCustomized (template deviation).
   */
  const persistedLayoutFingerprint = ref<string | null>(null);

  function fingerprintFromLayout(layout: OrderLayout): string {
    return JSON.stringify(layout);
  }

  /** Call after init, successful builder save, or successful order submit while staying on page. */
  function syncLayoutBaselineFromCurrent(): void {
    persistedLayoutFingerprint.value = fingerprintFromLayout(getLayoutForSubmission());
  }

  function isLayoutDirtyVsBaseline(): boolean {
    const baseline = persistedLayoutFingerprint.value;
    if (baseline === null) return false;
    return fingerprintFromLayout(getLayoutForSubmission()) !== baseline;
  }

  /* -- Derived ------------------------------------------------------------ */

  const isCustomized = computed<boolean>(() => {
    if (blocks.value.length !== originalBlocks.value.length) return true;
    return blocks.value.some(
      (block, i) => block.type !== originalBlocks.value[i]?.type
    );
  });

  /* -- Actions ------------------------------------------------------------ */

  /** Initialize from a showcase template (new request flow). */
  function initFromTemplate(template: ShowcaseTemplate, returnTo: string): void {
    const converted = showcaseSectionsToBlocks(template.sections);
    blocks.value = converted;
    originalBlocks.value = converted.map(b => ({ ...b }));
    sourceTemplateId.value = template.id;
    sourceOrderId.value = null;
    returnRoute.value = returnTo;
    builderAnnotations.value = createEmptyBuilderAnnotations();
    active.value = true;
    syncLayoutBaselineFromCurrent();
  }

  /** Initialize from an existing order's saved layout (edit flow). */
  function initFromOrderLayout(
    layout: OrderLayout,
    orderId: string,
    templateSections: ShowcaseSection[],
    returnTo: string
  ): void {
    const restored: BlockItem[] = layout.blocks.map(b => ({
      id: b.id,
      type: b.type as BlockType,
      label: b.label,
    }));
    blocks.value = restored;

    const original = showcaseSectionsToBlocks(templateSections);
    originalBlocks.value = original;
    sourceTemplateId.value = null;
    sourceOrderId.value = orderId;
    returnRoute.value = returnTo;
    builderAnnotations.value = cloneBuilderAnnotations(layout.builderAnnotations);
    active.value = true;
    syncLayoutBaselineFromCurrent();
  }

  /**
   * Initialize from a showcase template for an existing order that has no
   * saved layout yet (orders created before this feature).
   */
  function initFromTemplateForOrder(
    template: ShowcaseTemplate,
    orderId: string,
    returnTo: string
  ): void {
    const converted = showcaseSectionsToBlocks(template.sections);
    blocks.value = converted;
    originalBlocks.value = converted.map(b => ({ ...b }));
    sourceTemplateId.value = template.id;
    sourceOrderId.value = orderId;
    returnRoute.value = returnTo;
    builderAnnotations.value = createEmptyBuilderAnnotations();
    active.value = true;
    syncLayoutBaselineFromCurrent();
  }

  /** Replace the current block list (called by the builder on drag changes). */
  function updateBlocks(newBlocks: BlockItem[]): void {
    blocks.value = [...newBlocks];
  }

  /** Set the route to navigate back to when leaving the builder (e.g. when entry point differs). */
  function setReturnRoute(returnTo: string): void {
    returnRoute.value = returnTo;
  }

  function setBuilderAnnotations(next: BuilderAnnotations): void {
    builderAnnotations.value = cloneBuilderAnnotations(next);
  }

  /** Produce the layout payload for order submission / update. */
  function getLayoutForSubmission(): OrderLayout {
    return {
      blocks: blocks.value.map(b => ({
        id: b.id,
        type: b.type,
        label: b.label,
      } satisfies OrderLayoutBlock)),
      customized: isCustomized.value,
      builderAnnotations: cloneBuilderAnnotations(builderAnnotations.value),
    };
  }

  /** Clear all state (e.g. after submission or explicit discard). */
  function reset(): void {
    blocks.value = [];
    originalBlocks.value = [];
    sourceTemplateId.value = null;
    sourceOrderId.value = null;
    returnRoute.value = null;
    builderAnnotations.value = createEmptyBuilderAnnotations();
    active.value = false;
    persistedLayoutFingerprint.value = null;
  }

  return {
    active,
    blocks,
    originalBlocks,
    builderAnnotations,
    sourceTemplateId,
    sourceOrderId,
    returnRoute,
    isCustomized,
    initFromTemplate,
    initFromOrderLayout,
    initFromTemplateForOrder,
    updateBlocks,
    setReturnRoute,
    setBuilderAnnotations,
    getLayoutForSubmission,
    syncLayoutBaselineFromCurrent,
    isLayoutDirtyVsBaseline,
    reset,
  };
});
