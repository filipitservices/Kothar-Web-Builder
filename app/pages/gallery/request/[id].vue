<template>
  <div class="req">
    <!-- Main Content -->
    <main class="req__main">
      <div class="req__content">
        <!-- Two Column Layout -->
        <div class="req__grid">
          <!-- Left: Template Preview -->
          <aside class="req-preview">
            <div class="req-preview-card">
              <div class="req-preview-label">Live Preview</div>
              <p class="req-welcome">
                Great choice{{ userName ? `, ${userName}` : '' }}!
              </p>
              <div 
                class="req-preview-device" 
                ref="previewContainerRef"
                :style="containerStyle"
              >
                <div 
                  class="req-preview-viewport"
                  :style="viewportStyle"
                >
                  <ShowcaseRenderer
                    v-if="previewTemplate"
                    :template="previewTemplate"
                    view-mode="desktop"
                  />
                </div>
              </div>
              <div class="req-preview-info">
                <span class="req-preview-industry">{{ originalTemplate?.industry }}</span>
                <h3 class="req-preview-name">{{ originalTemplate?.name }}</h3>
                <p class="req-preview-desc">{{ originalTemplate?.description }}</p>
              </div>
              <div class="req-preview-links">
                <NuxtLink to="/dashboard" class="change-template-link">
                  Choose a different design →
                </NuxtLink>
              </div>
            </div>

            <!-- Layout Summary -->
            <div v-if="layoutSections.length > 0" class="req-layout-summary">
              <div class="req-layout-summary__header">
                <h4 class="req-layout-summary__title">Page Layout</h4>
                <span class="req-layout-summary__count">{{ layoutSections.length }} sections</span>
              </div>
              <ol class="req-layout-summary__list">
                <li
                  v-for="section in layoutSections"
                  :key="section.id"
                  class="req-layout-summary__item"
                >
                  {{ section.label }}
                </li>
              </ol>
              <button
                type="button"
                class="req-layout-summary__cta"
                @click="openBuilder"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                Customize Layout in Builder
              </button>
            </div>

            <div class="req-progress">
              <div class="req-progress-track">
                <div class="req-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <span class="req-progress-label">{{ formProgress.completed }} of {{ formProgress.total }} fields completed</span>
            </div>
          </aside>

          <section class="req-form">
            <div class="req-form__header">
              <h1 class="req-form__title">Tell Us About Your Business</h1>
              <p class="req-form__subtitle">
                We'll use this information to customize your website. The more details you provide, the better we can tailor the design to your needs.
              </p>
            </div>

            <TemplateRequestForm
              v-if="originalTemplate"
              ref="formRef"
              :template="originalTemplate"
              :is-submitting="isSubmitting"
              :show-progress="false"
              :initial-form-data="restoredFormData"
              @color-change="handleColorChange"
              @submit="handleSubmit"
              @progress-update="handleProgressUpdate"
            />
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, unref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useRequestStateStore } from '~/stores/requestState';
import type { OrderLayout } from '~/types/order';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm, {
  type TemplateRequestFormData,
  type ColorCustomization
} from '~/components/TemplateRequestForm.vue';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'TemplateRequestPage', display: 'Template Request Form' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();
const requestState = useRequestStateStore();

const formRef = ref<InstanceType<typeof TemplateRequestForm> | null>(null);

const userName = computed(() => {
  const user = authStore.currentUser;
  if (!user) return '';
  if (user.displayName) return user.displayName.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return '';
});

const templateId = computed(() => route.params.id as string);

const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);

const isSubmitting = ref(false);

const formProgress = ref({ completed: 1, total: 14 });
const progressPercentage = computed(() => {
  if (formProgress.value.total === 0) return 0;
  return Math.round((formProgress.value.completed / formProgress.value.total) * 100);
});

const previewContainerRef = ref<HTMLElement | null>(null);
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;
const viewportScale = ref(1);

const viewportStyle = computed(() => ({
  width: `${VIEWPORT_WIDTH}px`,
  height: `${VIEWPORT_HEIGHT}px`,
  transform: `scale(${viewportScale.value})`,
  transformOrigin: 'top left'
}));

const containerStyle = computed(() => ({
  height: `${VIEWPORT_HEIGHT * viewportScale.value}px`
}));

