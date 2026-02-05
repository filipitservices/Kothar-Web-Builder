<template>
  <div class="screens-panel" ref="screensPanelRef">
    <!-- Screens -->
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
          :style="{ transform: `scale(${desktopScale})`, transformOrigin: 'top center' }"
          @undo="() => desktopScreenRef?.undo()"
          @redo="() => desktopScreenRef?.redo()"
          @clear="() => desktopScreenRef?.clear()"
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
          :style="{ transform: `scale(${mobileScale})`, transformOrigin: 'top center' }"
          @undo="() => mobileScreenRef?.undo()"
          @redo="() => mobileScreenRef?.redo()"
          @clear="() => mobileScreenRef?.clear()"
          @remove-item="removeMobileItem"
        />
      </div>
    </div>

    <!-- Drawing Controls Panel -->
    <DrawingControlsPanel
      :desktop-drawing-state="props.desktopDrawingState"
      :mobile-drawing-state="props.mobileDrawingState"
      :sync-screens="syncScreens"
      @update:desktop-drawing-state="handleDesktopStateUpdate"
      @update:mobile-drawing-state="handleMobileStateUpdate"
      @update:sync-screens="(val) => syncScreens = val"
      @undo="handleUndo"
      @redo="handleRedo"
      @clear="handleClear"
    />

    <!-- AI Chat Panel -->
    <AiChatPanel />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useScreenScaling } from '~/composables/useScreenScaling';
import { useListSyncing } from '~/composables/useListSyncing';
import ScreenCard from './ScreenCard.vue';
import DrawingControlsPanel from './DrawingControlsPanel.vue';
import AiChatPanel from './AiChatPanel.vue';

const props = defineProps({
  desktopCanvasWidth: { type: Number, required: true },
  desktopCanvasHeight: { type: Number, required: true },
  mobileCanvasWidth: { type: Number, required: true },
  mobileCanvasHeight: { type: Number, required: true },
  desktopList: { type: Array, required: true },
  mobileList: { type: Array, required: true },
  desktopDrawingState: { type: Object, required: true },
  mobileDrawingState: { type: Object, required: true },
  desktopStrokes: { type: Array, required: true },
  mobileStrokes: { type: Array, required: true }
});

const emit = defineEmits([
  'toggle-desktop-drawing',
  'toggle-mobile-drawing',
  'toggle-desktop-text-mode',
  'toggle-mobile-text-mode',
  'update:desktopList',
  'update:mobileList',
  'update:desktopDrawingState',
  'update:mobileDrawingState',
  'set-desktop-canvas-ref',
  'set-mobile-canvas-ref'
]);

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
const desktopScreenRef = ref(null);
const mobileScreenRef = ref(null);
const syncScreens = ref(false);

// Local props mirroring
const desktopCanvasWidth = ref(props.desktopCanvasWidth);
const desktopCanvasHeight = ref(props.desktopCanvasHeight);
const mobileCanvasWidth = ref(props.mobileCanvasWidth);
const mobileCanvasHeight = ref(props.mobileCanvasHeight);

// Sync canvas dimensions from props
watch(() => props.desktopCanvasWidth, (val) => { desktopCanvasWidth.value = val; });
watch(() => props.desktopCanvasHeight, (val) => { desktopCanvasHeight.value = val; });
watch(() => props.mobileCanvasWidth, (val) => { mobileCanvasWidth.value = val; });
watch(() => props.mobileCanvasHeight, (val) => { mobileCanvasHeight.value = val; });

// Create proxy refs that sync with props (not snapshots)
const desktopListRef = computed({
  get: () => props.desktopList,
  set: (val) => emit('update:desktopList', val)
});

const mobileListRef = computed({
  get: () => props.mobileList,
  set: (val) => emit('update:mobileList', val)
});

// Initialize list syncing with live prop references
useListSyncing({
  desktopList: desktopListRef,
  mobileList: mobileListRef,
  syncEnabled: syncScreens,
  onDesktopListUpdate: (list) => emit('update:desktopList', list),
  onMobileListUpdate: (list) => emit('update:mobileList', list)
});

// Handle drawing state updates properly
const handleDesktopStateUpdate = (state) => {
  // Forward to parent - never mutate props
  emit('update:desktopDrawingState', state);
};

const handleMobileStateUpdate = (state) => {
  // Forward to parent - never mutate props
  emit('update:mobileDrawingState', state);
};

// Delete handlers
const removeDesktopItem = (id) => {
  const next = props.desktopList.filter((el) => el.id !== id);
  emit('update:desktopList', next);
};

const removeMobileItem = (id) => {
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
  if (desktopScreenRef.value?.overlayRef?.canvas) {
    emit('set-desktop-canvas-ref', desktopScreenRef.value.overlayRef.canvas);
  }
  if (mobileScreenRef.value?.overlayRef?.canvas) {
    emit('set-mobile-canvas-ref', mobileScreenRef.value.overlayRef.canvas);
  }
  await initializeScaling();
});

onUnmounted(() => cleanupScaling());

// Canvas ref updates when drawing is enabled
watch(() => props.desktopDrawingState.desktopEnabled, (enabled) => {
  if (enabled) {
    setTimeout(() => {
      if (desktopScreenRef.value?.overlayRef?.canvas) {
        emit('set-desktop-canvas-ref', desktopScreenRef.value.overlayRef.canvas);
      }
    }, 0);
  }
});

watch(() => props.mobileDrawingState.mobileEnabled, (enabled) => {
  if (enabled) {
    setTimeout(() => {
      if (mobileScreenRef.value?.overlayRef?.canvas) {
        emit('set-mobile-canvas-ref', mobileScreenRef.value.overlayRef.canvas);
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
  gap: 12px;
}

.screens-inner {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow: auto;
  padding: 20px;
  width: 100%;
  min-height: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.screens-inner::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.screen-scale-wrapper {
  position: relative;
  flex-shrink: 0;
}

.screen-scale-wrapper > .screen {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -350px; /* Half of desktop width (700px / 2) */
}

.screen-scale-wrapper > .screen.mobile-screen {
  margin-left: -165px; /* Half of mobile width (330px / 2) */
}

/* Stack screens vertically on smaller viewports */
@media (max-width: 1100px) {
  .screens-inner {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
}
</style>
