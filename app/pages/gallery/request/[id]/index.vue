<template>
  <div class="req">
    <!-- Error state: request not found or inaccessible -->
    <main v-if="loadError" class="req__main">
      <div class="req__content">
        <div class="req-error">
          <div class="req-error__card">
            <svg class="req-error__icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="24" cy="24" r="20" />
              <line x1="24" y1="16" x2="24" y2="26" />
              <circle cx="24" cy="33" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <h1 class="req-error__title">Request not found</h1>
            <p class="req-error__text">
              This request doesn't exist or you don't have access to it.
              It may have been removed, or the link may be incorrect.
            </p>
            <NuxtLink to="/dashboard" class="btn btn--primary">
              Back to dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>

    <!-- Main Content -->
    <main v-else class="req__main">
      <div class="req__content">
        <!-- Inline feedback messages -->
        <Transition name="req-banner">
          <div v-if="feedbackMessage" class="req-feedback" :class="feedbackClass" role="alert">
            <span>{{ feedbackMessage }}</span>
            <button type="button" class="req-feedback__close" @click="feedbackMessage = null" aria-label="Dismiss">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </Transition>

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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import { useOrderUpdate } from '~/composables/useOrderUpdate';
import { ORDER_STATUS_DEFAULT } from '~/types/order';
import type { OrderWithId } from '~/types/order';
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
const ordersStore = useOrdersStore();
const requestLayoutStore = useRequestLayoutStore();
const { updateOrder } = useOrderUpdate();

const requestId = computed(() => route.params.id as string);
const userId = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? '');

const userName = computed(() => {
  const user = authStore.currentUser;
  if (!user) return '';
  if (user.displayName) return user.displayName.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return '';
});

const orderDoc = ref<OrderWithId | null>(null);
const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const loadError = ref(false);
const hasLoaded = ref(false);

const isSubmitting = ref(false);
const feedbackMessage = ref<string | null>(null);
const feedbackType = ref<'success' | 'error'>('error');
const feedbackClass = computed(() =>
  feedbackType.value === 'success' ? 'req-feedback--success' : 'req-feedback--error'
);

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

function getOrderFromNavigationState(): OrderWithId | null {
  if (typeof window === 'undefined') return null;
  const state = window.history.state as { orderFromCreate?: OrderWithId } | undefined;
  const order = state?.orderFromCreate ?? null;
  if (!order || order.id !== requestId.value) return null;
  return order;
}

async function loadRequestFromFirebase(): Promise<void> {
  const uid = userId.value;
  if (!uid) {
    return;
  }

  const id = requestId.value;
  let order: OrderWithId | null = getOrderFromNavigationState();
  if (!order) {
    order = ordersStore.getOrderById(id) ?? null;
  }
  if (!order) {
    order = await ordersStore.fetchOrder(uid, id);
  }

  if (!order) {
    loadError.value = true;
    return;
  }

  orderDoc.value = order;

  const template = showcaseStore.getTemplateById(order.templateId);
  if (!template) {
    loadError.value = true;
    return;
  }

  originalTemplate.value = template;

  const colors = order.projectDetails?.colorCustomization ?? template.colorScheme;
  previewTemplate.value = createPreviewTemplate(template, colors);

  const returnTo = `/gallery/request/${id}`;
  if (!requestLayoutStore.active || requestLayoutStore.sourceOrderId !== order.id) {
    if (order.layout) {
      requestLayoutStore.initFromOrderLayout(
        order.layout,
        order.id,
        template.sections,
        returnTo
      );
    } else {
      requestLayoutStore.initFromTemplateForOrder(template, order.id, returnTo);
    }
  }

  hasLoaded.value = true;
}

onMounted(async () => {
  const uid = userId.value;
  if (uid) ordersStore.subscribe(uid);

  await loadRequestFromFirebase();

  if (loadError.value) return;

  await nextTick();
  calculateViewportScale();

  if (previewContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      calculateViewportScale();
    });
    resizeObserver.observe(previewContainerRef.value);
  }
});

watch(
  userId,
  async (uid) => {
    if (!uid || hasLoaded.value || loadError.value) return;
    ordersStore.subscribe(uid);
    await loadRequestFromFirebase();
  }
);

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
  const id = requestId.value;
  if (!id) return;
  router.push({ path: `/gallery/request/${id}/builder` });
}

async function handleSubmit(formData: TemplateRequestFormData): Promise<void> {
  const uid = userId.value;
  const order = orderDoc.value;
  if (!uid || !order) {
    feedbackType.value = 'error';
    feedbackMessage.value = 'You must be signed in to submit a request.';
    return;
  }

  isSubmitting.value = true;
  feedbackMessage.value = null;

  try {
    const layout = requestLayoutStore.active
      ? requestLayoutStore.getLayoutForSubmission()
      : undefined;

    await updateOrder({
      userId: uid,
      orderId: order.id,
      formData,
      existingAttachments: order.attachments ?? [],
      newFiles: formData.files?.length ? [...formData.files] : undefined,
      layout,
      status: ORDER_STATUS_DEFAULT,
    });

    requestLayoutStore.reset();
    feedbackType.value = 'success';
    feedbackMessage.value = "Thank you! Your request has been submitted. We'll be in touch soon.";
    await router.push('/dashboard');
  } catch (err) {
    feedbackType.value = 'error';
    feedbackMessage.value = err instanceof Error
      ? err.message
      : 'There was an error submitting your request. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style src="~/assets/css/components.css"></style>
<style scoped src="~/assets/css/request-form.css"></style>

