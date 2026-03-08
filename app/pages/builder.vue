```vue
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
        @update:desktop-list="(val) => { desktopList.value = val; }"
        @update:mobile-list="(val) => { mobileList.value = val; }"
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
import { ref, onMounted, type Ref } from 'vue';
import { useBusinessData } from '~/composables/useBusinessData';
import { useValidation } from '~/composables/useValidation';
import { useDrawing } from '~/composables/useDrawing';
import { useTemplateApplication } from '~/composables/useTemplateApplication';
import { useShowcaseStore } from '~/stores/showcase';
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

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();

const desktopList: Ref<BlockItem[]> = ref([]);
const mobileList: Ref<BlockItem[]> = ref([]);

const { getField: getBusinessField } = useBusinessData();
const { validate, businessHoursOptions } = useValidation();
const { desktopDrawingState, desktopStrokes, mobileDrawingState, mobileStrokes, toggleDrawing, toggleTextMode, setCanvasRef, updateDesktopDrawingState, updateMobileDrawingState } = useDrawing();
const { applyTemplate, applyBlocks } = useTemplateApplication({ desktopList, mobileList });

const availableList: Ref<BlockItem[]> = ref(AVAILABLE_BLOCKS);
const desktopCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.width);
const desktopCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.desktop.height);
const mobileCanvasWidth: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.width);
const mobileCanvasHeight: Ref<number> = ref(CANVAS_DIMENSIONS.mobile.height);
const fieldErrors: Ref<Record<FieldErrorKey, string | null>> = ref(INITIAL_FIELD_ERRORS);

/**
 * One-time initialisation from a showcase template.
 * Reads the `showcaseTemplate` query param, applies the template's blocks to
 * both screens, then removes the param so the initialisation does not re-run
 * on subsequent navigations or refreshes.
 */
onMounted(() => {
  const showcaseTemplateId = route.query.showcaseTemplate;
  if (typeof showcaseTemplateId !== 'string' || !showcaseTemplateId) return;

  const template = showcaseStore.getTemplateById(showcaseTemplateId);
  if (!template) return;

  applyBlocks(template.blocks, 'both');

  router.replace({ path: '/builder' });
});

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

const handleTemplateApply = (templateId: string, screen: ScreenId): void => {
  applyTemplate(templateId, screen);
};

const handleAccountClick = (): void => console.log('Account settings requested');
const handleHelpClick = (): void => console.log('Help requested');
</script>

<style scoped src="~/assets/css/editor.css"></style>
