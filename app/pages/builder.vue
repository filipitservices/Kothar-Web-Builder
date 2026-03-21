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

if (typeof orderIdQuery === 'string' && orderIdQuery.trim()) {
  router.replace(`/gallery/request/${orderIdQuery.trim()}/builder`);
} else if (requestLayoutStore.active && requestLayoutStore.sourceOrderId) {
  const target =
    requestLayoutStore.returnRoute && requestLayoutStore.returnRoute.includes('/orders/')
      ? `/orders/${requestLayoutStore.sourceOrderId}/builder`
      : `/gallery/request/${requestLayoutStore.sourceOrderId}/builder`;
  router.replace(target);
} else {
  router.replace('/gallery');
}
</script>

<template>
  <div />
</template>
