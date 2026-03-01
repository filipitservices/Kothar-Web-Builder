<template>
  <div class="sites-container">
    <main class="sites-main">
      <div class="sites-content">
        <section class="sites-welcome">
          <h1 class="sites-welcome-title">Dashboard</h1>
          <p class="sites-welcome-subtitle">
            Manage your live websites and track template requests. Make updates, adjust content, or request changes from our team.
          </p>
        </section>

        <div class="dashboard-tabs">
          <button
            type="button"
            class="dashboard-tab"
            :class="{ 'dashboard-tab--active': activeTab === 'sites' }"
            :aria-selected="activeTab === 'sites'"
            @click="activeTab = 'sites'"
          >
            Live Sites
            <span v-if="sitesStore.siteSummaries.length > 0" class="dashboard-tab-count">
              {{ sitesStore.siteSummaries.length }}
            </span>
          </button>
          <button
            type="button"
            class="dashboard-tab"
            :class="{ 'dashboard-tab--active': activeTab === 'orders' }"
            :aria-selected="activeTab === 'orders'"
            @click="activeTab = 'orders'"
          >
            Orders
            <span v-if="ordersStore.orders.length > 0" class="dashboard-tab-count">
              {{ ordersStore.orders.length }}
            </span>
          </button>
        </div>

        <section v-show="activeTab === 'sites'" class="dashboard-panel" :aria-hidden="activeTab !== 'sites'">
          <div class="dashboard-table-wrapper">
            <table class="dashboard-table" role="table">
              <thead>
                <tr>
                  <th scope="col" class="dashboard-th dashboard-th--business">Business</th>
                  <th scope="col" class="dashboard-th dashboard-th--domain">Domain</th>
                  <th scope="col" class="dashboard-th dashboard-th--updated">Last update</th>
                  <th scope="col" class="dashboard-th dashboard-th--status">Status</th>
                  <th scope="col" class="dashboard-th dashboard-th--action"><span class="visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="site in sitesStore.siteSummaries"
                  :key="site.id"
                  class="dashboard-row"
                >
                  <td class="dashboard-td dashboard-td--business">
                    <span class="dashboard-cell-primary">{{ site.businessName }}</span>
                    <span class="dashboard-cell-meta">{{ site.industry }}</span>
                  </td>
                  <td class="dashboard-td dashboard-td--domain">
                    <span class="dashboard-cell-domain">{{ site.domainLabel }}</span>
                  </td>
                  <td class="dashboard-td dashboard-td--updated">
                    <span class="dashboard-cell-muted">{{ sitesStore.formatLastUpdated(site.lastUpdatedAt) }}</span>
                  </td>
                  <td class="dashboard-td dashboard-td--status">
                    <span
                      class="dashboard-pill dashboard-pill--site"
                      :class="`dashboard-pill--site-${site.status}`"
                    >
                      {{ sitesStore.getStatusLabel(site.status) }}
                    </span>
                  </td>
                  <td class="dashboard-td dashboard-td--action">
                    <NuxtLink :to="`/sites/${site.id}`" class="dashboard-action-link">
                      Manage
                      <svg class="dashboard-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="sitesStore.siteSummaries.length === 0" class="dashboard-empty">
            You don't have any live websites yet. When a site is delivered, it will appear here.
          </p>
        </section>

        <section v-show="activeTab === 'orders'" class="dashboard-panel" :aria-hidden="activeTab !== 'orders'">
          <div class="dashboard-table-wrapper">
            <table class="dashboard-table dashboard-table--orders" role="table">
              <thead>
                <tr>
                  <th scope="col" class="dashboard-th dashboard-th--template">Template</th>
                  <th scope="col" class="dashboard-th dashboard-th--date">Submitted</th>
                  <th scope="col" class="dashboard-th dashboard-th--status">Status</th>
                  <th scope="col" class="dashboard-th dashboard-th--edit">Editing</th>
                  <th scope="col" class="dashboard-th dashboard-th--action"><span class="visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in ordersStore.orders"
                  :key="order.id"
                  class="dashboard-row"
                >
                  <td class="dashboard-td dashboard-td--template">
                    <span class="dashboard-cell-primary">{{ order.templateName }}</span>
                    <span class="dashboard-cell-meta">{{ order.businessInfo.businessName }}</span>
                  </td>
                  <td class="dashboard-td dashboard-td--date">
                    <span class="dashboard-cell-muted">{{ ordersStore.formatOrderDate(order.createdAt) }}</span>
                  </td>
                  <td class="dashboard-td dashboard-td--status">
                    <span
                      class="dashboard-pill dashboard-pill--order"
                      :class="`dashboard-pill--order-${ordersStore.getOrderStatusClass(order.status)}`"
                    >
                      {{ ordersStore.getOrderStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="dashboard-td dashboard-td--edit">
                    <span
                      v-if="order.modificationLocked"
                      class="dashboard-cell-muted dashboard-cell--locked"
                      title="This order is being processed and cannot be edited"
                    >
                      Locked
                    </span>
                    <span v-else class="dashboard-cell-ok">Editable</span>
                  </td>
                  <td class="dashboard-td dashboard-td--action">
                    <NuxtLink
                      v-if="!order.modificationLocked"
                      :to="`/orders/${order.id}/edit`"
                      class="dashboard-action-link"
                    >
                      Modify
                      <svg class="dashboard-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </NuxtLink>
                    <span v-else class="dashboard-action-disabled" title="Editing is disabled while the order is being processed">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="ordersStore.orders.length === 0" class="dashboard-empty">
            You don't have any orders yet. Submit a template request from the dashboard to get started.
          </p>
        </section>
      </div>
    </main>

    <footer class="sites-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
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

<style scoped src="~/assets/css/sites.css"></style>
