import { ref, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue';

interface UseCanvasDimensionsOptions {
  isDrawingEnabled: () => boolean;
}

export function useCanvasDimensions(
  screenContentRef: Ref<HTMLDivElement | null>,
  initialWidth: number,
  initialHeight: number,
  options: UseCanvasDimensionsOptions
) {
  const canvasWidth = ref(initialWidth);
  const canvasHeight = ref(initialHeight);
  
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let lastMeasuredHeight = 0;
  let lastMeasuredWidth = 0;

  const updateDimensions = () => {
    if (!screenContentRef.value) return;
    
    const width = screenContentRef.value.clientWidth;
    const height = screenContentRef.value.scrollHeight;
    
    // Only update if dimensions changed
    if (width !== lastMeasuredWidth || height !== lastMeasuredHeight) {
      lastMeasuredWidth = width;
      lastMeasuredHeight = height;
      canvasWidth.value = width;
      canvasHeight.value = height;
    }
  };

  const initializeObservers = () => {
    if (!screenContentRef.value) return;
    
    cleanupObservers();
    
    // ResizeObserver tracks element size changes
    resizeObserver = new ResizeObserver(() => {
      if (options.isDrawingEnabled()) {
        nextTick(() => updateDimensions());
      }
    });
    resizeObserver.observe(screenContentRef.value);
    
    // MutationObserver tracks DOM structure changes
    mutationObserver = new MutationObserver(() => {
      if (options.isDrawingEnabled()) {
        requestAnimationFrame(() => {
          nextTick(() => updateDimensions());
        });
      }
    });
    mutationObserver.observe(screenContentRef.value, {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: false
    });
  };

  const cleanupObservers = () => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    resizeObserver = null;
    mutationObserver = null;
  };

  const setupWatchers = (listProp: () => any) => {
    watch(
      () => options.isDrawingEnabled(),
      (enabled) => {
        if (enabled) {
          nextTick(() => {
            updateDimensions();
            if (!resizeObserver && !mutationObserver) {
              initializeObservers();
            }
          });
        }
      }
    );

    watch(
      listProp,
      () => {
        if (options.isDrawingEnabled()) {
          requestAnimationFrame(() => {
            nextTick(() => updateDimensions());
          });
        }
      },
      { deep: true }
    );
  };

  const setup = (listProp: () => any) => {
    if (options.isDrawingEnabled()) {
      nextTick(() => {
        initializeObservers();
      });
    }
    setupWatchers(listProp);
  };

  const cleanup = () => {
    cleanupObservers();
  };

  return {
    canvasWidth,
    canvasHeight,
    updateDimensions,
    setup,
    cleanup
  };
}
