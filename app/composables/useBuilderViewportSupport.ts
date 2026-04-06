import { computed, onMounted, onUnmounted, ref } from 'vue';

const BUILDER_MIN_WIDTH = 1025;

function readViewportWidth(): number | null {
  if (!import.meta.client) {
    return null;
  }
  return window.innerWidth;
}

export function useBuilderViewportSupport() {
  /** Synchronous on client so first paint matches viewport (avoids preview flash on narrow screens). */
  const viewportWidth = ref<number | null>(readViewportWidth());
  const isSupported = computed(() =>
    viewportWidth.value !== null && viewportWidth.value >= BUILDER_MIN_WIDTH
  );
  const isReady = computed(() => viewportWidth.value !== null);
  /** Request/order edit pages: live preview column only at or above builder minimum width. */
  const showPreviewColumn = computed(
    () => viewportWidth.value !== null && viewportWidth.value >= BUILDER_MIN_WIDTH
  );

  const updateWidth = () => {
    viewportWidth.value = window.innerWidth;
  };

  onMounted(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
  });

  return {
    minWidth: BUILDER_MIN_WIDTH,
    viewportWidth,
    isSupported,
    isReady,
    showPreviewColumn,
  };
}
