import { ref, computed, type Ref } from 'vue';

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface UseDragToCreateOptions {
  canvasContainerRef: Ref<HTMLDivElement | null>;
  canvasWidth: () => number;
  canvasHeight: () => number;
  isTextMode: () => boolean;
  onTextBoxCreate: (x: number, y: number, width: number, height: number) => void;
}

const MIN_DRAG_DISTANCE = 20;

export function useDragToCreate(options: UseDragToCreateOptions) {
  const isDraggingNewBox = ref(false);
  const dragState: Ref<DragState> = ref({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });
  const skipNextClick = ref(false);

  const dragPreviewStyle = computed(() => {
    const { startX, startY, currentX, currentY } = dragState.value;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    };
  });

  const getMousePosition = (e: MouseEvent) => {
    const rect = options.canvasContainerRef.value?.getBoundingClientRect();
    if (!rect) return null;
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const constrainPosition = (x: number, y: number) => {
    return {
      x: Math.max(0, Math.min(x, options.canvasWidth())),
      y: Math.max(0, Math.min(y, options.canvasHeight()))
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!options.isTextMode()) return;
    if (e.target instanceof HTMLElement && e.target.closest('.text-box')) return;

    const pos = getMousePosition(e);
    if (!pos) return;

    isDraggingNewBox.value = true;
    dragState.value = {
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingNewBox.value) return;

    const pos = getMousePosition(e);
    if (!pos) return;

    const constrained = constrainPosition(pos.x, pos.y);
    dragState.value.currentX = constrained.x;
    dragState.value.currentY = constrained.y;
  };

  const handleMouseUp = (e?: MouseEvent) => {
    if (!isDraggingNewBox.value) return;

    const { startX, startY, currentX, currentY } = dragState.value;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    if (width > MIN_DRAG_DISTANCE && height > MIN_DRAG_DISTANCE) {
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      options.onTextBoxCreate(x, y, width, height);
      skipNextClick.value = true;
    }

    isDraggingNewBox.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    e?.preventDefault();
    e?.stopPropagation();
  };

  const handleCanvasClick = (e: MouseEvent) => {
    if (!options.isTextMode()) return;

    if (skipNextClick.value) {
      skipNextClick.value = false;
      return;
    }

    if (e.target instanceof HTMLElement && e.target.closest('.text-box')) return;
  };

  const reset = () => {
    isDraggingNewBox.value = false;
    skipNextClick.value = false;
    dragState.value = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
  };

  return {
    isDraggingNewBox,
    dragPreviewStyle,
    handleMouseDown,
    handleCanvasClick,
    reset
  };
}
