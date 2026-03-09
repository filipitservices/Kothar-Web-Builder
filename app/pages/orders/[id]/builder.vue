<template>
  <BuilderEditor v-if="ready" />
</template>

<script setup lang="ts">
/**
 * Order Builder Page
 *
 * Renders the builder within the order editing flow at /orders/:id/builder.
 * Ensures requestLayoutStore is initialized for the given order before
 * mounting the editor. Redirects back to the order edit form if no valid
 * order context exists.
 *
 * The store check runs synchronously during setup for the common case
 * (store already active from the order edit page). The onMounted fallback
 * handles direct URL access where the store has not been initialized.
 */
import { ref, onMounted } from 'vue';
import { useShowcaseStore } from '~/stores/showcase';
import { useAuthStore } from '~/stores/auth';
import { useOrdersStore } from '~/stores/orders';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import BuilderEditor from '~/components/BuilderEditor.vue';

definePageMeta({
  middleware: 'auth',
  layout: 'builder'
});

defineOptions({ name: 'OrderBuilderPage' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const authStore = useAuthStore();
const ordersStore = useOrdersStore();
const requestLayoutStore = useRequestLayoutStore();

const orderId = computed(() => route.params.id as string);

const storeMatchesOrder = requestLayoutStore.active
  && requestLayoutStore.sourceOrderId === orderId.value;

const ready = ref(storeMatchesOrder);

if (!storeMatchesOrder) {
  onMounted(async () => {
    const editRoute = `/orders/${orderId.value}/edit`;

    const uid = authStore.uid ?? authStore.currentUser?.uid;
    if (!uid) {
      await router.replace('/login');
      return;
    }

    let order = ordersStore.getOrderById(orderId.value) ?? null;
    if (!order) {
      order = await ordersStore.fetchOrder(uid, orderId.value);
    }

    if (!order) {
      await router.replace(editRoute);
      return;
    }

    const template = showcaseStore.getTemplateById(order.templateId);
    if (!template) {
      await router.replace(editRoute);
      return;
    }

    if (order.layout) {
      requestLayoutStore.initFromOrderLayout(
        order.layout,
        order.id,
        template.sections,
        editRoute
      );
    } else {
      requestLayoutStore.initFromTemplateForOrder(template, order.id, editRoute);
    }

    ready.value = true;
  });
}
</script>
