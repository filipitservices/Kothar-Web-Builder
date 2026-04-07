<template>
  <div class="drawing-controls-panel">
    <div class="panel-inner">
      <div class="panel-section global-section">
        <button
          class="global-toggle"
          :class="{ active: isGlobalEnabled }"
          @click="toggleGlobalDrawing"
          :title="isGlobalEnabled ? 'Disable drawing' : 'Enable drawing'"
        >
          <span v-if="isGlobalEnabled">🛑 Drawing Off</span>
          <span v-else>✅ Drawing On</span>
        </button>
      </div>

      <div class="panel-section mode-section">
        <DualSwitch
          :model-value="activeMode === 'mobile'"
          @update:model-value="setActiveMode($event ? 'mobile' : 'desktop')"
          left-label="🖥️ Desktop"
          right-label="📱 Mobile"
          :disabled="!isGlobalEnabled"
          :title="activeMode === 'desktop' ? 'Switch to Mobile' : 'Switch to Desktop'"
        />
        <label class="sync-toggle" :class="{ disabled: !isGlobalEnabled }">
          <input 
            type="checkbox"
            v-model="syncScreensModel"
            :disabled="!isGlobalEnabled"
            title="Sync lists between screens"
          />
          <span>Sync</span>
        </label>
      </div>

      <div class="panel-section controls-section">
        <DrawingToolControls
          :is-text-mode="currentIsTextMode"
          :stroke-type="currentStrokeType"
          :color="currentColor"
          :line-width="currentLineWidth"
          :text-font-size="currentTextFontSize"
          :text-color="currentTextColor"
          :text-font-family="currentTextFontFamily"
          :disabled="!isGlobalEnabled"
          @update:is-text-mode="toggleTextMode"
          @update:stroke-type="currentStrokeType = $event"
          @update:color="currentColor = $event"
          @update:line-width="currentLineWidth = $event"
          @update:text-font-size="currentTextFontSize = $event"
          @update:text-color="currentTextColor = $event"
          @update:text-font-family="currentTextFontFamily = $event"
          @undo="$emit('undo')"
          @redo="$emit('redo')"
          @clear="$emit('clear')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import DualSwitch from './DualSwitch.vue';
import DrawingToolControls from './DrawingToolControls.vue';
import type { DrawingState } from '~/composables/useDrawing';

interface Props {
  desktopDrawingState: DrawingState;
  mobileDrawingState: DrawingState;
  syncScreens: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  syncScreens: true
});

const emit = defineEmits<{
  'update:desktop-drawing-state': [state: DrawingState];
  'update:mobile-drawing-state': [state: DrawingState];
  'update:sync-screens': [value: boolean];
  undo: [];
  redo: [];
  clear: [];
}>();

const activeMode = ref('desktop');

// Computed two-way binding for sync checkbox
const syncScreensModel = computed({
  get: () => props.syncScreens,
  set: (value: boolean) => emit('update:sync-screens', value)
});

// Computed properties for enabled states
const desktopEnabled = computed(() => props.desktopDrawingState.desktopEnabled);
const mobileEnabled = computed(() => props.mobileDrawingState.mobileEnabled);
const isGlobalEnabled = computed(() => desktopEnabled.value || mobileEnabled.value);

// Get current state based on active mode
const currentState = computed(() => 
  activeMode.value === 'mobile' ? props.mobileDrawingState : props.desktopDrawingState
);

const currentIsTextMode = computed(() => currentState.value.isTextMode);

// Type-specific computed properties for two-way binding
const currentStrokeType = computed({
  get: (): string => currentState.value.strokeType,
  set: (val: string) => updateState('strokeType', val)
});

const currentColor = computed({
  get: (): string => currentState.value.color,
  set: (val: string) => updateState('color', val)
});

const currentLineWidth = computed({
  get: (): number => currentState.value.lineWidth,
  set: (val: number) => updateState('lineWidth', val)
});

const currentTextFontSize = computed({
  get: (): number => currentState.value.textFontSize,
  set: (val: number) => updateState('textFontSize', val)
});

const currentTextColor = computed({
  get: (): string => currentState.value.textColor,
  set: (val: string) => updateState('textColor', val)
});

