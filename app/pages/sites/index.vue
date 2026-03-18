<template>
  <div class="sites-container">
    <main class="sites-main">
      <div class="sites-content">
        <section class="sites-welcome">
          <div class="sites-welcome__top">
            <div class="sites-welcome__text">
              <h1 class="sites-welcome-title">My Sites</h1>
              <p class="sites-welcome-subtitle">
                Manage your live websites and track template requests. Make updates, adjust content, or request changes from our team.
              </p>
            </div>
            <div class="sites-gallery-cta">
              <p class="sites-gallery-cta__headline">Discover layout templates</p>
              <NuxtLink
                to="/gallery"
                class="sites-gallery-cta__btn"
                aria-label="Open Gallery — browse professional website templates"
              >
                Open Gallery
              </NuxtLink>
            </div>
          </div>
        </section>

        <div class="sites-tabs">
          <button
            type="button"
            class="sites-tab"
            :class="{ 'sites-tab--active': activeTab === 'sites' }"
            :aria-selected="activeTab === 'sites'"
            @click="activeTab = 'sites'"
          >
            Live Sites
            <span v-if="sitesStore.siteSummaries.length > 0" class="sites-tab-count">
              {{ sitesStore.siteSummaries.length }}
            </span>
          </button>
          <button
            type="button"
            class="sites-tab"
            :class="{ 'sites-tab--active': activeTab === 'orders' }"
            :aria-selected="activeTab === 'orders'"
            @click="activeTab = 'orders'"
          >
            Orders
            <span v-if="ordersStore.orders.length > 0" class="sites-tab-count">
              {{ ordersStore.orders.length }}
            </span>
          </button>
        </div>

        <section v-show="activeTab === 'sites'" class="sites-panel" :aria-hidden="activeTab !== 'sites'">
          <div class="sites-table-wrap">
            <table class="sites-table" role="table">
              <thead>
                <tr>
                  <th scope="col" class="sites-th">Business</th>
                  <th scope="col" class="sites-th">Domain</th>
                  <th scope="col" class="sites-th">Last update</th>
                  <th scope="col" class="sites-th">Status</th>
                  <th scope="col" class="sites-th"><span class="visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="site in sitesStore.siteSummaries"
                  :key="site.id"
                  class="sites-row"
                >
                  <td class="sites-td">
                    <span class="sites-cell-primary">{{ site.businessName }}</span>
                    <span class="sites-cell-meta">{{ site.industry }}</span>
                  </td>
                  <td class="sites-td">
                    <span class="sites-cell-domain">{{ site.domainLabel }}</span>
                  </td>
                  <td class="sites-td">
                    <span class="sites-cell-muted">{{ sitesStore.formatLastUpdated(site.lastUpdatedAt) }}</span>
                  </td>
                  <td class="sites-td">
                    <span
                      class="sites-pill"
                      :class="`sites-pill--site-${site.status}`"
                    >
                      {{ sitesStore.getStatusLabel(site.status) }}
                    </span>
                  </td>
                  <td class="sites-td">
                    <NuxtLink :to="`/sites/${site.id}`" class="sites-action-link">
                      Manage
                      <svg class="sites-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="sitesStore.siteSummaries.length === 0" class="sites-empty">
            You don't have any live websites yet. When a site is delivered, it will appear here.
          </p>
        </section>

        <section v-show="activeTab === 'orders'" class="sites-panel" :aria-hidden="activeTab !== 'orders'">
          <div class="sites-table-wrap">
            <table class="sites-table sites-table--orders" role="table">
              <thead>
                <tr>
                  <th scope="col" class="sites-th">Template</th>
                  <th scope="col" class="sites-th">Submitted</th>
                  <th scope="col" class="sites-th">Status</th>
                  <th scope="col" class="sites-th">Editing</th>
                  <th scope="col" class="sites-th"><span class="visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in ordersStore.orders"
                  :key="order.id"
                  class="sites-row"
                >
                  <td class="sites-td">
                    <span class="sites-cell-primary">{{ order.templateName }}</span>
                    <span class="sites-cell-meta">{{ order.businessInfo.businessName }}</span>
                  </td>
                  <td class="sites-td">
                    <span class="sites-cell-muted">{{ ordersStore.formatOrderDate(order.createdAt) }}</span>
                  </td>
                  <td class="sites-td">
                    <span
                      class="sites-pill"
                      :class="`sites-pill--order-${ordersStore.getOrderStatusClass(order.status)}`"
                    >
                      {{ ordersStore.getOrderStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="sites-td">
                    <span
                      v-if="order.modificationLocked"
                      class="sites-cell-muted sites-cell--locked"
                      title="This order is being processed and cannot be edited"
                    >
                      Locked
                    </span>
                    <span v-else class="sites-cell-ok">Editable</span>
                  </td>
                  <td class="sites-td">
                    <NuxtLink
                      v-if="!order.modificationLocked"
                      :to="`/orders/${order.id}/edit`"
                      class="sites-action-link"
                    >
                      Modify
                      <svg class="sites-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </NuxtLink>
                    <span v-else class="sites-action-disabled" title="Editing is disabled while the order is being processed">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="ordersStore.orders.length === 0" class="sites-empty">
            You don't have any orders yet. Submit a template request from the Gallery to get started.
          </p>
        </section>
      </div>
    </main>

    <footer class="sites-footer">
      <div class="sites-footer__inner">
        <p class="sites-footer__text">&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
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