/**
 * Layout sections from the request state store (desktop layout is canonical).
 */
const layoutSections = computed(() =>
  requestState.hasActiveRequest ? requestState.layout.desktop : []
);

/**
 * Form data restored from the store after returning from the builder.
 * Only provided once on mount; thereafter the form manages its own state.
 */
const restoredFormData = ref<TemplateRequestFormData | null>(null);

function calculateViewportScale(): void {
  const container = previewContainerRef.value;
  if (!container) return;
  const containerWidth = container.clientWidth;
  viewportScale.value = containerWidth / VIEWPORT_WIDTH;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  const template = showcaseStore.getTemplateById(templateId.value);
  if (!template) {
    router.push('/dashboard');
    return;
  }

  originalTemplate.value = template;
  previewTemplate.value = createPreviewTemplate(template, template.colorScheme);

  // Initialize or re-use request state store
  if (!requestState.hasActiveRequest || requestState.templateId !== templateId.value) {
    requestState.initializeFromTemplate(template);
  }

  // Restore form data if returning from builder
  if (requestState.savedFormData) {
    restoredFormData.value = requestState.savedFormData as TemplateRequestFormData;
  }

  await nextTick();
  calculateViewportScale();

  if (previewContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      calculateViewportScale();
    });
    resizeObserver.observe(previewContainerRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

function createPreviewTemplate(
  base: ShowcaseTemplate,
  colors: ColorCustomization
): ShowcaseTemplate {
  return {
    ...base,
    colorScheme: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text
    }
  };
}

function handleColorChange(colors: ColorCustomization): void {
  if (!originalTemplate.value) return;
  previewTemplate.value = createPreviewTemplate(originalTemplate.value, colors);
}

function handleProgressUpdate(progress: { completed: number; total: number }): void {
  formProgress.value = { ...progress };
}

/**
 * Save current form state to the request store and navigate to the builder.
 */
function openBuilder(): void {
  const rawFormData = unref(formRef.value?.formData);
  if (rawFormData) {
    requestState.saveFormData(rawFormData);
  }
  router.push('/builder');
}

/**
 * Build a serializable OrderLayout from the request state store.
 */
function getOrderLayout(): OrderLayout {
  return {
    desktop: requestState.layout.desktop.map((b) => ({
      id: b.id,
      type: b.type,
      label: b.label,
    })),
    mobile: requestState.layout.mobile.map((b) => ({
      id: b.id,
      type: b.type,
      label: b.label,
    })),
  };
}

async function handleSubmit(formData: TemplateRequestFormData): Promise<void> {
  const uid = authStore.uid ?? authStore.currentUser?.uid;
  if (!uid) {
    alert('You must be signed in to submit a request.');
    return;
  }

  const template = originalTemplate.value;
  if (!template) {
    alert('Template not found. Please go back and choose a design.');
    return;
  }

  isSubmitting.value = true;

  try {
    const { submitOrder } = useOrderSubmission();
    await submitOrder({
      userId: uid,
      templateId: templateId.value,
      templateName: template.name,
      formData,
      files: formData.files ?? [],
      layout: getOrderLayout()
    });

    // Clear request state after successful submission
    requestState.$reset();

    alert('Thank you! Your request has been submitted. We\'ll be in touch soon.');
    await router.push('/dashboard');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'There was an error submitting your request. Please try again.';
    alert(message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style src="~/assets/css/components.css"></style>
<style scoped src="~/assets/css/request-form.css"></style>

<style scoped>
/* Layout summary card */
.req-layout-summary {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.req-layout-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.req-layout-summary__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.req-layout-summary__count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.req-layout-summary__list {
  list-style: none;
  margin: 0 0 var(--space-md);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.req-layout-summary__item {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}

.req-layout-summary__item::before {
  content: counter(list-item) ". ";
  counter-increment: list-item;
  font-weight: 600;
  color: var(--color-primary);
}

.req-layout-summary__list {
  counter-reset: list-item;
}

.req-layout-summary__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: 0.75rem var(--space-md);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.req-layout-summary__cta:hover {
  background: var(--color-primary-dark);
}

.req-layout-summary__cta svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>
