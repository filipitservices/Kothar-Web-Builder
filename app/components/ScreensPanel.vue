<template>
  <div class="screens-panel" ref="screensPanelRef">
    <!-- Drawing Controls Panel (top, under "Editing page layout" bar) -->
    <DrawingControlsPanel
      :desktop-drawing-state="props.desktopDrawingState"
      :mobile-drawing-state="props.mobileDrawingState"
      @update:desktop-drawing-state="handleDesktopStateUpdate"
      @update:mobile-drawing-state="handleMobileStateUpdate"
      @undo="handleUndo"
      @redo="handleRedo"
      @clear="handleClear"
    />

    <!-- Screens area (screens + overlay) -->
    <div class="screens-area">
      <div class="screens-inner" ref="screensContainerRef">
      <div class="screen-scale-wrapper"
        :style="{ 
          width: desktopScaledWidth + 'px', 
          height: desktopScaledHeight + 'px' 
        }"
      >
        <ScreenCard
          ref="desktopScreenRef"
          title="Desktop Screen"
          screen-class="desktop-screen"
          canvas-id="desktop-canvas"
          :canvas-width="desktopCanvasWidth"
          :canvas-height="desktopCanvasHeight"
          :list="props.desktopList"
          :is-drawing-enabled="props.desktopDrawingState.desktopEnabled"
          :drawing-state="props.desktopDrawingState"
          :strokes="props.desktopStrokes"
          :style="{ transform: `translateX(-50%) scale(${desktopScale})`, transformOrigin: 'top center' }"
          @undo="() => desktopScreenRef?.undo()"
          @redo="() => desktopScreenRef?.redo()"
          @clear="() => desktopScreenRef?.clear()"
          @list-change="(list) => emit('update:desktopList', list)"
          @remove-item="removeDesktopItem"
        />
      </div>

      <div class="screen-scale-wrapper"
        :style="{ 
          width: mobileScaledWidth + 'px', 
          height: mobileScaledHeight + 'px' 
        }"
      >
        <ScreenCard
          ref="mobileScreenRef"
          title="Mobile"
          screen-class="mobile-screen"
          canvas-id="mobile-canvas"
          :canvas-width="mobileCanvasWidth"
          :canvas-height="mobileCanvasHeight"
          :list="props.mobileList"
          :is-drawing-enabled="props.mobileDrawingState.mobileEnabled"
          :drawing-state="props.mobileDrawingState"
          :strokes="props.mobileStrokes"
          :style="{ transform: `translateX(-50%) scale(${mobileScale})`, transformOrigin: 'top center' }"
          @undo="() => mobileScreenRef?.undo()"
          @redo="() => mobileScreenRef?.redo()"
          @clear="() => mobileScreenRef?.clear()"
          @list-change="(list) => emit('update:mobileList', list)"
          @remove-item="removeMobileItem"
        />
      </div>
    </div>

      <!-- AI Chat Panel (overlay) -->
      <AiChatPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick, toRef, type ComputedRef } from 'vue';
import { useScreenScaling } from '~/composables/useScreenScaling';
import { useListSyncing } from '~/composables/useListSyncing';
import ScreenCard from './ScreenCard.vue';
import DrawingControlsPanel from './DrawingControlsPanel.vue';
import AiChatPanel from './AiChatPanel.vue';
import type { BlockItem, ScreenCardRefShape } from '~/types/builder';
import type { DrawingState } from '~/composables/useDrawing';

const props = withDefaults(
  defineProps<{
    desktopCanvasWidth: number;
    desktopCanvasHeight: number;
    mobileCanvasWidth: number;
    mobileCanvasHeight: number;
    desktopList: BlockItem[];
    mobileList: BlockItem[];
    desktopDrawingState: DrawingState;
    mobileDrawingState: DrawingState;
    desktopStrokes: unknown[];
    mobileStrokes: unknown[];
    syncScreens?: boolean;
  }>(),
  { syncScreens: true }
);

const emit = defineEmits<{
  (e: 'toggle-desktop-drawing'): void;
  (e: 'toggle-mobile-drawing'): void;
  (e: 'toggle-desktop-text-mode'): void;
  (e: 'toggle-mobile-text-mode'): void;
  (e: 'update:desktopList', value: BlockItem[]): void;
  (e: 'update:mobileList', value: BlockItem[]): void;
  (e: 'update:desktopDrawingState', value: Partial<DrawingState>): void;
  (e: 'update:mobileDrawingState', value: Partial<DrawingState>): void;
  (e: 'set-desktop-canvas-ref', el: unknown): void;
  (e: 'set-mobile-canvas-ref', el: unknown): void;
}>();

// Composables
const {
  desktopScale,
  mobileScale,
  desktopScaledWidth,
  desktopScaledHeight,
  mobileScaledWidth,
  mobileScaledHeight,
  screensPanelRef,
  initializeScaling,
  cleanupScaling
} = useScreenScaling();

// Template refs
const desktopScreenRef = ref<InstanceType<typeof ScreenCard> | null>(null);
const mobileScreenRef = ref<InstanceType<typeof ScreenCard> | null>(null);
const screensContainerRef = ref<HTMLElement | null>(null);

const syncScreensEnabled = toRef(props, 'syncScreens');

function applyClampedScrollTop(el: HTMLElement, top: number): void {
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  el.scrollTop = Math.min(top, max);
}

