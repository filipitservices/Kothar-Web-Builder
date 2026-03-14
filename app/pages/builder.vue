<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useRequestLayoutStore } from '~/stores/requestLayout';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'LegacyBuilderRedirect' });

const route = useRoute();
const router = useRouter();
const requestLayoutStore = useRequestLayoutStore();

const orderIdQuery = route.query.orderId;

// #region agent log
const logLegacy = (branch: string, data?: Record<string, unknown>) => {
  fetch('http://127.0.0.1:7676/ingest/056ffe36-1885-4d94-b82c-e70f502f51ae', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e556b6' }, body: JSON.stringify({ sessionId: 'e556b6', location: 'app/pages/builder.vue:redirect', message: 'Legacy /builder redirect branch', data: { branch, orderIdQuery: orderIdQuery ?? null, active: requestLayoutStore.active, sourceOrderId: requestLayoutStore.sourceOrderId ?? null, ...data }, timestamp: Date.now(), hypothesisId: 'H2' }) }).catch(() => {});
};
// #endregion

if (typeof orderIdQuery === 'string' && orderIdQuery.trim()) {
  logLegacy('query', { target: `/gallery/request/${orderIdQuery.trim()}/builder` });
  router.replace(`/gallery/request/${orderIdQuery.trim()}/builder`);
} else if (requestLayoutStore.active && requestLayoutStore.sourceOrderId) {
  const target =
    requestLayoutStore.returnRoute && requestLayoutStore.returnRoute.includes('/orders/')
      ? `/orders/${requestLayoutStore.sourceOrderId}/builder`
      : `/gallery/request/${requestLayoutStore.sourceOrderId}/builder`;
  logLegacy('store', { target });
  router.replace(target);
} else {
  logLegacy('dashboard');
  router.replace('/dashboard');
}
</script>

<template>
  <div />
</template>
