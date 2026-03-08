<template>
  <div class="builder-page">
    <!-- Request context bar -->
    <div v-if="requestState.hasActiveRequest" class="builder-context-bar">
      <button type="button" class="builder-context-bar__back" @click="returnToRequest">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Request
      </button>
      <span class="builder-context-bar__template">{{ requestState.templateName }}</span>
    </div>

    <div class="main-container">
      <!-- Left Sidebar -->
      <div class="sidebar left-sidebar">
        <div class="sidebar-header">
          <h3>Available Items</h3>
        </div>
        <div class="sidebar-list">
          <ItemsList
            :items="availableList"
            :group="{ name: 'available', pull: 'clone', put: false }"
          />
        </div>
        <SidebarBranding
          @account-click="handleAccountClick"
          @help-click="handleHelpClick"
        />
      </div>

      <!-- Center Container with Screens -->
      <div class="screens-container">
        <!-- Info Bar -->
        <InfoBar
          :errors="fieldErrors"
          :options="{ businessHours: businessHoursOptions }"
          :fields="INFO_BAR_FIELDS"
          @validate="validateField"
        />

        <!-- Screens -->
        <ScreensPanel
          :desktop-canvas-width="desktopCanvasWidth"
          :desktop-canvas-height="desktopCanvasHeight"
          :mobile-canvas-width="mobileCanvasWidth"
          :mobile-canvas-height="mobileCanvasHeight"
          :desktop-list="desktopList"
          :mobile-list="mobileList"
          :desktop-drawing-state="desktopDrawingState"
          :mobile-drawing-state="mobileDrawingState"
          :desktop-strokes="desktopStrokes"
          :mobile-strokes="mobileStrokes"
          @toggle-desktop-drawing="toggleDrawing('desktop')"
          @toggle-mobile-drawing="toggleDrawing('mobile')"
          @toggle-desktop-text-mode="toggleTextMode('desktop')"
          @toggle-mobile-text-mode="toggleTextMode('mobile')"
          @update:desktop-list="handleDesktopListUpdate"
          @update:mobile-list="handleMobileListUpdate"
          @update:desktop-drawing-state="handleDesktopDrawingStateUpdate"
          @update:mobile-drawing-state="handleMobileDrawingStateUpdate"
          @set-desktop-canvas-ref="setCanvasRef('desktop', $event)"
          @set-mobile-canvas-ref="setCanvasRef('mobile', $event)"
        />
      </div>

      <!-- Right Sidebar -->
      <div class="sidebar right-sidebar">
        <TemplatesList @apply="handleTemplateApply" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue';
import { useBusinessData } from '~/composables/useBusinessData';
import { useValidation } from '~/composables/useValidation';
import { useDrawing } from '~/composables/useDrawing';
import { useTemplateApplication } from '~/composables/useTemplateApplication';
import { useRequestStateStore } from '~/stores/requestState';
import InfoBar from '~/components/InfoBar.vue';
import ScreensPanel from '~/components/ScreensPanel.vue';
import ItemsList from '~/components/ItemsList.vue';
import TemplatesList from '~/components/TemplatesList.vue';
import SidebarBranding from '~/components/SidebarBranding.vue';
import type { BlockItem, FieldErrorKey, DrawingState, ScreenId } from '~/types/builder';
import { AVAILABLE_BLOCKS, INFO_BAR_FIELDS, CANVAS_DIMENSIONS, INITIAL_FIELD_ERRORS } from '~/constants/builder';

definePageMeta({
  middleware: 'auth',
  layout: 'builder'
});

defineOptions({ name: 'BuilderPage', display: 'Website Builder Interface' });

const router = useRouter();
const requestState = useRequestStateStore();

// State — initialized from request state store if an active request exists
const desktopList: Ref<BlockItem[]> = ref([]);
const mobileList: Ref<BlockItem[]> = ref([]);

const { getField: getBusinessField } = useBusinessData();
const { validate, businessHoursOptions } = useValidation();
const { desktopDrawingState, desktopStrokes, mobileDrawingState, mobileStrokes, toggleDrawing, toggleTextMode, setCanvasRef, updateDesktopDrawingState, updateMobileDrawingState } = useDrawing();
const { applyTemplate } = useTemplateApplication({ desktopList, mobileList });

const availableList: Ref<BlockItem[]> = ref(AVAILABLE_BLOCKS);
const desktopCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.width);
const desktopCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.height);
const mobileCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.width);
const mobileCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.height);
const fieldErrors: Ref<Record<FieldErrorKey, string | null>> = ref(INITIAL_FIELD_ERRORS);

/**
 * Guard: the builder requires an active request context.
 * If there is no active request, redirect to the dashboard.
 */
onMounted(() => {
  if (!requestState.hasActiveRequest) {
    router.replace('/dashboard');
    return;
  }

  // Hydrate local lists from the request state store
  desktopList.value = [...requestState.layout.desktop];
  mobileList.value = [...requestState.layout.mobile];
});

// --- Handlers ---

const handleDesktopDrawingStateUpdate = (newState: Partial<DrawingState>): void => {
  updateDesktopDrawingState(newState);
};

const handleMobileDrawingStateUpdate = (newState: Partial<DrawingState>): void => {
  updateMobileDrawingState(newState);
};

const validateField = (fieldName: FieldErrorKey): void => {
  const value = getBusinessField(fieldName);
  const error = validate(fieldName, value);
  fieldErrors.value = { ...fieldErrors.value, [fieldName]: error };
};

/**
 * Update desktop list locally and persist to request state store.
 */
const handleDesktopListUpdate = (val: BlockItem[]): void => {
  desktopList.value = val;
  requestState.updateDesktopLayout(val);
};

/**
 * Update mobile list locally and persist to request state store.
 */
const handleMobileListUpdate = (val: BlockItem[]): void => {
  mobileList.value = val;
  requestState.updateMobileLayout(val);
};

const handleTemplateApply = (templateId: string, screen: ScreenId): void => {
  applyTemplate(templateId, screen);
  // Sync the local lists to the request state store after template application
  requestState.updateDesktopLayout(desktopList.value);
  requestState.updateMobileLayout(mobileList.value);
};

/**
 * Navigate back to the request editor page.
 * Layout state is already persisted in the store via update handlers.
 */
const returnToRequest = (): void => {
  const tid = requestState.templateId;
  if (tid) {
    router.push(`/gallery/request/${tid}`);
  } else {
    router.push('/dashboard');
  }
};

const handleAccountClick = (): void => console.log('Account settings requested');
const handleHelpClick = (): void => console.log('Help requested');
</script>

<style scoped src="~/assets/css/editor.css"></style>

<style scoped>
.builder-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.builder-context-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-white);
  flex-shrink: 0;
}

.builder-context-bar__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.builder-context-bar__back:hover {
  background: rgba(255, 255, 255, 0.25);
}

.builder-context-bar__back svg {
  width: 0.875rem;
  height: 0.875rem;
}

.builder-context-bar__template {
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.85;
}

/* Override main-container to fill remaining height when context bar is present */
.builder-page > .main-container {
  flex: 1;
  height: auto;
  min-height: 0;
}
</style>
