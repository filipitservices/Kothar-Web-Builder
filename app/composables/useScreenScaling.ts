import { ref, nextTick } from 'vue';

export function useScreenScaling() {
  const DESKTOP_NATURAL_WIDTH = 700;
  const DESKTOP_NATURAL_HEIGHT = 610; // 550 + 40 margin + 20 stand
  const MOBILE_NATURAL_WIDTH = 330;
  const MOBILE_NATURAL_HEIGHT = 600;

  const desktopScale = ref(1);
  const mobileScale = ref(1);
  const desktopScaledWidth = ref(DESKTOP_NATURAL_WIDTH);
  const desktopScaledHeight = ref(DESKTOP_NATURAL_HEIGHT);
  const mobileScaledWidth = ref(MOBILE_NATURAL_WIDTH);
  const mobileScaledHeight = ref(MOBILE_NATURAL_HEIGHT);
  const screensPanelRef = ref<HTMLElement | null>(null);

  const calculateScaling = () => {
    const panel = screensPanelRef.value;
    if (!panel) return;

    const inner = panel.querySelector('.screens-inner') as HTMLElement | null;
    const savedInnerScrollTop = inner ? inner.scrollTop : 0;

    const { clientWidth: availableWidth, clientHeight: availableHeight } = panel;
    
    // Measure fixed-height panels (AI chat is overlay, does not consume layout space)
    const fixedPanels = panel.querySelectorAll('.drawing-controls-panel');
    const consumedHeight = Array.from(fixedPanels).reduce((sum, el) => sum + (el as HTMLElement).offsetHeight, 0);
    const gaps = fixedPanels.length * 12;
    const usableHeight = availableHeight - consumedHeight - gaps - 40;

    const isStacked = window.innerWidth < 1100;
    const gap = 40;
    const padding = 20;

    let newDesktopScale: number, newMobileScale: number;

    if (isStacked) {
      const usableWidth = availableWidth - padding * 2;
      const totalHeight = DESKTOP_NATURAL_HEIGHT + MOBILE_NATURAL_HEIGHT + gap;
      const heightScale = usableHeight / totalHeight;

      newDesktopScale = Math.min(1, usableWidth / DESKTOP_NATURAL_WIDTH, heightScale);
      newMobileScale = Math.min(1, usableWidth / MOBILE_NATURAL_WIDTH, heightScale);
    } else {
      const totalWidth = DESKTOP_NATURAL_WIDTH + MOBILE_NATURAL_WIDTH;
      const widthScale = (availableWidth - gap - padding * 2) / totalWidth;
      const heightScale = usableHeight / Math.max(DESKTOP_NATURAL_HEIGHT, MOBILE_NATURAL_HEIGHT);
      
      newDesktopScale = newMobileScale = Math.min(1, widthScale, heightScale);
    }

    desktopScale.value = newDesktopScale;
    mobileScale.value = newMobileScale;
    desktopScaledWidth.value = DESKTOP_NATURAL_WIDTH * newDesktopScale;
    desktopScaledHeight.value = DESKTOP_NATURAL_HEIGHT * newDesktopScale;
    mobileScaledWidth.value = MOBILE_NATURAL_WIDTH * newMobileScale;
    mobileScaledHeight.value = MOBILE_NATURAL_HEIGHT * newMobileScale;

    if (inner && savedInnerScrollTop > 0) {
      requestAnimationFrame(() => {
        const el = panel.querySelector('.screens-inner') as HTMLElement | null;
        if (!el) return;
        const max = Math.max(0, el.scrollHeight - el.clientHeight);
        el.scrollTop = Math.min(savedInnerScrollTop, max);
      });
    }
  };

  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  let mutationDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;

  /** Coalesce subtree mutations (e.g. drag-and-drop DOM churn) so scaling does not thrash outer scroll. */
  const MUTATION_SCALE_DEBOUNCE_MS = 50;

  const handleWindowResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(calculateScaling, 100);
  };

  const handlePanelResize = () => {
    calculateScaling();
  };

  const handlePanelMutation = () => {
    if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer);
    mutationDebounceTimer = setTimeout(() => {
      mutationDebounceTimer = null;
      calculateScaling();
    }, MUTATION_SCALE_DEBOUNCE_MS);
  };

  const initializeScaling = async () => {
    await nextTick();
    calculateScaling();

    window.addEventListener('resize', handleWindowResize);

    if (screensPanelRef.value) {
      resizeObserver = new ResizeObserver(handlePanelResize);
      resizeObserver.observe(screensPanelRef.value);

      const fixedPanels = screensPanelRef.value.querySelectorAll('.drawing-controls-panel');
      fixedPanels.forEach(el => resizeObserver!.observe(el as HTMLElement));

      mutationObserver = new MutationObserver(handlePanelMutation);
      mutationObserver.observe(screensPanelRef.value, { childList: true, subtree: true });
    }
  };

  const cleanupScaling = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    if (mutationDebounceTimer) clearTimeout(mutationDebounceTimer);
    mutationDebounceTimer = null;
    window.removeEventListener('resize', handleWindowResize);
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
  };

  return {
    // Constants
    DESKTOP_NATURAL_WIDTH,
    DESKTOP_NATURAL_HEIGHT,
    MOBILE_NATURAL_WIDTH,
    MOBILE_NATURAL_HEIGHT,

    // State
    desktopScale,
    mobileScale,
    desktopScaledWidth,
    desktopScaledHeight,
    mobileScaledWidth,
    mobileScaledHeight,
    screensPanelRef,

    // Methods
    calculateScaling,
    initializeScaling,
    cleanupScaling
  };
}