const currentTextFontFamily = computed({
  get: (): string => currentState.value.textFontFamily,
  set: (val: string) => updateState('textFontFamily', val)
});

// Helper to enable drawing for one mode and disable the other
const syncEnabledForActiveMode = () => {
  const enableDesktop = activeMode.value === 'desktop';
  const enableMobile = activeMode.value === 'mobile';
  
  if (enableDesktop && !desktopEnabled.value) {
    emit('update:desktop-drawing-state', { ...props.desktopDrawingState, desktopEnabled: true });
  }
  if (enableMobile && !mobileEnabled.value) {
    emit('update:mobile-drawing-state', { ...props.mobileDrawingState, mobileEnabled: true });
  }
  if (enableDesktop && mobileEnabled.value) {
    emit('update:mobile-drawing-state', { ...props.mobileDrawingState, mobileEnabled: false });
  }
  if (enableMobile && desktopEnabled.value) {
    emit('update:desktop-drawing-state', { ...props.desktopDrawingState, desktopEnabled: false });
  }
};

const setActiveMode = (mode: string) => {
  if (mode !== 'desktop' && mode !== 'mobile') return;
  activeMode.value = mode;
  if (isGlobalEnabled.value) syncEnabledForActiveMode();
};

// Sync activeMode with which drawing is actually enabled
watch([desktopEnabled, mobileEnabled], ([dEnabled, mEnabled]) => {
  // Only desktop enabled → switch to desktop
  if (dEnabled && !mEnabled) {
    activeMode.value = 'desktop';
  }
  // Only mobile enabled → switch to mobile
  else if (mEnabled && !dEnabled) {
    activeMode.value = 'mobile';
  }
  // Both enabled → enforce single-mode (shouldn't happen but handle it)
  else if (dEnabled && mEnabled) {
    syncEnabledForActiveMode();
  }
  // Neither enabled → keep current activeMode for next toggle
}, { immediate: true });

const toggleGlobalDrawing = () => {
  if (isGlobalEnabled.value) {
    // Turn off all drawing
    if (desktopEnabled.value) {
      emit('update:desktop-drawing-state', { ...props.desktopDrawingState, desktopEnabled: false });
    }
    if (mobileEnabled.value) {
      emit('update:mobile-drawing-state', { ...props.mobileDrawingState, mobileEnabled: false });
    }
  } else {
    // Turn on drawing for active mode
    syncEnabledForActiveMode();
  }
};

const toggleTextMode = () => updateState('isTextMode', !currentIsTextMode.value);

const updateState = (key: keyof DrawingState, value: DrawingState[keyof DrawingState]) => {
  if (activeMode.value === 'mobile') {
    emit('update:mobile-drawing-state', { ...props.mobileDrawingState, [key]: value });
  } else {
    emit('update:desktop-drawing-state', { ...props.desktopDrawingState, [key]: value });
  }
};
</script>

<style scoped>
.drawing-controls-panel {
  background: var(--color-bg-muted);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -6px 18px rgba(15, 23, 42, 0.08);
  padding: 12px 16px;
  display: flex;
  justify-content: center;
}

.panel-inner {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 16px;
  align-items: center;
  min-height: 56px;
}

.panel-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.controls-section {
  justify-content: flex-end;
  flex: 1;
}

.mode-section {
  justify-content: center;
}

.global-toggle {
  padding: 8px 14px;
  background: #e8ecf3;
  color: #1f2937;
  border: 1px solid #cdd4e0;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  white-space: nowrap;
}

.global-toggle.active {
  background: #e5e9f5;
  color: #1e3a8a;
  border-color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.22);
}

.global-toggle:hover {
  background: #e2e7f1;
}

.sync-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #eef1f6;
  border: 1px solid #d7dde8;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  transition: all 0.2s ease;
}

.sync-toggle:hover {
  background: #e2e7f1;
}

.sync-toggle.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-toggle.disabled:hover {
  background: #eef1f6;
}

.sync-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1e3a8a;
}

.sync-toggle input[type="checkbox"]:disabled {
  cursor: not-allowed;
}
</style>
