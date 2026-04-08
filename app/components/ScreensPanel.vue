<template>
  <div class="screens-panel" ref="screensPanelRef">
    <!-- Drawing Controls Panel (top, under "Editing page layout" bar) -->
    <DrawingControlsPanel
      :desktop-drawing-state="props.desktopDrawingState"
      :mobile-drawing-state="props.mobileDrawingState"
      :show-sync-screens="props.showSyncScreens"
      :sync-screens="props.syncScreens"
      @update:desktop-drawing-state="handleDesktopStateUpdate"
      @update:mobile-drawing-state="handleMobileStateUpdate"
      @update:sync-screens="emit('update:syncScreens', $event)"
      @undo="handleUndo"
      @redo="handleRedo"
      @clear="onClearRequest"
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
          title="Desktop"
          screen-class="desktop-screen"
          canvas-id="desktop-canvas"
          :canvas-width="desktopCanvasWidth"
          :canvas-height="desktopCanvasHeight"
          :list="props.desktopList"
          :is-drawing-enabled="props.desktopDrawingState.desktopEnabled ?? false"
          :drawing-state="props.desktopDrawingState"
          :strokes="props.desktopStrokes"
          :text-boxes="props.desktopTextBoxes"
          :style="{ transform: `translateX(-50%) scale(${desktopScale})`, transformOrigin: 'top center' }"
          @undo="() => desktopScreenRef?.undo()"
          @redo="() => desktopScreenRef?.redo()"
          @clear="() => desktopScreenRef?.clear()"
          @list-change="(list) => emit('update:desktopList', list)"
          @update:text-boxes="(next) => emit('update:desktopTextBoxes', next)"
          @remove-item="removeDesktopItem"
          @annotation-interaction="emit('annotation-interaction')"
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
          :is-drawing-enabled="props.mobileDrawingState.mobileEnabled ?? false"
          :drawing-state="props.mobileDrawingState"
          :strokes="props.mobileStrokes"
          :text-boxes="props.mobileTextBoxes"
          :style="{ transform: `translateX(-50%) scale(${mobileScale})`, transformOrigin: 'top center' }"
          @undo="() => mobileScreenRef?.undo()"
          @redo="() => mobileScreenRef?.redo()"
          @clear="() => mobileScreenRef?.clear()"
          @list-change="(list) => emit('update:mobileList', list)"
          @update:text-boxes="(next) => emit('update:mobileTextBoxes', next)"
          @remove-item="removeMobileItem"
          @annotation-interaction="emit('annotation-interaction')"
        />
      </div>
    </div>

      <!-- AI Chat Panel (overlay) -->
      <AiChatPanel />
    </div>

    <Teleport to="body">
      <div
        v-if="clearConfirmOpen"
        class="modal-overlay"
        role="presentation"
        @click.self="clearConfirmOpen = false"
      >
        <div
          class="modal-container drawing-clear-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawing-clear-title"
          aria-describedby="drawing-clear-desc"
        >
          <div class="modal-header">
            <h2 id="drawing-clear-title" class="text-title">Clear annotations?</h2>
          </div>
          <div class="modal-body drawing-clear-dialog__body">
            <p id="drawing-clear-desc" class="text-muted">{{ clearConfirmMessage }}</p>
          </div>
          <div class="modal-footer drawing-clear-dialog__footer">
            <button type="button" class="btn btn--secondary" @click="clearConfirmOpen = false">
              Cancel
            </button>
            <button type="button" class="btn btn--danger" @click="runClearAfterConfirm">
              Clear all
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
import type { DrawingState } from '~/types/builder';
import type { BuilderTextBox } from '~/types/order';

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
    desktopTextBoxes: BuilderTextBox[];
    mobileTextBoxes: BuilderTextBox[];
    syncScreens?: boolean;
    showSyncScreens?: boolean;
  }>(),
  { syncScreens: true, showSyncScreens: false }
);

const emit = defineEmits<{
  (e: 'update:syncScreens', value: boolean): void;
  (e: 'toggle-desktop-text-mode'): void;
  (e: 'toggle-mobile-text-mode'): void;
  (e: 'update:desktopList', value: BlockItem[]): void;
  (e: 'update:mobileList', value: BlockItem[]): void;
  (e: 'update:desktopDrawingState', value: Partial<DrawingState>): void;
  (e: 'update:mobileDrawingState', value: Partial<DrawingState>): void;
  (e: 'update:desktopTextBoxes', value: BuilderTextBox[]): void;
  (e: 'update:mobileTextBoxes', value: BuilderTextBox[]): void;
  (e: 'set-desktop-canvas-ref', el: unknown): void;
  (e: 'set-mobile-canvas-ref', el: unknown): void;
  (e: 'annotation-interaction'): void;
}>();

const clearConfirmOpen = ref(false);
const clearConfirmMessage = ref('');

function clearImpactDescription(): string | null {
  let hasText = false;
  let hasDraw = false;
  if (props.desktopDrawingState.desktopEnabled) {
    if (props.desktopDrawingState.isTextMode && props.desktopTextBoxes.length > 0) {
      hasText = true;
    }
    if (!props.desktopDrawingState.isTextMode && props.desktopStrokes.length > 0) {
      hasDraw = true;
    }
  }
  if (props.mobileDrawingState.mobileEnabled) {
    if (props.mobileDrawingState.isTextMode && props.mobileTextBoxes.length > 0) {
      hasText = true;
    }
    if (!props.mobileDrawingState.isTextMode && props.mobileStrokes.length > 0) {
      hasDraw = true;
    }
  }
  if (!hasText && !hasDraw) return null;
  if (hasText && hasDraw) {
    return 'This will remove text boxes and drawing marks from the active preview. This cannot be undone.';
  }
  if (hasText) {
    return 'This will remove text boxes from the active preview. This cannot be undone.';
  }
  return 'This will remove drawing marks and shapes from the active preview. This cannot be undone.';
}

function onClearRequest(): void {
  const desc = clearImpactDescription();
  if (!desc) {
    runClearCanvas();
    return;
  }
  clearConfirmMessage.value = desc;
  clearConfirmOpen.value = true;
}

function runClearAfterConfirm(): void {
  runClearCanvas();
  clearConfirmOpen.value = false;
}

function runClearCanvas(): void {
  if (props.desktopDrawingState.desktopEnabled) {
    desktopScreenRef.value?.clear();
  }
  if (props.mobileDrawingState.mobileEnabled) {
    mobileScreenRef.value?.clear();
  }
}

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

function getDesktopTextBoxes(): BuilderTextBox[] {
  return ((desktopScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.getTextBoxes?.() as BuilderTextBox[] | undefined) ?? [];
}

function getMobileTextBoxes(): BuilderTextBox[] {
  return ((mobileScreenRef.value as ScreenCardRefShape | null)?.overlayRef?.getTextBoxes?.() as BuilderTextBox[] | undefined) ?? [];
}

defineExpose({
  getDesktopTextBoxes,
  getMobileTextBoxes,
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
  padding: var(--space-lg) var(--space-lg) 3.5rem;
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

.drawing-clear-dialog {
  max-width: 26rem;
}

.drawing-clear-dialog__body {
  padding: var(--space-lg);
}

.drawing-clear-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
