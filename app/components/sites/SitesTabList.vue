<!--
  SitesTabList — Tab list for Live Sites / Orders panels.
  Responsibility: Switch between panels; expose aria-selected and role="tablist" for accessibility.
  Props down, events up; parent owns activeTab state.
-->
<template>
  <div
    class="sites-tabs"
    role="tablist"
    aria-label="Sites and orders"
  >
    <button
      type="button"
      role="tab"
      class="sites-tab"
      :class="{ 'sites-tab--active': modelValue === 'sites' }"
      :aria-selected="modelValue === 'sites'"
      :id="tabIdSites"
      aria-controls="sites-panel-sites"
      @click="emit('update:modelValue', 'sites')"
      @keydown.arrow-right.prevent="focusTab('orders')"
      @keydown.arrow-left.prevent="focusTab('orders')"
    >
      Live Sites
      <span v-if="sitesCount > 0" class="sites-tab-count" aria-hidden="true">
        {{ sitesCount }}
      </span>
    </button>
    <button
      type="button"
      role="tab"
      class="sites-tab"
      :class="{ 'sites-tab--active': modelValue === 'orders' }"
      :aria-selected="modelValue === 'orders'"
      :id="tabIdOrders"
      aria-controls="sites-panel-orders"
      @click="emit('update:modelValue', 'orders')"
      @keydown.arrow-right.prevent="focusTab('sites')"
      @keydown.arrow-left.prevent="focusTab('sites')"
    >
      Orders
      <span v-if="ordersCount > 0" class="sites-tab-count" aria-hidden="true">
        {{ ordersCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SitesTabList' });

const props = defineProps<{
  modelValue: 'sites' | 'orders';
  sitesCount: number;
  ordersCount: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: 'sites' | 'orders'];
}>();

const tabIdSites = 'sites-tab-sites';
const tabIdOrders = 'sites-tab-orders';

function focusTab(tab: 'sites' | 'orders') {
  const el = document.getElementById(tab === 'sites' ? tabIdSites : tabIdOrders);
  if (el) (el as HTMLButtonElement).focus();
}
</script>
