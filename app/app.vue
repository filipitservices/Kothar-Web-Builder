<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <ToastContainer />
      <UnsavedChangesDialog />
      <RequestFlowErrorModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import UnsavedChangesDialog from '~/components/UnsavedChangesDialog.vue';
import RequestFlowErrorModal from '~/components/RequestFlowErrorModal.vue';

const appConfig = useAppConfig();

useHead({
  title: appConfig.fullTitle,
  titleTemplate: (title?: string) =>
    title ? `${title} · ${appConfig.appName}` : appConfig.fullTitle,
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
}
</style>
