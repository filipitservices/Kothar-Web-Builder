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

              <!-- Builder link + customized indicator -->
              <div class="req-preview-links">
                <button
                  type="button"
                  class="req-builder-link"
                  @click="openBuilder"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  Customize page layout
                  <span v-if="layoutCustomized" class="req-layout-badge">Modified</span>
                </button>
                <NuxtLink to="/dashboard" class="change-template-link">
                  Choose a different design →
                </NuxtLink>
              </div>
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
              <h1 class="req-form__title">
                Great choice{{ userName ? `, ${userName}` : '' }}! Tell Us About Your Business.
              </h1>
              <p class="req-form__subtitle">
                We'll use this information to customize your website. The more details you provide, the better we can tailor the design to your needs.
              </p>
            </div>

            <TemplateRequestForm
              v-if="originalTemplate"
              :template="originalTemplate"
              :is-submitting="isSubmitting"
              :show-progress="false"
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm from '~/components/TemplateRequestForm.vue';
import type { TemplateRequestFormData, ColorCustomization } from '~/types/templateRequest';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'TemplateRequestPage', display: 'Template Request Form' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();
const requestLayoutStore = useRequestLayoutStore();

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

const layoutCustomized = computed(() => requestLayoutStore.isCustomized);

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

  if (
    !requestLayoutStore.active ||
    requestLayoutStore.sourceTemplateId !== template.id
  ) {
    requestLayoutStore.initFromTemplate(
      template,
      `/gallery/request/${templateId.value}`
    );
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

function openBuilder(): void {
  router.push(`/gallery/request/${templateId.value}/builder`);
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
    const layout = requestLayoutStore.active
      ? requestLayoutStore.getLayoutForSubmission()
      : undefined;

    await submitOrder({
      userId: uid,
      templateId: templateId.value,
      templateName: template.name,
      formData,
      files: formData.files ?? [],
      layout,
    });

    requestLayoutStore.reset();
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
