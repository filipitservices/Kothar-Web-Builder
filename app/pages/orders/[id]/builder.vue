<template>
  <BuilderEditor
    v-if="isReady && isSupported"
    :on-leave-discard="discardUnsavedAndRehydrate"
  />
  <BuilderViewportFallback
    v-else-if="isReady"
    :min-width="minWidth"
    :back-to="`/orders/${route.params.id}/edit`"
    back-label="Back to request details"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BuilderEditor from '~/components/BuilderEditor.vue';
import BuilderViewportFallback from '~/components/BuilderViewportFallback.vue';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useShowcaseStore } from '~/stores/showcase';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import type { OrderStatus, OrderWithId } from '~/types/order';
import { useBuilderViewportSupport } from '~/composables/useBuilderViewportSupport';
import { useUnsavedChanges } from '~/composables/useUnsavedChanges';
import { usePersistAssistantChat } from '~/composables/usePersistAssistantChat';

definePageMeta({
  middleware: 'auth',
  layout: 'builder',
});

defineOptions({ name: 'OrderBuilderPage' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const showcaseStore = useShowcaseStore();
const requestLayoutStore = useRequestLayoutStore();
const { minWidth, isReady, isSupported } = useBuilderViewportSupport();
const orderStatus = ref<OrderStatus | null>(null);
const currentOrder: Ref<OrderWithId | null> = ref(null);

const userIdForChat = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? null);
usePersistAssistantChat(currentOrder, userIdForChat);

function getOrderIdFromRoute(): string | null {
  const id = route.params.id;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed.length ? trimmed : null;
}

async function initialiseLayoutFromOrder(
  orderId: string,
  uid: string,
  force = false
): Promise<void> {
  let order: OrderWithId | null = ordersStore.getOrderById(orderId) ?? null;
  if (!order) {
    order = await ordersStore.fetchOrder(uid, orderId);
  }

  if (!order || order.modificationLocked) {
    orderStatus.value = null;
    currentOrder.value = null;
    await router.replace('/sites');
    return;
  }
  orderStatus.value = order.status;
  currentOrder.value = order;

  const template = showcaseStore.getTemplateById(order.templateId);
  if (!template) {
    currentOrder.value = null;
    await router.replace('/sites');
    return;
  }

  const returnTo = `/orders/${orderId}/edit`;

  if (
    force ||
    !requestLayoutStore.active ||
    requestLayoutStore.sourceOrderId !== order.id
  ) {
    if (order.layout) {
      requestLayoutStore.initFromOrderLayout(
        order.layout,
        order.id,
        template.sections,
        returnTo,
      );
    } else {
      requestLayoutStore.initFromTemplateForOrder(template, order.id, returnTo);
    }
  } else if (requestLayoutStore.returnRoute !== returnTo) {
    requestLayoutStore.setReturnRoute(returnTo);
  }
}

async function discardUnsavedAndRehydrate(): Promise<void> {
  const orderId = getOrderIdFromRoute();
  const uid = authStore.uid ?? authStore.currentUser?.uid ?? null;
  if (!orderId || !uid) return;
  await initialiseLayoutFromOrder(orderId, uid, true);
}

const isDirty = computed(() => requestLayoutStore.isLayoutDirtyVsBaseline());
const hasUnsavedSession = computed(() => orderStatus.value === 'draft');

useUnsavedChanges({
  isDirty,
  hasUnsavedSession,
  onDiscard: discardUnsavedAndRehydrate,
});

async function ensureOrderContext(): Promise<void> {
  const orderId = getOrderIdFromRoute();
  if (!orderId) {
    await router.replace('/sites');
    return;
  }

  const uid = authStore.uid ?? authStore.currentUser?.uid ?? null;
  if (!uid) return;

  await initialiseLayoutFromOrder(orderId, uid);
}

onMounted(async () => {
  const orderId = getOrderIdFromRoute();
  if (!orderId) {
    await router.replace('/sites');
    return;
  }

  await ensureOrderContext();
});

watch(
  () => authStore.uid ?? authStore.currentUser?.uid ?? null,
  async (uid) => {
    if (!uid) return;
    const orderId = getOrderIdFromRoute();
    if (!orderId) return;
    await ensureOrderContext();
  },
);
</script>

