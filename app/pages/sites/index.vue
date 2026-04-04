<!--
  My Sites Page — Live Sites and Orders list.
  Route: /sites (protected). Layout: default (AppNavbar).
  Composes: PrimaryPageHero, SitesTabList, SitesLiveSitesPanel, SitesOrdersPanel.
  State: sites store (live sites), orders store (template requests from Firestore).
  Tab: optional ?tab=sites|orders; when absent, derived from account state.
-->
<template>
  <div class="sites-container">
    <ClientOnly>
      <main class="sites-main">
        <PrimaryPageHero
          title-id="sites-welcome-title"
          title="My Sites"
          subtitle="Manage your live websites and track requests."
          cta-headline="Discover layout templates"
          cta-label="Open Gallery"
          :cta-to="ROUTES.gallery"
          cta-aria-label="Open Gallery — browse professional website templates"
        />
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
              @delete-draft="onDeleteDraftRequest"
            />
          </div>
        </div>
      </main>
      <template #fallback>
        <main class="sites-main">
          <PrimaryPageHero
            title-id="sites-welcome-title"
            title="My Sites"
            subtitle="Loading…"
            cta-headline="Discover layout templates"
            cta-label="Open Gallery"
            :cta-to="ROUTES.gallery"
            cta-aria-label="Open Gallery — browse professional website templates"
          />
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

    <DeleteDraftRequestModal
      :open="draftToDelete !== null"
      :template-name="draftToDelete?.templateName ?? 'this request'"
      :deleting="deleteDraftLoading"
      @close="dismissDeleteModal"
      @confirm="confirmDeleteDraft"
    />

    <footer class="sites-footer">
      <div class="sites-footer__inner">
        <p class="sites-footer__text">&copy; {{ new Date().getFullYear() }} {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/sites.css';
import { ROUTES } from '~/constants/routes';
import type { OrderWithId } from '~/types/order';
import DeleteDraftRequestModal from '~/components/DeleteDraftRequestModal.vue';
import { deleteDraftRequest, DeleteDraftRequestError } from '~/composables/useDeleteDraftRequest';
import { useToast } from '~/composables/useToast';
import { useRequestLayoutStore } from '~/stores/requestLayout';

definePageMeta({
  middleware: 'auth',
});

defineOptions({ name: 'SitesListPage' });

const route = useRoute();
const router = useRouter();
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

function tabFromQuery(): 'sites' | 'orders' | null {
  const raw = route.query.tab;
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === 'orders' || v === 'sites') return v;
  return null;
}

const activeTab = computed({
  get(): 'sites' | 'orders' {
    const q = tabFromQuery();
    if (q !== null) return q;
    return defaultTab.value;
  },
  set(tab: 'sites' | 'orders') {
    router.replace({ path: '/sites', query: { tab } });
  },
});

const authStore = useAuthStore();
const userId = computed(() => authStore.uid ?? authStore.currentUser?.uid ?? '');

useOrdersSnapshotWhenFocused(userId);

const requestLayoutStore = useRequestLayoutStore();
const toast = useToast();

const draftToDelete = ref<OrderWithId | null>(null);
const deleteDraftLoading = ref(false);

function onDeleteDraftRequest(order: OrderWithId): void {
  draftToDelete.value = order;
}

function dismissDeleteModal(): void {
  draftToDelete.value = null;
}

async function confirmDeleteDraft(): Promise<void> {
  const pending = draftToDelete.value;
  const uid = userId.value;
  if (!pending || !uid) return;

  deleteDraftLoading.value = true;
  try {
    await deleteDraftRequest(uid, pending.id);
    requestLayoutStore.reset();
  } catch (err) {
    toast.showError(
      err instanceof DeleteDraftRequestError
        ? err.message
        : 'Could not delete this draft. Please try again.'
    );
  } finally {
    deleteDraftLoading.value = false;
    draftToDelete.value = null;
  }
}
</script>
