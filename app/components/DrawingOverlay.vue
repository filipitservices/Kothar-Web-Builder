<template>
  <div v-show="isEnabled" class="canvas-overlay" :style="{ width: `${width}px`, height: `${height}px` }">
    <div 
      class="canvas-container"
      ref="canvasContainerRef"
      :style="{ width: `${width}px`, height: `${height}px` }"
      @mousedown="handleMouseDown"
      @click="handleCanvasClick"
    >
      <VueDrawingCanvas
        ref="localCanvasRef"
        :canvas-id="canvasId"
        :initial-image="strokes"
        :width="width"
        :height="height"
        :stroke-type="drawingState.strokeType"
        :color="drawingState.color"
        :line-width="drawingState.lineWidth"
        :line-cap="'round'"
        :line-join="'round'"
        :lock="drawingState.isTextMode"
        background-color="transparent"
      />

      <div 
        class="text-layer"
        :style="{ width: `${width}px`, height: `${height}px`, pointerEvents: drawingState.isTextMode ? 'auto' : 'none' }"
      >
        <!-- Drag preview box -->
        <div
          v-if="isDraggingNewBox"
          class="text-box-preview"
          :style="dragPreviewStyle"
        />

        <!-- Existing text boxes -->
        <TextBox
          v-for="textBox in textBoxes"
          :key="textBox.id"
          :id="textBox.id"
          :x="textBox.x"
          :y="textBox.y"
          :width="textBox.width"
          :height="textBox.height"
          :text="textBox.text"
          :font-size="textBox.fontSize"
          :color="textBox.color"
          :font-family="textBox.fontFamily"
          :is-selected="selectedTextBoxId === textBox.id"
          @update:x="(val) => updateTextBox(textBox.id, 'x', val)"
          @update:y="(val) => updateTextBox(textBox.id, 'y', val)"
          @update:width="(val) => updateTextBox(textBox.id, 'width', val)"
          @update:height="(val) => updateTextBox(textBox.id, 'height', val)"
          @update:text="(val) => updateTextBox(textBox.id, 'text', val)"
          @select="selectTextBox(textBox.id)"
          @delete="deleteTextBox(textBox.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import TextBox from './TextBox.vue';
import { useTextBoxManager } from '~/composables/useTextBoxManager';
import { useDragToCreate } from '~/composables/useDragToCreate';

const props = defineProps({
  canvasId: {
    type: String,
    required: true
  },
  isEnabled: {
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
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  }
});

const emit = defineEmits([
  'update:strokeType',
  'update:color',
  'update:lineWidth',
  'toggle-text-mode',
  'update:textFontSize',
  'update:textColor',
  'update:textFontFamily'
]);

const localCanvasRef = ref(null);
const canvasContainerRef = ref(null);

// Text box management
const { textBoxes, selectedTextBoxId, createTextBox, updateTextBox, selectTextBox, deleteTextBox, clearAll, setupWatchers: setupTextBoxWatchers } = useTextBoxManager({
  defaultFontSize: () => props.drawingState.textFontSize,
  defaultColor: () => props.drawingState.textColor,
  defaultFontFamily: () => props.drawingState.textFontFamily
});

// Drag-to-create interaction
const { isDraggingNewBox, dragPreviewStyle, handleMouseDown, handleCanvasClick } = useDragToCreate({
  canvasContainerRef,
  canvasWidth: () => props.width,
  canvasHeight: () => props.height,
  isTextMode: () => props.drawingState.isTextMode,
  onTextBoxCreate: (x, y, w, h) => {
    createTextBox(x, y, w, h);
  }
});

const onUpdateStrokeType = (val) => emit('update:strokeType', val);
const onUpdateColor = (val) => emit('update:color', val);
const onUpdateLineWidth = (val) => emit('update:lineWidth', val);
const onToggleTextMode = () => emit('toggle-text-mode');

const onUpdateTextFontSize = (val) => {
  if (selectedTextBoxId.value) {
    updateTextBox(selectedTextBoxId.value, 'fontSize', val);
  }
  emit('update:textFontSize', val);
};

const onUpdateTextColor = (val) => {
  if (selectedTextBoxId.value) {
    updateTextBox(selectedTextBoxId.value, 'color', val);
  }
  emit('update:textColor', val);
};

const onUpdateTextFontFamily = (val) => {
  if (selectedTextBoxId.value) {
    updateTextBox(selectedTextBoxId.value, 'fontFamily', val);
  }
  emit('update:textFontFamily', val);
};

const handleUndo = () => {
  localCanvasRef.value?.undo();
};

const handleRedo = () => {
  localCanvasRef.value?.redo();
};

const handleClear = () => {
  if (props.drawingState.isTextMode) {
    clearAll();
  } else {
    localCanvasRef.value?.reset();
  }
};

// Setup text box watchers
setupTextBoxWatchers(
  () => props.drawingState.isTextMode,
  () => props.drawingState.textFontSize
);

// Watch for strokes changes and redraw canvas when strokes are restored
watch(() => props.strokes, (newStrokes) => {
  if (newStrokes && newStrokes.length > 0) {
    // Use nextTick to ensure canvas is ready before redrawing
    nextTick(() => {
      localCanvasRef.value?.redraw();
    });
  }
}, { deep: true });

// Expose methods for parent component
defineExpose({
  undo: handleUndo,
  redo: handleRedo,
  clear: handleClear,
  canvas: localCanvasRef,
  createTextBox,
  getTextBoxes: () => textBoxes.value,
  clearTextBoxes: () => clearAll()
});
</script>

<style scoped>
.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: auto;
}

.canvas-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.text-layer {
  position: absolute;
  top: 0;
  left: 0;
}

.text-box-preview {
  position: absolute;
  border: 2px dashed rgba(102, 126, 234, 0.8);
  background: rgba(102, 126, 234, 0.1);
  pointer-events: none;
  z-index: 1000;
}

.canvas-container :deep(.vue-drawing-canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  cursor: crosshair;
}

.canvas-container :deep(.vue-drawing-canvas:focus) {
  outline: none;
}
</style>
