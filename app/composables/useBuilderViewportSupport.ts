import { computed, onMounted, onUnmounted, ref } from 'vue';

const BUILDER_MIN_WIDTH = 1025;

export function useBuilderViewportSupport() {
  const viewportWidth = ref<number | null>(null);
  const isSupported = computed(() =>
    viewportWidth.value !== null && viewportWidth.value >= BUILDER_MIN_WIDTH
  );
  const isReady = computed(() => viewportWidth.value !== null);

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
  };
}
