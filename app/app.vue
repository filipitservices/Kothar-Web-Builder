<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import { useBusinessStore } from '~/stores/business';

const quizStore = useQuizStore();
const businessStore = useBusinessStore();
const appConfig = useAppConfig();

useHead({
  title: appConfig.fullTitle,
  titleTemplate: (title?: string) =>
    title ? `${title} · ${appConfig.appName}` : appConfig.fullTitle,
});

// When quiz is completed, save answers to business store
watch(() => quizStore.quizCompleted, (completed) => {
  if (completed) {
    businessStore.updateBusinessInfo({
      companyName: quizStore.getAnswer('companyName'),
      email: quizStore.getAnswer('email'),
      telephone: quizStore.getAnswer('telephone'),
      address: quizStore.getAnswer('address'),
      city: quizStore.getAnswer('city'),
      postalCode: quizStore.getAnswer('postalCode'),
      website: quizStore.getAnswer('website'),
      businessHours: quizStore.getAnswer('businessHours'),
      taxId: quizStore.getAnswer('taxId')
    });
  }
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
