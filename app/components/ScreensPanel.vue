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
      @clear="onClearToolbar"
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
        @click.self="closeClearConfirm"
      >
        <div
          class="modal-container overlay-clear-confirm-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="clearDialogTitleId"
          tabindex="-1"
          ref="clearDialogRef"
          @keydown.escape.prevent="closeClearConfirm"
        >
          <div class="modal-header">
            <h2 :id="clearDialogTitleId" class="text-title">{{ clearConfirmTitle }}</h2>
          </div>
          <div class="modal-body overlay-clear-confirm-dialog__body">
            <p class="text-muted">{{ clearConfirmDescription }}</p>
          </div>
          <div class="modal-footer overlay-clear-confirm-dialog__footer">
            <button type="button" class="btn btn--secondary" @click="closeClearConfirm">
              Cancel
            </button>
            <button type="button" class="btn btn--danger" @click="confirmClearOverlay">
              Clear all
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  toRef,
  useId,
  type ComputedRef,
} from 'vue';
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
const clearDialogRef = ref<HTMLElement | null>(null);
const clearDialogTitleId = useId();
const clearConfirmOpen = ref(false);
const clearConfirmMode = ref<'draw' | 'text' | null>(null);

const clearConfirmTitle = computed(() =>
  clearConfirmMode.value === 'text'
    ? 'Discard all text annotations?'
    : 'Discard all drawing strokes?',
);

const clearConfirmDescription = computed(() => {
  if (clearConfirmMode.value === 'text') {
    return 'This removes every text box on the desktop and mobile previews. This cannot be undone.';
  }
  return 'This removes every drawing stroke on the desktop and mobile previews. This cannot be undone.';
});

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

function closeClearConfirm(): void {
  clearConfirmOpen.value = false;
  clearConfirmMode.value = null;
}

function confirmClearOverlay(): void {
  closeClearConfirm();
  runClearOverlay();
}

function onClearToolbar(payload: { isTextMode: boolean }): void {
  const isText = payload.isTextMode;
  const desktopCard = desktopScreenRef.value as ScreenCardRefShape | null;
  const mobileCard = mobileScreenRef.value as ScreenCardRefShape | null;

  if (isText) {
    const hasText =
      (props.desktopDrawingState.desktopEnabled && desktopCard?.hasTextWorkToClear?.() === true) ||
      (props.mobileDrawingState.mobileEnabled && mobileCard?.hasTextWorkToClear?.() === true);
    if (!hasText) {
      runClearOverlay();
      return;
    }
    clearConfirmMode.value = 'text';
    clearConfirmOpen.value = true;
    void nextTick(() => {
      clearDialogRef.value?.focus();
    });
    return;
  }
  const hasDraw =
    (props.desktopDrawingState.desktopEnabled && desktopCard?.hasDrawWorkToClear?.() === true) ||
    (props.mobileDrawingState.mobileEnabled && mobileCard?.hasDrawWorkToClear?.() === true);
  if (!hasDraw) {
    runClearOverlay();
    return;
  }
  clearConfirmMode.value = 'draw';
  clearConfirmOpen.value = true;
  void nextTick(() => {
    clearDialogRef.value?.focus();
  });
}

function runClearOverlay(): void {
  if (props.desktopDrawingState.desktopEnabled) {
    desktopScreenRef.value?.clear();
  }
  if (props.mobileDrawingState.mobileEnabled) {
    mobileScreenRef.value?.clear();
  }
}

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

.overlay-clear-confirm-dialog {
  max-width: 26rem;
}

.overlay-clear-confirm-dialog__body {
  padding: var(--space-lg);
}

.overlay-clear-confirm-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}
</style>
