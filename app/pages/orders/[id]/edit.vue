<template>
  <div class="req">
    <main class="req__main">
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

        <div class="req__grid">
          <aside class="req-preview">
            <div class="req-preview-card">
              <div class="req-preview-label">Live Preview</div>
              <p class="req-welcome">Edit your request</p>
              <div
                class="req-preview-device"
                ref="previewContainerRef"
                :style="containerStyle"
              >
                <div class="req-preview-viewport" :style="viewportStyle">
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
                  :class="{ 'req-builder-link--disabled': !isBuilderSupported }"
                  :disabled="!isBuilderSupported"
                  @click="openBuilder"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  <span class="req-builder-link__content">
                    <span class="req-builder-link__title">Open visual layout editor</span>
                    <span class="req-builder-link__subtitle" v-if="isBuilderSupported">
                      Fine-tune blocks and page structure
                    </span>
                    <span class="req-builder-link__subtitle" v-else>
                      Available on screens wider than {{ minWidth - 1 }}px
                    </span>
                  </span>
                  <span v-if="layoutCustomized" class="req-layout-badge">Modified</span>
                </button>
                <NuxtLink to="/gallery" class="change-template-link" aria-label="Back to Gallery templates">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
                    <path fill-rule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L6.414 8H16a1 1 0 110 2H6.414l3.293 3.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  Back to Gallery templates
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
              <h1 class="req-form__title">Update Your Request</h1>
              <p class="req-form__subtitle">
                Change any details below. Your order status is set by our team and cannot be edited here.
              </p>
            </div>

            <TemplateRequestForm
              v-if="originalTemplate && initialFormData"
              :template="originalTemplate"
              :initial-form-data="initialFormData"
              :existing-attachments="orderRef?.attachments ?? []"
              submit-title="Save your changes"
              submit-description="Your updates will be saved to this request. We'll notify you if anything else is needed."
              submit-button-text="Update request"
              submit-loading-text="Saving..."
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

    <SubmissionAccessModal
      :open="showAccessModal"
      :checkout-loading="accessCheckoutLoading"
      @close="showAccessModal = false"
      @continue="onAccessContinue"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useOrderUpdate } from '~/composables/useOrderUpdate';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import type { TemplateRequestFormData, ColorCustomization } from '~/types/templateRequest';
import type { OrderWithId } from '~/types/order';
import { ROUTES } from '~/constants/routes';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm from '~/components/TemplateRequestForm.vue';
import SubmissionAccessModal from '~/components/SubmissionAccessModal.vue';
import { useWhopAccess } from '~/composables/useWhopAccess';
import { useDraftRequestSubmitFlow } from '~/composables/useDraftRequestSubmitFlow';
import { WHOP_CHECKOUT_RETURN_PATH } from '~/constants/access';
import { useBuilderViewportSupport } from '~/composables/useBuilderViewportSupport';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'OrderEditPage' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const requestLayoutStore = useRequestLayoutStore();
const { orderToFormData, updateOrder } = useOrderUpdate();
const { ensureLoaded, fetchAccessFromServer, openCheckout } = useWhopAccess();
const { submitDraftOrder } = useDraftRequestSubmitFlow();
const { minWidth, isReady: viewportReady, isSupported: viewportSupported } = useBuilderViewportSupport();

const showAccessModal = ref(false);
const accessCheckoutLoading = ref(false);

const orderId = computed(() => route.params.id as string);
const userId = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? '');

const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const initialFormData = ref<TemplateRequestFormData | null>(null);
const orderRef = ref<OrderWithId | null>(null);
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
const isBuilderSupported = computed(() => !viewportReady.value || viewportSupported.value);

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

async function loadOrderAndTemplate(): Promise<void> {
  const uid = userId.value;
  if (!uid) {
    await router.replace('/login');
    return;
  }

  let order: OrderWithId | null = ordersStore.getOrderById(orderId.value) ?? null;
  if (!order) {
    order = await ordersStore.fetchOrder(uid, orderId.value);
  }

  if (!order || order.modificationLocked) {
    await router.replace('/sites');
    return;
  }

  orderRef.value = order;
  const template = showcaseStore.getTemplateById(order.templateId);
  if (!template) {
    await router.replace('/sites');
    return;
  }

  originalTemplate.value = template;
  initialFormData.value = orderToFormData(order);
  previewTemplate.value = createPreviewTemplate(template, order.projectDetails.colorCustomization);

  // Initialize layout store if not already active for this order
  const returnTo = `/orders/${orderId.value}/edit`;
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
}

function calculateViewportScale(): void {
  const container = previewContainerRef.value;
  if (!container) return;
  viewportScale.value = container.clientWidth / VIEWPORT_WIDTH;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await loadOrderAndTemplate();
  void ensureLoaded();
  await nextTick();
  calculateViewportScale();
  if (previewContainerRef.value) {
    resizeObserver = new ResizeObserver(() => calculateViewportScale());
    resizeObserver.observe(previewContainerRef.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

function openBuilder(): void {
  if (!isBuilderSupported.value) {
    feedbackType.value = 'error';
    feedbackMessage.value = `The visual layout editor is available on screens wider than ${minWidth - 1}px.`;
    return;
  }
  const id = orderId.value;
  if (!id) return;
  router.push({ path: `/orders/${id}/builder` });
}

async function onAccessContinue(): Promise<void> {
  accessCheckoutLoading.value = true;
  try {
    await openCheckout(WHOP_CHECKOUT_RETURN_PATH);
    showAccessModal.value = false;
  } catch {
    feedbackType.value = 'error';
    feedbackMessage.value = 'Could not open checkout. Please try again.';
  } finally {
    accessCheckoutLoading.value = false;
  }
}

async function handleSubmit(formData: TemplateRequestFormData): Promise<void> {
  const uid = userId.value;
  const order = orderRef.value;
  if (!uid || !order) return;

  const layout = requestLayoutStore.active
    ? requestLayoutStore.getLayoutForSubmission()
    : undefined;

  // Submitted (or other non-draft): rules require access for any client update.
  if (order.status !== 'draft') {
    const accessSnapshot = await fetchAccessFromServer();
    if (accessSnapshot?.hasAccess !== true) {
      showAccessModal.value = true;
      return;
    }

    isSubmitting.value = true;
    feedbackMessage.value = null;

    try {
      await updateOrder({
        userId: uid,
        orderId: order.id,
        formData,
        existingAttachments: order.attachments ?? [],
        newFiles: formData.files?.length ? [...formData.files] : undefined,
        layout,
      });

      requestLayoutStore.reset();
      await navigateTo({ path: ROUTES.sites, query: { tab: 'orders' } });
    } catch (err) {
      feedbackType.value = 'error';
      feedbackMessage.value = err instanceof Error ? err.message : 'Failed to update. Please try again.';
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  feedbackMessage.value = null;

  try {
    const result = await submitDraftOrder({ userId: uid, order, formData, layout, updateOrder });
    if (result.kind === 'subscription_required') {
      if (result.syncedOrder) {
        orderRef.value = result.syncedOrder;
      }
      feedbackType.value = 'error';
      feedbackMessage.value =
        'Your draft is saved. A subscription is required to submit — use Continue below.';
      showAccessModal.value = true;
    }
  } catch (err) {
    feedbackType.value = 'error';
    feedbackMessage.value = err instanceof Error ? err.message : 'Failed to update. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style src="~/assets/css/components.css"></style>
<style scoped src="~/assets/css/request-form.css"></style>
