/**
 * Ephemeral builder UI state that is not persisted to the order (e.g. drawing marks).
 * BuilderEditor updates this so route-level unsaved registration can include drawing.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBuilderEphemeralStore = defineStore('builderEphemeral', () => {
  /** True when desktop or mobile stroke lists are non-empty (annotation overlay). */
  const drawingHasUnsavedMarks = ref(false);

  function setDrawingHasUnsavedMarks(value: boolean): void {
    drawingHasUnsavedMarks.value = value;
  }

  function reset(): void {
    drawingHasUnsavedMarks.value = false;
  }

  return {
    drawingHasUnsavedMarks,
    setDrawingHasUnsavedMarks,
    reset,
  };
});
