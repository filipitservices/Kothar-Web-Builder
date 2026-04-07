<template>
  <div class="drawing-controls-panel">
    <div class="panel-inner">
      <div class="panel-section global-section">
        <label
          class="builder-context-sync"
          :title="isGlobalEnabled ? 'Disable drawing' : 'Enable drawing'"
        >
          <input
            :id="drawingModeInputId"
            type="checkbox"
            :checked="isGlobalEnabled"
            @change="onDrawingModeChange"
          />
          <span>Drawing Mode</span>
        </label>
        <label
          v-if="showSyncScreens"
          class="builder-context-sync"
          title="When on, desktop and mobile previews use the same block order and set. Turn off to customize each screen separately."
        >
          <input
            :id="syncScreensInputId"
            type="checkbox"
            :checked="syncScreens"
            @change="onSyncScreensChange"
          />
          <span>Sync Screens</span>
        </label>
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
import { ref, computed, watch, useId } from 'vue';
import DualSwitch from './DualSwitch.vue';
import DrawingToolControls from './DrawingToolControls.vue';
import type { DrawingState } from '~/composables/useDrawing';

const drawingModeInputId = useId();
const syncScreensInputId = useId();

interface Props {
  desktopDrawingState: DrawingState;
  mobileDrawingState: DrawingState;
  showSyncScreens?: boolean;
  syncScreens?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSyncScreens: false,
  syncScreens: true
});

const emit = defineEmits<{
  'update:desktop-drawing-state': [state: DrawingState];
  'update:mobile-drawing-state': [state: DrawingState];
  'update:syncScreens': [value: boolean];
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

const setDrawingModeEnabled = (enabled: boolean) => {
  if (!enabled) {
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

const onDrawingModeChange = (ev: Event) => {
  const checked = (ev.target as HTMLInputElement).checked;
  setDrawingModeEnabled(checked);
};

const onSyncScreensChange = (ev: Event) => {
  emit('update:syncScreens', (ev.target as HTMLInputElement).checked);
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
  padding: 0 var(--space-md);
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
}

.panel-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.global-section {
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-sm);
}

.tools-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-md);
  width: 100%;
  min-width: 0;
}

.controls-section {
  display: flex;
  flex: 0 0 auto;
  margin-left: auto;
  justify-content: flex-end;
}

.mode-section {
  flex-shrink: 0;
}
</style>
