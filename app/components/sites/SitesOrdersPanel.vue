<!--
  SitesOrdersPanel — Panel listing template request orders.
  Responsibility: Render order entries with status, edit state, and Modify action.
  Data from orders store; no direct store mutation. Uses design tokens only.
-->
<template>
  <section
    :id="panelId"
    class="sites-panel"
    role="tabpanel"
    :aria-labelledby="labelledBy"
    :aria-hidden="!visible"
    :hidden="!visible"
  >
    <div v-if="orders.length > 0" class="sites-table-wrap">
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
            v-for="order in orders"
            :key="order.id"
            class="sites-row"
          >
            <td class="sites-td">
              <span class="sites-cell-primary">{{ order.templateName }}</span>
              <span class="sites-cell-meta">{{ order.businessInfo.businessName }}</span>
            </td>
            <td class="sites-td">
              <span class="sites-cell-muted">{{ formatOrderDate(order.createdAt) }}</span>
            </td>
            <td class="sites-td">
              <span
                class="sites-pill"
                :class="`sites-pill--order-${getOrderStatusClass(order.status)}`"
              >
                {{ getOrderStatusLabel(order.status) }}
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
                :aria-label="`Modify order: ${order.templateName}`"
              >
                Modify
                <svg class="sites-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </NuxtLink>
              <span
                v-else
                class="sites-action-disabled"
                title="Editing is disabled while the order is being processed"
              >
                —
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="listLoading" class="sites-panel sites-panel--loading" role="status">
      Loading orders…
    </div>
    <SitesEmptyState v-else context="orders" />
  </section>
</template>

<script setup lang="ts">
import type { OrderWithId } from '~/types/order';

defineOptions({ name: 'SitesOrdersPanel' });

withDefaults(
  defineProps<{
    orders: OrderWithId[];
    panelId?: string;
    labelledBy?: string;
    visible?: boolean;
    /** True while Firestore snapshot for orders has not emitted yet. */
    listLoading?: boolean;
    getOrderStatusLabel: (status: string) => string;
    getOrderStatusClass: (status: string) => string;
    formatOrderDate: (createdAt: unknown) => string;
  }>(),
  { listLoading: false }
);
</script>
