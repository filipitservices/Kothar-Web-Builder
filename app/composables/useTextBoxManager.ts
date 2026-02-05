import { ref, computed, watch, type Ref } from 'vue';

export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface UseTextBoxManagerOptions {
  defaultFontSize: () => number;
  defaultColor: () => string;
  defaultFontFamily: () => string;
}

const MIN_TEXTBOX_WIDTH = 100;
const MIN_TEXTBOX_HEIGHT = 40;
const MIN_DRAG_DISTANCE = 20;

export function useTextBoxManager(options: UseTextBoxManagerOptions) {
  const textBoxes: Ref<TextBox[]> = ref([]);
  const selectedTextBoxId: Ref<string | null> = ref(null);
  let textBoxIdCounter = 0;

  const createTextBox = (x: number, y: number, width: number, height: number) => {
    const newTextBox: TextBox = {
      id: `text-${textBoxIdCounter++}`,
      x,
      y,
      width: Math.max(width, MIN_TEXTBOX_WIDTH),
      height: Math.max(height, MIN_TEXTBOX_HEIGHT),
      text: '',
      fontSize: options.defaultFontSize(),
      color: options.defaultColor(),
      fontFamily: options.defaultFontFamily()
    };
    
    textBoxes.value.push(newTextBox);
    selectedTextBoxId.value = newTextBox.id;
    return newTextBox;
  };

  const updateTextBox = (id: string, property: keyof TextBox, value: any) => {
    const textBox = textBoxes.value.find(tb => tb.id === id);
    if (textBox) {
      (textBox as any)[property] = value;
    }
  };

  const selectTextBox = (id: string) => {
    selectedTextBoxId.value = id;
  };

  const deleteTextBox = (id: string) => {
    const index = textBoxes.value.findIndex(tb => tb.id === id);
    if (index > -1) {
      textBoxes.value.splice(index, 1);
      if (selectedTextBoxId.value === id) {
        selectedTextBoxId.value = null;
      }
    }
  };

  const clearAll = () => {
    textBoxes.value = [];
    selectedTextBoxId.value = null;
  };

  const setupWatchers = (
    isTextModeGetter: () => boolean,
    fontSizeGetter: () => number
  ) => {
    // Deselect when text mode disabled
    watch(
      () => isTextModeGetter(),
      (isTextMode) => {
        if (!isTextMode) {
          selectedTextBoxId.value = null;
        }
      }
    );

    // Update selected textbox font size
    watch(
      () => fontSizeGetter(),
      (newSize) => {
        if (selectedTextBoxId.value) {
          updateTextBox(selectedTextBoxId.value, 'fontSize', newSize);
        }
      }
    );
  };

  return {
    textBoxes,
    selectedTextBoxId,
    createTextBox,
    updateTextBox,
    selectTextBox,
    deleteTextBox,
    clearAll,
    setupWatchers,
    MIN_DRAG_DISTANCE
  };
}
