<template>
  <div class="req">
    <main class="req__main">
      <div class="req__content">
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
              <div class="req-preview-links">
                <NuxtLink to="/sites" class="change-template-link">
                  Back to dashboard →
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useOrderUpdate } from '~/composables/useOrderUpdate';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import type { ColorCustomization } from '~/types/templateRequest';
import type { OrderWithId } from '~/types/order';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm from '~/components/TemplateRequestForm.vue';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'OrderEditPage' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const { orderToFormData, updateOrder } = useOrderUpdate();

const orderId = computed(() => route.params.id as string);
const userId = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? '');

const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);
const initialFormData = ref<TemplateRequestFormData | null>(null);
const orderRef = ref<OrderWithId | null>(null);
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
}

function calculateViewportScale(): void {
  const container = previewContainerRef.value;
  if (!container) return;
  viewportScale.value = container.clientWidth / VIEWPORT_WIDTH;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await loadOrderAndTemplate();
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

async function handleSubmit(formData: TemplateRequestFormData): Promise<void> {
  const uid = userId.value;
  const order = orderRef.value;
  if (!uid || !order) return;

  isSubmitting.value = true;
  try {
    await updateOrder({
      userId: uid,
      orderId: order.id,
      formData,
      existingAttachments: order.attachments ?? [],
      newFiles: formData.files?.length ? [...formData.files] : undefined
    });
    alert('Your request has been updated.');
    await router.push('/sites');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update. Please try again.';
    alert(message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style src="~/assets/css/components.css"></style>
<style scoped src="~/assets/css/request-form.css"></style>
