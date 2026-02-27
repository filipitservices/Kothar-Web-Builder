<template>
  <nav class="app-navbar" aria-label="Main navigation">
    <div class="app-navbar__inner">
      <div class="app-navbar__left">
        <NuxtLink
          v-if="showBackToDashboard"
          to="/dashboard"
          class="app-navbar__back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="app-navbar__back-icon" aria-hidden="true">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          <span>Back to Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/" class="app-navbar__logo">
          <span class="app-navbar__logo-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
              <line x1="7" y1="9" x2="17" y2="9" />
              <line x1="7" y1="15" x2="15" y2="15" />
            </svg>
          </span>
          <span class="app-navbar__logo-text">
            {{ appConfig.appName }}
          </span>
        </NuxtLink>
      </div>
      <div class="app-navbar__right">
        <UserMenu :show-name="showUserName" />
        <ClientOnly v-if="showCta">
          <NuxtLink
            v-if="isInitialized"
            :to="ctaTo"
            class="app-navbar__cta"
          >
            {{ ctaLabel }}
          </NuxtLink>
          <span v-else class="app-navbar__cta-placeholder" aria-hidden="true" />
          <template #fallback>
            <span class="app-navbar__cta-placeholder" aria-hidden="true" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import UserMenu from '~/components/UserMenu.vue';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const { isAuthenticated, isInitialized } = useAuth();
const appConfig = useAppConfig();

const showBackToDashboard = computed(() => {
  const path = route.path;
  return path.startsWith('/gallery/request');
});

const showUserName = computed(() => {
  const path = route.path;
  return path === '/dashboard' || path.startsWith('/gallery/request');
});

const showCta = computed(() => route.path === '/');

const ctaTo = computed(() =>
  isAuthenticated.value ? '/dashboard' : '/login'
);

const ctaLabel = computed(() =>
  isAuthenticated.value ? 'Dashboard' : 'Start Building'
);
</script>
