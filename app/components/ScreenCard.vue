<template>
  <div class="screen" :class="screenClass">
    <ScreenHeader :title="title" :show-drawing-active="isDrawingEnabled" />
    <div 
      ref="screenContentRef"
      class="screen-content" 
      :class="{ 'drawing-enabled': isDrawingEnabled }"
    >
      <ItemsList
        :items="list"
        :group="{ name: 'screens', put: ['available', 'unused'] }"
        :disabled="isDrawingEnabled"
        render-mode="canvas"
        :screen-type="screenClass === 'mobile-screen' ? 'mobile' : 'desktop'"
        @change="$emit('list-change', $event)"
        @remove="onRemove"
        @drag-start="onItemsDragStart"
        @drag-end="onItemsDragEnd"
      />

      <DrawingOverlay
        ref="overlayRef"
        :canvas-id="canvasId"
        :is-enabled="isDrawingEnabled"
        :drawing-state="drawingState"
        :strokes="strokes"
        :initial-text-boxes="textBoxes"
        :width="dynamicCanvasWidth"
        :height="dynamicCanvasHeight"
        @update:stroke-type="onUpdateStrokeType"
        @update:color="onUpdateColor"
        @update:line-width="onUpdateLineWidth"
        @toggle-text-mode="onToggleTextMode"
        @update:text-font-size="onUpdateTextFontSize"
        @update:text-color="onUpdateTextColor"
        @update:text-emphasis="onUpdateTextEmphasis"
        @update:text-boxes="onTextBoxesChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import ScreenHeader from './ScreenHeader.vue';
import DrawingOverlay from './DrawingOverlay.vue';
import ItemsList from './ItemsList.vue';
import { useCanvasDimensions } from '~/composables/useCanvasDimensions';
import type { BuilderTextBox } from '~/types/order';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  screenClass: {
    type: String,
    required: true
  },
  canvasId: {
    type: String,
    required: true
  },
  canvasWidth: {
    type: Number,
    required: true
  },
  canvasHeight: {
    type: Number,
    required: true
  },
  list: {
    type: Array,
    required: true
  },
  isDrawingEnabled: {
    type: Boolean,
    required: true
  },
  drawingState: {
    type: Object,
    required: true
  },
  strokes: {
    type: Array,
    required: true
  },
  textBoxes: {
    type: Array as () => BuilderTextBox[],
    default: () => []
  }
});

const emit = defineEmits([
  'update:strokeType',
  'update:color',
  'update:lineWidth',
  'toggle-text-mode',
  'update:textFontSize',
  'update:textColor',
  'update:textEmphasis',
  'update:textBoxes',
  'undo',
  'redo',
  'clear',
  'list-change',
  'remove-item'
]);

const overlayRef = ref(null);
const screenContentRef = ref(null);
let savedScrollTop = 0;

/** Coalesce scroll target; first non-forced write wins until snapshot (avoids 0 overwriting a good offset). */
let pendingListScrollTop: number | null = null;
/** Bumps invalidate in-flight delayed restores so rapid list changes only apply the latest generation. */
let listScrollRestoreGeneration = 0;

function applyClampedScrollTop(el: HTMLElement, top: number): void {
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  el.scrollTop = Math.min(top, max);
}

function queueRestoreListScroll(saved: number, force = false): void {
  if (force) {
    pendingListScrollTop = saved;
  } else if (pendingListScrollTop === null) {
    pendingListScrollTop = saved;
  }

  const gen = ++listScrollRestoreGeneration;

  void (async () => {
    await nextTick();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => queueMicrotask(r));

    if (gen !== listScrollRestoreGeneration) {
      return;
    }

    const captured = pendingListScrollTop;
    pendingListScrollTop = null;
    if (captured === null) {
      return;
    }

    const apply = (): void => {
      if (gen !== listScrollRestoreGeneration) {
        return;
      }
      const node = screenContentRef.value;
      if (node) {
        applyClampedScrollTop(node, captured);
      }
    };

    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 0);
    setTimeout(apply, 48);
    setTimeout(apply, 120);
  })();
}

const dragScrollAnchor = ref(0);

function onItemsDragStart(): void {
  const el = screenContentRef.value;
  if (el) {
    dragScrollAnchor.value = el.scrollTop;
  }
}

