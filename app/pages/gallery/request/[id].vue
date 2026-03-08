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
                <NuxtLink
                  :to="{ path: '/builder', query: { showcaseTemplate: templateId } }"
                  class="req-preview-builder-cta"
                >
                  Open in Builder
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </NuxtLink>
                <NuxtLink to="/dashboard" class="change-template-link">
                  Choose a different design →
                </NuxtLink>
                <NuxtLink to="/builder" class="builder-link">
                  Or build your own from scratch →
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
              <h1 class="req-form__title">Tell Us About Your Business</h1>
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
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm, {
  type TemplateRequestFormData,
  type ColorCustomization
} from '~/components/TemplateRequestForm.vue';

// Route protection
definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'TemplateRequestPage', display: 'Template Request Form' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();

// Get user's display name for welcome message
const userName = computed(() => {
  const user = authStore.currentUser;
  if (!user) return '';
  // Prefer displayName, fallback to email prefix
  if (user.displayName) return user.displayName.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return '';
});

// Get template from route param
const templateId = computed(() => route.params.id as string);

// Original template from store (immutable reference)
const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);

// Preview template with customizable colors (derived from original)
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);

// Form state
const isSubmitting = ref(false);

// Progress tracking (received from form component)
const formProgress = ref({ completed: 1, total: 14 });
const progressPercentage = computed(() => {
  if (formProgress.value.total === 0) return 0;
  return Math.round((formProgress.value.completed / formProgress.value.total) * 100);
});

// Viewport scaling for desktop-like preview
const previewContainerRef = ref<HTMLElement | null>(null);
const VIEWPORT_WIDTH = 1280; // Simulated desktop viewport width
const VIEWPORT_HEIGHT = 800; // Simulated desktop viewport height
const viewportScale = ref(1);

const viewportStyle = computed(() => ({
  width: `${VIEWPORT_WIDTH}px`,
  height: `${VIEWPORT_HEIGHT}px`,
  transform: `scale(${viewportScale.value})`,
  transformOrigin: 'top left'
}));

// Container needs explicit height since transform doesn't affect layout flow
const containerStyle = computed(() => ({
  height: `${VIEWPORT_HEIGHT * viewportScale.value}px`
}));

/**
 * Calculate the scale factor to fit the viewport in the container
 */
function calculateViewportScale(): void {
  const container = previewContainerRef.value;
  if (!container) return;

  const containerWidth = container.clientWidth;
  // Scale to fit the container width, maintaining aspect ratio
  viewportScale.value = containerWidth / VIEWPORT_WIDTH;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  const template = showcaseStore.getTemplateById(templateId.value);
  if (!template) {
    // Redirect to dashboard if template not found
    router.push('/dashboard');
    return;
  }

  // Store the original template
  originalTemplate.value = template;

  // Create a copy for the preview that can be modified with custom colors
  previewTemplate.value = createPreviewTemplate(template, template.colorScheme);

  // Initialize viewport scaling after next tick
  await nextTick();
  calculateViewportScale();

  // Set up resize observer for responsive scaling
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

/**
 * Create a preview template with custom color scheme
 * This creates a new object so Vue reactivity picks up changes
 */
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

/**
 * Handle color changes from the form - update the preview template
 */
function handleColorChange(colors: ColorCustomization): void {
  if (!originalTemplate.value) return;

  // Create new preview template with updated colors
  previewTemplate.value = createPreviewTemplate(originalTemplate.value, colors);
}

/**
 * Handle progress updates from the form
 */
function handleProgressUpdate(progress: { completed: number; total: number }): void {
  formProgress.value = { ...progress };
}

/**
 * Handle form submission: persist order to Firestore and upload files to Storage.
 */
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
      files: formData.files ?? []
    });

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
