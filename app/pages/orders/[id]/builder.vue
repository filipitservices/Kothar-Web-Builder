<template>
  <BuilderEditor v-if="isReady && isSupported" />
  <BuilderViewportFallback
    v-else-if="isReady"
    :min-width="minWidth"
    :back-to="`/orders/${route.params.id}/edit`"
    back-label="Back to request details"
  />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BuilderEditor from '~/components/BuilderEditor.vue';
import BuilderViewportFallback from '~/components/BuilderViewportFallback.vue';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useShowcaseStore } from '~/stores/showcase';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import type { OrderWithId } from '~/types/order';
import { useBuilderViewportSupport } from '~/composables/useBuilderViewportSupport';

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

function getOrderIdFromRoute(): string | null {
  const id = route.params.id;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed.length ? trimmed : null;
}

async function initialiseLayoutFromOrder(orderId: string, uid: string): Promise<void> {
  let order: OrderWithId | null = ordersStore.getOrderById(orderId) ?? null;
  if (!order) {
    order = await ordersStore.fetchOrder(uid, orderId);
  }

  if (!order || order.modificationLocked) {
    await router.replace('/sites');
    return;
  }

  const template = showcaseStore.getTemplateById(order.templateId);
  if (!template) {
    await router.replace('/sites');
    return;
  }

  const returnTo = `/orders/${orderId}/edit`;

  if (!requestLayoutStore.active || requestLayoutStore.sourceOrderId !== order.id) {
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

