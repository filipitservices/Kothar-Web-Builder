import { ref, watch, type Ref } from 'vue';
import type { BuilderTextBox, BuilderTextEmphasis } from '~/types/order';

interface UseTextBoxManagerOptions {
  defaultFontSize: () => number;
  defaultColor: () => string;
  defaultEmphasis: () => BuilderTextEmphasis;
  initialTextBoxes?: () => BuilderTextBox[];
}

type UpdatableTextField = 'x' | 'y' | 'width' | 'height' | 'text' | 'fontSize' | 'color' | 'emphasis';

const MIN_TEXT_BOX_WIDTH = 100;
const MIN_TEXT_BOX_HEIGHT = 40;

function areTextBoxesEqual(a: BuilderTextBox[], b: BuilderTextBox[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((box, index) => {
    const other = b[index];
    return (
      box.id === other?.id &&
      box.x === other?.x &&
      box.y === other?.y &&
      box.width === other?.width &&
      box.height === other?.height &&
      box.text === other?.text &&
      box.fontSize === other?.fontSize &&
      box.color === other?.color &&
      box.emphasis === other?.emphasis
    );
  });
}

export function useTextBoxManager(options: UseTextBoxManagerOptions): {
  textBoxes: Ref<BuilderTextBox[]>;
  selectedTextBoxId: Ref<string | null>;
  createTextBox: (x: number, y: number, width: number, height: number) => void;
  updateTextBox: (id: string, field: UpdatableTextField, value: number | string) => void;
  selectTextBox: (id: string | null) => void;
  deleteTextBox: (id: string) => void;
  clearAll: () => void;
  setTextBoxes: (next: BuilderTextBox[]) => void;
  setupWatchers: (
    isTextMode: () => boolean,
    textFontSize: () => number,
    textColor: () => string,
    textEmphasis: () => BuilderTextEmphasis
  ) => void;
} {
  const textBoxes = ref<BuilderTextBox[]>([]);
  const selectedTextBoxId = ref<string | null>(null);

  function setTextBoxes(next: BuilderTextBox[]): void {
    const normalized = next.map((box) => ({ ...box }));
    if (areTextBoxesEqual(textBoxes.value, normalized)) return;
    textBoxes.value = normalized;
    const selected = selectedTextBoxId.value;
    if (!selected) return;
    const stillSelected = textBoxes.value.some((entry) => entry.id === selected);
    if (!stillSelected) selectedTextBoxId.value = null;
  }

  function createTextBox(x: number, y: number, width: number, height: number): void {
    const box: BuilderTextBox = {
      id: crypto.randomUUID(),
      x,
      y,
      width: Math.max(MIN_TEXT_BOX_WIDTH, width),
      height: Math.max(MIN_TEXT_BOX_HEIGHT, height),
      text: '',
      fontSize: options.defaultFontSize(),
      color: options.defaultColor(),
      emphasis: options.defaultEmphasis(),
    };
    textBoxes.value = [...textBoxes.value, box];
    selectedTextBoxId.value = box.id;
  }

  function updateTextBox(id: string, field: UpdatableTextField, value: number | string): void {
    let changed = false;
    const next = textBoxes.value.map((box) => {
      if (box.id !== id) return box;
      if (field === 'width') {
        const width = Math.max(MIN_TEXT_BOX_WIDTH, Number(value));
        if (box.width === width) return box;
        changed = true;
        return { ...box, width };
      }
      if (field === 'height') {
        const height = Math.max(MIN_TEXT_BOX_HEIGHT, Number(value));
        if (box.height === height) return box;
        changed = true;
        return { ...box, height };
      }
      if (field === 'x' || field === 'y' || field === 'fontSize') {
        const numeric = Number(value);
        if (box[field] === numeric) return box;
        changed = true;
        return { ...box, [field]: numeric };
      }
      if (field === 'emphasis') {
        const emphasis = value === 'bold' || value === 'italic' ? value : 'normal';
        if (box.emphasis === emphasis) return box;
        changed = true;
        return { ...box, emphasis };
      }
      const stringValue = String(value);
      if (box[field] === stringValue) return box;
      changed = true;
      return { ...box, [field]: stringValue };
    });
    if (!changed) return;
    textBoxes.value = next;
  }

  function selectTextBox(id: string | null): void {
    selectedTextBoxId.value = id;
  }

  function deleteTextBox(id: string): void {
    textBoxes.value = textBoxes.value.filter((box) => box.id !== id);
    if (selectedTextBoxId.value === id) {
      selectedTextBoxId.value = null;
    }
  }

  function clearAll(): void {
    textBoxes.value = [];
    selectedTextBoxId.value = null;
  }

  function setupWatchers(
    isTextMode: () => boolean,
    textFontSize: () => number,
    textColor: () => string,
    textEmphasis: () => BuilderTextEmphasis
  ): void {
    watch(
      () => options.initialTextBoxes?.(),
      (incoming) => {
        if (!incoming) return;
        setTextBoxes(incoming);
      },
      { immediate: true, deep: true }
    );

    watch(
      () => isTextMode(),
      (enabled) => {
        if (!enabled) {
          selectedTextBoxId.value = null;
        }
      }
    );

    watch(
      [() => textFontSize(), () => textColor(), () => textEmphasis()],
      ([size, color, emphasis]) => {
        const selected = selectedTextBoxId.value;
        if (!selected) return;
        let changed = false;
        const next = textBoxes.value.map((box) => {
          if (box.id !== selected) return box;
          if (box.fontSize === size && box.color === color && box.emphasis === emphasis) {
            return box;
          }
          changed = true;
          return { ...box, fontSize: size, color, emphasis };
        });
        if (!changed) return;
        textBoxes.value = next;
      }
    );
  }

  return {
    textBoxes,
    selectedTextBoxId,
    createTextBox,
    updateTextBox,
    selectTextBox,
    deleteTextBox,
    clearAll,
    setTextBoxes,
    setupWatchers,
  };
}
