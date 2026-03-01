import { ref, reactive } from 'vue';

type ScreenType = 'desktop' | 'mobile';
type StrokeType = 'dash' | 'line' | 'circle' | 'square' | 'triangle' | 'half_triangle';

interface DrawingState {
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  strokeType: StrokeType;
  color: string;
  lineWidth: number;
  isTextMode: boolean;
  textFontSize: number;
  textColor: string;
  textFontFamily: string;
}

const defaultState: DrawingState = {
  desktopEnabled: false,
  mobileEnabled: false,
  strokeType: 'dash',
  color: '#000000',
  lineWidth: 3,
  isTextMode: false,
  textFontSize: 16,
  textColor: '#000000',
  textFontFamily: 'Arial',
};

/**
 * useDrawing Composable
 * Manages drawing state for both desktop and mobile canvases
 */
export const useDrawing = () => {
  const desktopDrawingState = reactive<DrawingState>({ ...defaultState });
  const mobileDrawingState = reactive<DrawingState>({ ...defaultState });
  const desktopStrokes = ref<unknown[]>([]);
  const mobileStrokes = ref<unknown[]>([]);
  const desktopDrawingImage = ref<string>('');
  const mobileDrawingImage = ref<string>('');
  const desktopCanvasRef = ref<{ getAllStrokes?: () => unknown[]; image?: string; isEmpty?: () => boolean; reset?: () => void; undo?: () => void; redo?: () => void } | null>(null);
  const mobileCanvasRef = ref<{ getAllStrokes?: () => unknown[]; image?: string; isEmpty?: () => boolean; reset?: () => void; undo?: () => void; redo?: () => void } | null>(null);

  // Helper to get state by screen type
  const getState = (screen: ScreenType): DrawingState => 
    screen === 'desktop' ? desktopDrawingState : mobileDrawingState;

  const getCanvasRef = (screen: ScreenType) => 
    screen === 'desktop' ? desktopCanvasRef.value : mobileCanvasRef.value;

  const getStrokes = (screen: ScreenType) =>
    screen === 'desktop' ? desktopStrokes : mobileStrokes;

  const getDrawingImage = (screen: ScreenType) =>
    screen === 'desktop' ? desktopDrawingImage : mobileDrawingImage;

  // Canvas refs
  const setCanvasRef = (screen: ScreenType, canvasRef: typeof desktopCanvasRef.value) => {
    if (screen === 'desktop') desktopCanvasRef.value = canvasRef;
    else mobileCanvasRef.value = canvasRef;
  };

  // Drawing state control
  const toggleDrawing = (screen: ScreenType) => {
    const state = getState(screen);
    const enabledKey = screen === 'desktop' ? 'desktopEnabled' : 'mobileEnabled';
    if (state[enabledKey]) {
      const canvas = getCanvasRef(screen);
      getStrokes(screen).value = canvas?.getAllStrokes() || [];
      getDrawingImage(screen).value = canvas?.image || '';
    }
    state[enabledKey] = !state[enabledKey];
  };

  const setDrawingEnabled = (screen: ScreenType, enabled: boolean) => {
    const enabledKey = screen === 'desktop' ? 'desktopEnabled' : 'mobileEnabled';
    getState(screen)[enabledKey] = enabled;
  };

  // Style properties
  const setStrokeType = (screen: ScreenType, type: StrokeType) => {
    getState(screen).strokeType = type;
  };

  const setColor = (screen: ScreenType, color: string) => {
    getState(screen).color = color;
  };

  const setLineWidth = (screen: ScreenType, width: number) => {
    getState(screen).lineWidth = Math.max(1, Math.min(width, 50));
  };

  // Text mode
  const toggleTextMode = (screen: ScreenType) => {
    getState(screen).isTextMode = !getState(screen).isTextMode;
  };

  const setTextFontSize = (screen: ScreenType, size: number) => {
    getState(screen).textFontSize = Math.max(8, Math.min(size, 22));
  };

  const setTextColor = (screen: ScreenType, color: string) => {
    getState(screen).textColor = color;
  };

  const setTextFontFamily = (screen: ScreenType, family: string) => {
    getState(screen).textFontFamily = family;
  };

  /** Update desktop drawing state with a partial; use from parent instead of mutating state. */
  const updateDesktopDrawingState = (partial: Partial<DrawingState>) => {
    Object.assign(desktopDrawingState, partial);
  };

  /** Update mobile drawing state with a partial; use from parent instead of mutating state. */
  const updateMobileDrawingState = (partial: Partial<DrawingState>) => {
    Object.assign(mobileDrawingState, partial);
  };

  // Canvas operations
  const resetState = () => {
    Object.assign(desktopDrawingState, defaultState);
    Object.assign(mobileDrawingState, defaultState);
  };

  const canvasOperation = (screen: ScreenType | 'both', operation: string) => {
    const perform = (s: ScreenType) => getCanvasRef(s)?.[operation]?.();
    if (screen === 'both') {
      perform('desktop');
      perform('mobile');
    } else {
      perform(screen);
    }
  };

  const clearCanvas = (screen: ScreenType | 'both') => canvasOperation(screen, 'reset');
  const undo = (screen: ScreenType | 'both') => canvasOperation(screen, 'undo');
  const redo = (screen: ScreenType | 'both') => canvasOperation(screen, 'redo');

  const isEmpty = (screen: ScreenType): boolean => getCanvasRef(screen)?.isEmpty?.() ?? true;

  const getAllStrokes = (screen: ScreenType) => getCanvasRef(screen)?.getAllStrokes?.() ?? [];

  const downloadCanvas = (screen: ScreenType, filename: string = 'drawing') => {
    const canvas = getCanvasRef(screen);
    if (canvas?.image && !canvas.isEmpty?.()) {
      const link = document.createElement('a');
      link.href = canvas.image;
      link.download = `${filename}-${screen}.png`;
      link.click();
    }
  };

  const isAnyDrawingActive = () => 
    desktopDrawingState.desktopEnabled || mobileDrawingState.mobileEnabled;

  return {
    desktopDrawingState,
    mobileDrawingState,
    desktopStrokes,
    mobileStrokes,
    desktopDrawingImage,
    mobileDrawingImage,
    desktopCanvasRef,
    mobileCanvasRef,
    setCanvasRef,
    toggleDrawing,
    setDrawingEnabled,
    setStrokeType,
    setColor,
    setLineWidth,
    toggleTextMode,
    setTextFontSize,
    setTextColor,
    setTextFontFamily,
    updateDesktopDrawingState,
    updateMobileDrawingState,
    resetState,
    clearCanvas,
    undo,
    redo,
    isEmpty,
    getAllStrokes,
    downloadCanvas,
    isAnyDrawingActive
  };
};
