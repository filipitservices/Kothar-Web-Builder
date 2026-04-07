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

      <div class="panel-section tools-row">
        <div class="mode-section">
          <DualSwitch
            :model-value="activeMode === 'mobile'"
            @update:model-value="setActiveMode($event ? 'mobile' : 'desktop')"
            left-label="🖥️ Desktop"
            right-label="📱 Mobile"
            :disabled="!isGlobalEnabled"
            :title="activeMode === 'desktop' ? 'Switch to Mobile' : 'Switch to Desktop'"
          />
        </div>

        <div class="controls-section">
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
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:desktop-drawing-state': [state: DrawingState];
  'update:mobile-drawing-state': [state: DrawingState];
  undo: [];
  redo: [];
  clear: [];
}>();

const activeMode = ref('desktop');

const desktopEnabled = computed(() => props.desktopDrawingState.desktopEnabled);
const mobileEnabled = computed(() => props.mobileDrawingState.mobileEnabled);
const isGlobalEnabled = computed(() => desktopEnabled.value || mobileEnabled.value);

const currentState = computed(() =>
  activeMode.value === 'mobile' ? props.mobileDrawingState : props.desktopDrawingState
);

const currentIsTextMode = computed(() => currentState.value.isTextMode);

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

watch([desktopEnabled, mobileEnabled], ([dEnabled, mEnabled]) => {
  if (dEnabled && !mEnabled) {
    activeMode.value = 'desktop';
  } else if (mEnabled && !dEnabled) {
    activeMode.value = 'mobile';
  } else if (dEnabled && mEnabled) {
    syncEnabledForActiveMode();
  }
}, { immediate: true });

const toggleGlobalDrawing = () => {
  if (isGlobalEnabled.value) {
    if (desktopEnabled.value) {
      emit('update:desktop-drawing-state', { ...props.desktopDrawingState, desktopEnabled: false });
    }
    if (mobileEnabled.value) {
      emit('update:mobile-drawing-state', { ...props.mobileDrawingState, mobileEnabled: false });
    }
  } else {
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
  box-shadow: 0 -6px 18px color-mix(in srgb, var(--color-text) 8%, transparent);
  padding: var(--space-md) var(--space-md);
  display: flex;
  justify-content: center;
}

.panel-inner {
  width: 100%;
  max-width: var(--container-max);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-md);
  align-items: center;
  min-height: 3.5rem;
}

.panel-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.tools-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  min-width: 0;
}

.controls-section {
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
}

.mode-section {
  flex-shrink: 0;
}

.global-toggle {
  padding: var(--space-sm) 0.875rem;
  background: var(--color-bg-subtle);
  color: var(--color-text-muted-dark);
  border: 1px solid var(--color-border-hover);
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  min-height: 2rem;
  white-space: nowrap;
}

.global-toggle.active {
  background: var(--color-primary-tint);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 var(--space-xs) var(--space-md) color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.global-toggle:hover {
  background: var(--color-bg-muted);
}
</style>
