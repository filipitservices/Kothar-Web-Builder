<template>
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
      <!-- Request-mode context bar -->
      <div v-if="requestMode" class="builder-context-bar">
        <button class="builder-context-back" @click="handleReturnToRequest">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {{ returnLabel }}
        </button>
        <span class="builder-context-info">Editing page layout</span>
        <button
          class="builder-context-save"
          :disabled="isSaving"
          @click="handleSaveLayout"
        >
          <svg
            v-if="!isSaving && saveStatus !== 'saved'"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path
              d="M3 3a2 2 0 012-2h8.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V17a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm3 0v4h8V3H6zm2 8a2 2 0 114 0 2 2 0 01-4 0z"
            />
          </svg>
          <svg
            v-if="saveStatus === 'saved'"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ saveLabel }}
        </button>
      </div>

      <!-- Screens -->
      <ScreensPanel
        :desktop-canvas-width="desktopCanvasWidth"
        :desktop-canvas-height="desktopCanvasHeight"
        :mobile-canvas-width="mobileCanvasWidth"
        :mobile-canvas-height="mobileCanvasHeight"
        :desktop-list="blocks"
        :mobile-list="blocks"
        :desktop-drawing-state="desktopDrawingState"
        :mobile-drawing-state="mobileDrawingState"
        :desktop-strokes="desktopStrokes"
        :mobile-strokes="mobileStrokes"
        @toggle-desktop-drawing="toggleDrawing('desktop')"
        @toggle-mobile-drawing="toggleDrawing('mobile')"
        @toggle-desktop-text-mode="toggleTextMode('desktop')"
        @toggle-mobile-text-mode="toggleTextMode('mobile')"
        @update:desktopList="handleBlocksUpdate"
        @update:mobileList="handleBlocksUpdate"
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
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDrawing } from '~/composables/useDrawing';
import { useTemplateApplication } from '~/composables/useTemplateApplication';
import { useBuilderSave } from '~/composables/useBuilderSave';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import { useAuthStore } from '~/stores/auth';
import { useCreateRequest } from '~/composables/useCreateRequest';
import ScreensPanel from '~/components/ScreensPanel.vue';
import ItemsList from '~/components/ItemsList.vue';
import TemplatesList from '~/components/TemplatesList.vue';
import SidebarBranding from '~/components/SidebarBranding.vue';
import type { BlockItem, DrawingState, ScreenId } from '~/types/builder';
import {
  AVAILABLE_BLOCKS,
  CANVAS_DIMENSIONS,
} from '~/constants/builder';
import { logger } from '~/utils/logger';

defineOptions({ name: 'BuilderEditor' });

const router = useRouter();
const authStore = useAuthStore();
const requestLayoutStore = useRequestLayoutStore();
const { saveLayout } = useCreateRequest();

const { isSaving, saveStatus, saveLabel, handleSaveLayout } = useBuilderSave({
  requestLayoutStore,
  authStore,
  saveLayout,
});

const requestMode = computed(() => requestLayoutStore.active);
const returnLabel = computed(() =>
  requestLayoutStore.sourceOrderId ? 'Back to order' : 'Back to request'
);

/**
 * Single shared block list.
 * This is a direct proxy to the request layout store so there is
 * exactly one source of truth for the layout being edited.
 */
const blocks = computed<BlockItem[]>({
  get: () => requestLayoutStore.blocks,
  set: (val) => {
    if (requestLayoutStore.active) {
      requestLayoutStore.updateBlocks(val);
    }
  }
});

const {
  desktopDrawingState,
  desktopStrokes,
  mobileDrawingState,
  mobileStrokes,
  toggleDrawing,
  toggleTextMode,
  setCanvasRef,
  updateDesktopDrawingState,
  updateMobileDrawingState,
} = useDrawing();

const dummyMobileList: Ref<BlockItem[]> = ref([]);
const { applyTemplate } = useTemplateApplication({
  desktopList: blocks,
  mobileList: dummyMobileList,
});

const availableList: Ref<BlockItem[]> = ref(AVAILABLE_BLOCKS);
const desktopCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.width);
const desktopCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.height);
const mobileCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.width);
const mobileCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.height);

function handleBlocksUpdate(val: BlockItem[]): void {
  blocks.value = val;
}

const handleDesktopDrawingStateUpdate = (newState: Partial<DrawingState>): void => {
  updateDesktopDrawingState(newState);
};

const handleMobileDrawingStateUpdate = (newState: Partial<DrawingState>): void => {
  updateMobileDrawingState(newState);
};

const handleTemplateApply = (templateId: string, _screen: ScreenId): void => {
  applyTemplate(templateId, 'desktop');
};

function handleReturnToRequest(): void {
  const route = requestLayoutStore.returnRoute;
  if (route) {
    router.push(route);
  } else {
    router.back();
  }
}

const handleAccountClick = (): void => logger.log('Account settings requested');
const handleHelpClick = (): void => logger.log('Help requested');
</script>

<style scoped src="~/assets/css/editor.css"></style>

