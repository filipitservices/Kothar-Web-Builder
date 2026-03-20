<!--
  My Sites Page — Live Sites and Orders list.
  Route: /sites (protected). Layout: default (AppNavbar).
  Composes: SitesWelcomeHeader, SitesTabList, SitesLiveSitesPanel, SitesOrdersPanel.
  State: sites store (live sites), orders store (template requests from Firestore).
-->
<template>
  <div class="sites-container">
    <ClientOnly>
      <main class="sites-main">
        <SitesWelcomeHeader />
        <div class="sites-block">
          <div class="sites-content">
            <SitesTabList
          v-model="activeTab"
          :sites-count="sitesStore.siteSummaries.length"
          :orders-count="ordersStore.orders.length"
        />

        <SitesLiveSitesPanel
          :sites="sitesStore.siteSummaries"
          :visible="activeTab === 'sites'"
          :get-status-label="sitesStore.getStatusLabel as (s: string) => string"
          :format-last-updated="sitesStore.formatLastUpdated"
          panel-id="sites-panel-sites"
          labelled-by="sites-tab-sites"
        />

        <SitesOrdersPanel
          :orders="ordersStore.orders"
          :visible="activeTab === 'orders'"
          :get-order-status-label="ordersStore.getOrderStatusLabel"
          :get-order-status-class="ordersStore.getOrderStatusClass"
          :format-order-date="ordersStore.formatOrderDate"
          panel-id="sites-panel-orders"
          labelled-by="sites-tab-orders"
        />
          </div>
        </div>
      </main>
      <template #fallback>
        <main class="sites-main">
          <section class="sites-welcome" aria-labelledby="sites-welcome-title">
            <div class="sites-welcome__top">
              <div class="sites-welcome__text">
                <h1 id="sites-welcome-title" class="sites-welcome-title">My Sites</h1>
                <p class="sites-welcome-subtitle">Loading…</p>
              </div>
            </div>
          </section>
          <div class="sites-block">
            <div class="sites-content">
              <div class="sites-tabs" role="tablist">
                <button type="button" class="sites-tab sites-tab--active">Live Sites</button>
                <button type="button" class="sites-tab">Orders</button>
              </div>
              <div class="sites-panel sites-panel--loading">
                Loading…
              </div>
            </div>
          </div>
        </main>
      </template>
    </ClientOnly>

    <footer class="sites-footer">
      <div class="sites-footer__inner">
        <p class="sites-footer__text">&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/sites.css';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'SitesListPage' });

const sitesStore = useSitesStore();
const ordersStore = useOrdersStore();
const appConfig = useAppConfig();

const hasLiveSites = computed(() => sitesStore.siteSummaries.length > 0);
const hasOrders = computed(() => ordersStore.hasOrders);

const defaultTab = computed<'sites' | 'orders'>(() => {
  if (hasLiveSites.value) return 'sites';
  if (hasOrders.value) return 'orders';
  return 'sites';
});

const activeTab = ref<'sites' | 'orders'>('sites');

watch(defaultTab, (tab) => {
  activeTab.value = tab;
}, { immediate: true });

const authStore = useAuthStore();
const userId = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? '');

onMounted(() => {
  if (userId.value) ordersStore.subscribe(userId.value);
});

onUnmounted(() => {
  ordersStore.unsubscribeFromOrders();
});
</script>

