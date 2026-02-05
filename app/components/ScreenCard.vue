<template>
  <div class="screen" :class="screenClass">
    <ScreenHeader
      :title="title"
      :is-enabled="isDrawingEnabled"
      @toggle="onToggleDrawing"
    />
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
      />

      <DrawingOverlay
        ref="overlayRef"
        :canvas-id="canvasId"
        :is-enabled="isDrawingEnabled"
        :drawing-state="drawingState"
        :strokes="strokes"
        :width="dynamicCanvasWidth"
        :height="dynamicCanvasHeight"
        @update:stroke-type="onUpdateStrokeType"
        @update:color="onUpdateColor"
        @update:line-width="onUpdateLineWidth"
        @toggle-text-mode="onToggleTextMode"
        @update:text-font-size="onUpdateTextFontSize"
        @update:text-color="onUpdateTextColor"
        @update:text-font-family="onUpdateTextFontFamily"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import ScreenHeader from './ScreenHeader.vue';
import DrawingOverlay from './DrawingOverlay.vue';
import ItemsList from './ItemsList.vue';
import { useCanvasDimensions } from '~/composables/useCanvasDimensions';

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
  }
});

const emit = defineEmits([
  'toggle-drawing',
  'update:strokeType',
  'update:color',
  'update:lineWidth',
  'toggle-text-mode',
  'update:textFontSize',
  'update:textColor',
  'update:textFontFamily',
  'undo',
  'redo',
  'clear',
  'list-change',
  'remove-item'
]);

const overlayRef = ref(null);
const screenContentRef = ref(null);
let savedScrollTop = 0;

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
          screenContentRef.value.scrollTop = savedScrollTop;
        }
        resolve(undefined);
      });
    });
  }
);

const onToggleDrawing = () => emit('toggle-drawing');
const onUpdateStrokeType = (val) => emit('update:strokeType', val);
const onUpdateColor = (val) => emit('update:color', val);
const onUpdateLineWidth = (val) => emit('update:lineWidth', val);
const onToggleTextMode = () => emit('toggle-text-mode');
const onUpdateTextFontSize = (val) => emit('update:textFontSize', val);
const onUpdateTextColor = (val) => emit('update:textColor', val);
const onUpdateTextFontFamily = (val) => emit('update:textFontFamily', val);
const onRemove = (id) => emit('remove-item', id);

const undo = () => overlayRef.value?.undo();
const redo = () => overlayRef.value?.redo();
const clear = () => overlayRef.value?.clear();

// Initialize canvas dimension tracking with list watcher
onMounted(() => {
  setupCanvasDimensions(() => props.list);
});

onUnmounted(() => {
  cleanupCanvasDimensions();
});

defineExpose({ overlayRef, undo, redo, clear });
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
  transition: all 0.3s ease;
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
