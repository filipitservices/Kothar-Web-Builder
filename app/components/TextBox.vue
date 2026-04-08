<template>
  <div
    class="text-box"
    :class="{ selected: isSelected }"
    :style="textBoxStyle"
    @mousedown="handleMouseDown"
  >
    <textarea
      v-if="isEditing"
      ref="textareaRef"
      v-model="localText"
      :style="textStyle"
      class="text-input"
      @blur="finishEditing"
      @mousedown.stop
      @keydown.esc="finishEditing"
    />
    <div
      v-else
      class="text-display"
      :style="textStyle"
      @dblclick="startEditing"
    >
      {{ localText || 'Double-click to edit' }}
    </div>
    
    <div v-if="isSelected && !isEditing" class="resize-handles">
      <div
        v-for="handle in RESIZE_HANDLES"
        :key="handle.position"
        :class="['resize-handle', handle.position]"
        :style="{ cursor: handle.cursor }"
        @mousedown.stop="startInteraction($event, handle.position)"
      />
    </div>

    <button 
      v-if="isSelected && !isEditing" 
      class="delete-button"
      @click.stop="$emit('delete')"
      title="Delete this text box"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue';
import type { BuilderTextEmphasis } from '~/types/order';
import { styleFromTextEmphasis } from '~/utils/builderTextEmphasis';

interface TextBoxProps {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize: number;
  color: string;
  emphasis: BuilderTextEmphasis;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<TextBoxProps>(), {
  width: 200,
  height: 60,
  text: '',
  isSelected: false
});

const emit = defineEmits<{
  'update:x': [value: number];
  'update:y': [value: number];
  'update:width': [value: number];
  'update:height': [value: number];
  'update:text': [value: string];
  select: [];
  delete: [];
}>();

const RESIZE_HANDLES = [
  { position: 'nw', cursor: 'nw-resize' },
  { position: 'ne', cursor: 'ne-resize' },
  { position: 'sw', cursor: 'sw-resize' },
  { position: 'se', cursor: 'se-resize' }
] as const;

const MIN_WIDTH = 100;
const MIN_HEIGHT = 40;

const localText = ref(props.text);
const isEditing = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Unified interaction tracking
const interaction = ref<{
  type: 'drag' | 'resize' | null;
  direction?: string;
  startX: number;
  startY: number;
  startPos: { x: number; y: number };
  startSize: { width: number; height: number };
} | null>(null);

const textBoxStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`
}));

const textStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  color: props.color,
  fontWeight: styleFromTextEmphasis(props.emphasis).fontWeight,
  fontStyle: styleFromTextEmphasis(props.emphasis).fontStyle
}));

watch(() => props.text, (newVal) => {
  localText.value = newVal;
});

watch(localText, (newVal) => {
  emit('update:text', newVal);
});

const startInteraction = (e: MouseEvent, direction?: string) => {
  if (isEditing.value) return;

  const interactionType = direction ? 'resize' : 'drag';
  interaction.value = {
    type: interactionType,
    direction,
    startX: e.clientX,
    startY: e.clientY,
    startPos: { x: props.x, y: props.y },
    startSize: { width: props.width, height: props.height }
  };

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', stopInteraction);
};

const handleMouseDown = (e: MouseEvent) => {
  if (isEditing.value) return;
  emit('select');
  
  if (e.target instanceof HTMLElement &&
      (e.target.classList.contains('text-display') || 
       e.target.classList.contains('text-box'))) {
    startInteraction(e);
  }
};

const handleMove = (e: MouseEvent) => {
  if (!interaction.value) return;

  const { type, direction, startX, startY, startPos, startSize } = interaction.value;
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  if (type === 'drag') {
    emit('update:x', startPos.x + deltaX);
    emit('update:y', startPos.y + deltaY);
  } else if (type === 'resize' && direction) {
    updateResize(direction, deltaX, deltaY, startPos, startSize);
  }
};

const updateResize = (
  direction: string,
  deltaX: number,
  deltaY: number,
  startPos: { x: number; y: number },
  startSize: { width: number; height: number }
) => {
  let x = startPos.x;
  let y = startPos.y;
  let width = startSize.width;
  let height = startSize.height;

  // Horizontal resize
  if (direction.includes('e')) {
    width = Math.max(MIN_WIDTH, startSize.width + deltaX);
  }
  if (direction.includes('w')) {
    width = Math.max(MIN_WIDTH, startSize.width - deltaX);
    x = startPos.x + (startSize.width - width);
  }

  // Vertical resize
  if (direction.includes('s')) {
    height = Math.max(MIN_HEIGHT, startSize.height + deltaY);
  }
  if (direction.includes('n')) {
    height = Math.max(MIN_HEIGHT, startSize.height - deltaY);
    y = startPos.y + (startSize.height - height);
  }

  emit('update:x', x);
  emit('update:y', y);
  emit('update:width', width);
  emit('update:height', height);
};

const stopInteraction = () => {
  interaction.value = null;
  document.removeEventListener('mousemove', handleMove);
  document.removeEventListener('mouseup', stopInteraction);
};

const startEditing = () => {
  if (!props.isSelected) return;
  isEditing.value = true;
  nextTick(() => textareaRef.value?.focus());
};

const finishEditing = () => {
  isEditing.value = false;
};

// Cleanup event listeners on unmount
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMove);
  document.removeEventListener('mouseup', stopInteraction);
});

defineExpose({
  startEditing,
  finishEditing
});
</script>

<style scoped>
.text-box {
  position: absolute;
  cursor: move;
  padding: 8px;
  box-sizing: border-box;
  transition: box-shadow 0.2s ease;
}

.text-box.selected {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.8);
  background: rgba(102, 126, 234, 0.05);
}

.text-input,
.text-display {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.4;
  padding: 0;
  margin: 0;
}

.text-input {
  font-family: inherit;
}

.text-display {
  cursor: move;
  user-select: none;
  display: flex;
  align-items: flex-start;
}

.text-display:empty::before {
  content: 'Double-click to edit';
  color: rgba(0, 0, 0, 0.4);
  font-style: italic;
}

.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.8);
  border-radius: 50%;
  pointer-events: all;
}

.resize-handle.nw {
  top: -5px;
  left: -5px;
}

.resize-handle.ne {
  top: -5px;
  right: -5px;
}

.resize-handle.sw {
  bottom: -5px;
  left: -5px;
}

.resize-handle.se {
  bottom: -5px;
  right: -5px;
}

.resize-handle:hover {
  background: rgba(102, 126, 234, 0.8);
}

.delete-button {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ff4444;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
  transition: all 0.2s ease;
  z-index: 1001;
}

.delete-button:hover {
  background: #dd0000;
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.6);
  transform: scale(1.1);
}

.delete-button:active {
  transform: scale(0.95);
}
</style>
