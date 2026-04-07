import { computed, onMounted, onUnmounted, ref } from 'vue';

const BUILDER_MIN_WIDTH = 1025;

export function useBuilderViewportSupport() {
  /**
   * Start null on server and client so the first paint matches during SSR hydration.
   * Width is applied in onMounted (and on resize) so we never read window during setup.
   */
  const viewportWidth = ref<number | null>(null);
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
