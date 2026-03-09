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
      <div class="builder-context-bar">
        <button class="builder-context-back" @click="handleReturnToRequest">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          {{ returnLabel }}
        </button>
        <span class="builder-context-info">Editing page layout</span>
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
        @update:desktop-list="handleBlocksUpdate"
        @update:mobile-list="handleBlocksUpdate"
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
import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { useDrawing } from '~/composables/useDrawing';
import { useTemplateApplication } from '~/composables/useTemplateApplication';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import ScreensPanel from '~/components/ScreensPanel.vue';
import ItemsList from '~/components/ItemsList.vue';
import TemplatesList from '~/components/TemplatesList.vue';
import SidebarBranding from '~/components/SidebarBranding.vue';
import type { BlockItem, DrawingState, ScreenId } from '~/types/builder';
import { AVAILABLE_BLOCKS, CANVAS_DIMENSIONS } from '~/constants/builder';

const router = useRouter();
const requestLayoutStore = useRequestLayoutStore();

const returnLabel = computed(() =>
  requestLayoutStore.sourceOrderId ? 'Back to order' : 'Back to request'
);

/**
 * Single shared block list initialized from the request layout store.
 * Both desktop and mobile screens render from this single array so layout
 * edits are automatically synchronized across viewports.
 */
const blocks: Ref<BlockItem[]> = ref(
  requestLayoutStore.active
    ? [...requestLayoutStore.blocks]
    : []
);

/**
 * Safety net: if the local blocks ref is empty but the store has blocks
 * (e.g. due to a timing edge case during mount), re-sync once.
 */
onMounted(() => {
  if (blocks.value.length === 0 && requestLayoutStore.active && requestLayoutStore.blocks.length > 0) {
    blocks.value = [...requestLayoutStore.blocks];
  }
});

/**
 * Keep the store in sync when blocks change.
 * Uses a shallow watch on the ref value because the ref
 * is replaced (immutable update) rather than mutated in place.
 */
watch(blocks, (newBlocks) => {
  if (requestLayoutStore.active) {
    requestLayoutStore.updateBlocks(newBlocks);
  }
});

const { desktopDrawingState, desktopStrokes, mobileDrawingState, mobileStrokes, toggleDrawing, toggleTextMode, setCanvasRef, updateDesktopDrawingState, updateMobileDrawingState } = useDrawing();

const dummyMobileList: Ref<BlockItem[]> = ref([]);
const { applyTemplate } = useTemplateApplication({ desktopList: blocks, mobileList: dummyMobileList });

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

const handleAccountClick = (): void => console.log('Account settings requested');
const handleHelpClick = (): void => console.log('Help requested');
</script>

<style scoped src="~/assets/css/editor.css"></style>
