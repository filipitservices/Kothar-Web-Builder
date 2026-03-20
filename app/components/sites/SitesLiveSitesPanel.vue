<!--
  SitesLiveSitesPanel — Panel listing delivered (live) websites.
  Responsibility: Render site entries with clear affordances; Manage action per row.
  Data from sites store; no direct store mutation. Uses design tokens only.
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
    <div v-if="sites.length > 0" class="sites-table-wrap">
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
            v-for="site in sites"
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
              <span class="sites-cell-muted">{{ formatLastUpdated(site.lastUpdatedAt) }}</span>
            </td>
            <td class="sites-td">
              <span
                class="sites-pill"
                :class="`sites-pill--site-${site.status}`"
              >
                {{ getStatusLabel(site.status) }}
              </span>
            </td>
            <td class="sites-td">
              <NuxtLink
                :to="`/sites/${site.id}`"
                class="sites-action-link"
                :aria-label="`Manage ${site.businessName}`"
              >
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
    <SitesEmptyState v-else context="sites" />
  </section>
</template>

<script setup lang="ts">
import type { SiteSummary } from '~/stores/sites';

defineOptions({ name: 'SitesLiveSitesPanel' });

const props = defineProps<{
  sites: SiteSummary[];
  panelId?: string;
  labelledBy?: string;
  visible?: boolean;
  getStatusLabel: (status: string) => string;
  formatLastUpdated: (isoDate: string) => string;
}>();
</script>
