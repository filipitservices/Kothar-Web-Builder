<template>
  <BuilderEditor />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BuilderEditor from '~/components/BuilderEditor.vue';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useShowcaseStore } from '~/stores/showcase';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import type { OrderWithId } from '~/types/order';

definePageMeta({
  middleware: 'auth',
  layout: 'builder',
});

defineOptions({ name: 'RequestBuilderPage' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const showcaseStore = useShowcaseStore();
const requestLayoutStore = useRequestLayoutStore();

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

  if (!order) {
    logReq('redirect', { reason: 'order_not_found', orderId }, 'H5');
    await router.replace('/dashboard');
    return;
  }

  const template = showcaseStore.getTemplateById(order.templateId);
  if (!template) {
    logReq('redirect', { reason: 'template_not_found', orderId, templateId: order.templateId }, 'H5');
    await router.replace('/dashboard');
    return;
  }

  const returnTo = `/gallery/request/${orderId}`;

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
    logReq('before_setReturnRoute', { returnTo }, 'H1');
    requestLayoutStore.setReturnRoute(returnTo);
  }
}

// #region agent log
const logReq = (msg: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7676/ingest/056ffe36-1885-4d94-b82c-e70f502f51ae', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e556b6' }, body: JSON.stringify({ sessionId: 'e556b6', location: 'app/pages/gallery/request/[id]/builder.vue', message: msg, data, timestamp: Date.now(), hypothesisId }) }).catch(() => {});
};
// #endregion

async function ensureRequestContext(): Promise<void> {
  const orderId = getOrderIdFromRoute();
  logReq('ensureRequestContext', { orderId: orderId ?? null, paramsId: route.params.id }, 'H4');
  if (!orderId) {
    logReq('redirect', { reason: 'no_orderId' }, 'H4');
    await router.replace('/dashboard');
    return;
  }

  const uid = authStore.uid ?? authStore.currentUser?.uid ?? null;
  if (!uid) {
    logReq('bail_no_uid', { orderId }, 'H3');
    return;
  }

  await initialiseLayoutFromOrder(orderId, uid);
}

onMounted(async () => {
  const orderId = getOrderIdFromRoute();
  if (!orderId) {
    await router.replace('/dashboard');
    return;
  }

  await ensureRequestContext();
});

watch(
  () => authStore.uid ?? authStore.currentUser?.uid ?? null,
  async (uid) => {
    if (!uid) return;
    const orderId = getOrderIdFromRoute();
    if (!orderId) return;
    await ensureRequestContext();
  },
);
</script>