// Local props mirroring
const desktopCanvasWidth = ref<number>(props.desktopCanvasWidth);
const desktopCanvasHeight = ref<number>(props.desktopCanvasHeight);
const mobileCanvasWidth = ref<number>(props.mobileCanvasWidth);
const mobileCanvasHeight = ref<number>(props.mobileCanvasHeight);

// Sync canvas dimensions from props
watch(() => props.desktopCanvasWidth, (val) => { desktopCanvasWidth.value = val; });
watch(() => props.desktopCanvasHeight, (val) => { desktopCanvasHeight.value = val; });
watch(() => props.mobileCanvasWidth, (val) => { mobileCanvasWidth.value = val; });
watch(() => props.mobileCanvasHeight, (val) => { mobileCanvasHeight.value = val; });

// Create proxy refs that sync with props (not snapshots)
const desktopListRef: ComputedRef<BlockItem[]> = computed({
  get: () => props.desktopList,
  set: (val) => emit('update:desktopList', val)
});

const mobileListRef: ComputedRef<BlockItem[]> = computed({
  get: () => props.mobileList,
  set: (val) => emit('update:mobileList', val)
});

// Initialize list syncing with live prop references (BlockItem extends ConstraintElement)
useListSyncing<BlockItem>({
  desktopList: desktopListRef,
  mobileList: mobileListRef,
  syncEnabled: syncScreensEnabled,
  onDesktopListUpdate: (list) => emit('update:desktopList', list),
  onMobileListUpdate: (list) => emit('update:mobileList', list)
});

// Preserve outer .screens-inner scroll when layout list changes (shared desktop prop is sufficient).
watch(
  () => props.desktopList,
  async () => {
    const el = screensContainerRef.value;
    if (!el) return;
    const saved = el.scrollTop;
    await nextTick();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        const node = screensContainerRef.value;
        if (node) {
          applyClampedScrollTop(node, saved);
        }
        resolve();
      });
    });
  }
);

// Handle drawing state updates properly
const handleDesktopStateUpdate = (state: DrawingState) => {
  // Forward to parent as a partial update - never mutate props
  emit('update:desktopDrawingState', { ...state });
};

const handleMobileStateUpdate = (state: DrawingState) => {
  // Forward to parent as a partial update - never mutate props
  emit('update:mobileDrawingState', { ...state });
};

// Delete handlers
const removeDesktopItem = (id: string) => {
  const next = props.desktopList.filter((el) => el.id !== id);
  emit('update:desktopList', next);
};

const removeMobileItem = (id: string) => {
  const next = props.mobileList.filter((el) => el.id !== id);
  emit('update:mobileList', next);
};

// Undo/Redo/Clear handlers
const handleUndo = () => {
  if (props.desktopDrawingState.desktopEnabled) {
    desktopScreenRef.value?.undo();
  }
  if (props.mobileDrawingState.mobileEnabled) {
    mobileScreenRef.value?.undo();
  }
};

const handleRedo = () => {
  if (props.desktopDrawingState.desktopEnabled) {
    desktopScreenRef.value?.redo();
  }
  if (props.mobileDrawingState.mobileEnabled) {
    mobileScreenRef.value?.redo();
  }
};

const handleClear = () => {
  if (props.desktopDrawingState.desktopEnabled) {
    desktopScreenRef.value?.clear();
  }
  if (props.mobileDrawingState.mobileEnabled) {
    mobileScreenRef.value?.clear();
  }
};

// Lifecycle
onMounted(async () => {
  const desktopCanvas = (desktopScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.canvas;
  if (desktopCanvas) {
    emit('set-desktop-canvas-ref', desktopCanvas);
  }
  const mobileCanvas = (mobileScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.canvas;
  if (mobileCanvas) {
    emit('set-mobile-canvas-ref', mobileCanvas);
  }
  await initializeScaling();
});

onUnmounted(() => cleanupScaling());

// Canvas ref updates when drawing is enabled
watch(() => props.desktopDrawingState.desktopEnabled, (enabled) => {
  if (enabled) {
    setTimeout(() => {
      const desktopCanvas = (desktopScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.canvas;
      if (desktopCanvas) {
        emit('set-desktop-canvas-ref', desktopCanvas);
      }
    }, 0);
  }
});

watch(() => props.mobileDrawingState.mobileEnabled, (enabled) => {
  if (enabled) {
    setTimeout(() => {
      const mobileCanvas = (mobileScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.canvas;
      if (mobileCanvas) {
        emit('set-mobile-canvas-ref', mobileCanvas);
      }
    }, 0);
  }
});
</script>

<style scoped>
.screens-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  gap: var(--space-md);
}

.screens-area {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.screens-inner {
  display: flex;
  gap: var(--space-2xl);
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow: auto;
  padding: var(--space-lg);
  width: 100%;
  min-height: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.screens-inner::-webkit-scrollbar {
  display: none;
}

.screen-scale-wrapper {
  position: relative;
  flex-shrink: 0;
}

/* Position screen inside wrapper; centering + scale applied via inline transform so both apply. */
.screen-scale-wrapper > :deep(.screen) {
  position: absolute;
  top: 0;
  left: 50%;
}

/* Stack screens vertically on smaller viewports */
@media (max-width: 1024px) {
  .screens-inner {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