function onItemsDragEnd(): void {
  // Override any earlier `flush: 'pre'` capture that saw scrollTop already reset to 0.
  queueRestoreListScroll(dragScrollAnchor.value, true);
}

// Use canvas dimensions composable to track content size
const { canvasWidth: dynamicCanvasWidth, canvasHeight: dynamicCanvasHeight, setup: setupCanvasDimensions, cleanup: cleanupCanvasDimensions } = useCanvasDimensions(
  screenContentRef,
  props.canvasWidth,
  props.canvasHeight,
  {
    isDrawingEnabled: () => props.isDrawingEnabled
  }
);

// Preserve scroll position when drawing mode toggles
watch(
  () => props.isDrawingEnabled,
  async (newValue) => {
    if (!screenContentRef.value) return;
    
    // Save current scroll position before DOM changes
    savedScrollTop = screenContentRef.value.scrollTop;
    
    // Wait for DOM to settle after prop change
    await nextTick();
    
    // Restore scroll position after DOM updates complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        if (screenContentRef.value) {
          applyClampedScrollTop(screenContentRef.value, savedScrollTop);
        }
        resolve(undefined);
      });
    });
  }
);

// `flush: 'sync'` runs before child re-render so scrollTop is read before the list DOM is torn down.
watch(
  () => props.list,
  () => {
    const el = screenContentRef.value;
    if (!el) return;
    queueRestoreListScroll(el.scrollTop);
  },
  { flush: 'sync' }
);

const onUpdateStrokeType = (val) => emit('update:strokeType', val);
const onUpdateColor = (val) => emit('update:color', val);
const onUpdateLineWidth = (val) => emit('update:lineWidth', val);
const onToggleTextMode = () => emit('toggle-text-mode');
const onUpdateTextFontSize = (val) => emit('update:textFontSize', val);
const onUpdateTextColor = (val) => emit('update:textColor', val);
const onUpdateTextEmphasis = (val) => emit('update:textEmphasis', val);
const onTextBoxesChange = (next: BuilderTextBox[]) => emit('update:textBoxes', next);
const onRemove = (id) => emit('remove-item', id);

const undo = () => overlayRef.value?.undo();
const redo = () => overlayRef.value?.redo();
const clear = () => overlayRef.value?.clear();

function hasDrawWorkToClear(): boolean {
  const overlay = overlayRef.value as {
    hasDrawingContent?: () => boolean;
  } | null;
  return overlay?.hasDrawingContent?.() ?? false;
}

function hasTextWorkToClear(): boolean {
  const overlay = overlayRef.value as {
    hasTextContent?: () => boolean;
  } | null;
  return overlay?.hasTextContent?.() ?? false;
}

// Initialize canvas dimension tracking with list watcher
onMounted(() => {
  setupCanvasDimensions(() => props.list);
});

onUnmounted(() => {
  cleanupCanvasDimensions();
});

defineExpose({ overlayRef, undo, redo, clear, hasDrawWorkToClear, hasTextWorkToClear });
</script>

<style scoped>
.screen {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 14px 20px rgb(0 0 0 / 22%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.screen.desktop-screen {
  width: 700px;
  height: 550px;
  border: 12px solid #111111;
  border-radius: 20px;
  position: relative;
  margin-bottom: 40px;
}

.screen.desktop-screen::after {
  content: "";
  position: absolute;
  width: 400px;
  height: 20px;
  background: #333;
  border-radius: 0 0 30px 30px;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.screen.mobile-screen {
  width: 330px;
  height: 600px;
  border: 12px solid #111;
  border-radius: 40px;
  position: relative;
}

.screen.mobile-screen::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 14px;
  background: #111;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.screen.mobile-screen::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 5px;
  background: #111;
  border-radius: 5px;
  z-index: 10;
}

.screen-content {
  flex: 1;
  overflow-y: auto;
  z-index: 4;
  /* Avoid `transition: all` — it interpolates layout-related properties and fights DnD/scroll restores. */
  transition: opacity 0.3s ease;
  /* Reduce browser scroll anchoring jumping the viewport when block list height changes. */
  overflow-anchor: none;
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.screen-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
