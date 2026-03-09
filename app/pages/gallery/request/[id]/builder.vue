<template>
  <BuilderEditor v-if="ready" />
</template>

<script setup lang="ts">
/**
 * Request Builder Page
 *
 * Renders the builder within the request flow at /gallery/request/:id/builder.
 * Ensures requestLayoutStore is initialized for the given template before
 * mounting the editor. Redirects back to the request form if no valid
 * template context exists.
 *
 * The store check runs synchronously during setup for the common case
 * (store already active from the request page). The onMounted fallback
 * handles direct URL access where the store has not been initialized.
 */
import { ref, onMounted } from 'vue';
import { useShowcaseStore } from '~/stores/showcase';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import BuilderEditor from '~/components/BuilderEditor.vue';

definePageMeta({
  middleware: 'auth',
  layout: 'builder'
});

defineOptions({ name: 'RequestBuilderPage' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();
const requestLayoutStore = useRequestLayoutStore();

const templateId = computed(() => route.params.id as string);

const storeMatchesTemplate = requestLayoutStore.active
  && requestLayoutStore.sourceTemplateId === templateId.value;

const ready = ref(storeMatchesTemplate);

if (!storeMatchesTemplate) {
  onMounted(() => {
    const requestRoute = `/gallery/request/${templateId.value}`;

    const template = showcaseStore.getTemplateById(templateId.value);
    if (!template) {
      router.replace(requestRoute);
      return;
    }

    requestLayoutStore.initFromTemplate(template, requestRoute);
    ready.value = true;
  });
}
</script>
