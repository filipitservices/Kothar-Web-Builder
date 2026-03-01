<template>
  <div class="sites-container">
    <main class="sites-main">
      <div class="sites-content">
        <section class="sites-welcome">
          <h1 class="sites-welcome-title">Your live websites</h1>
          <p class="sites-welcome-subtitle">
            Manage your sites and content here. Make updates, adjust hours, or request changes from our team.
          </p>
        </section>

        <section class="sites-list-section">
          <div class="sites-grid">
            <article
              v-for="site in sitesStore.siteSummaries"
              :key="site.id"
              class="site-card"
            >
              <div class="site-card-header">
                <span
                  class="site-card-status"
                  :class="`site-card-status--${site.status}`"
                >
                  {{ sitesStore.getStatusLabel(site.status) }}
                </span>
                <span class="site-card-industry">{{ site.industry }}</span>
              </div>
              <h2 class="site-card-name">{{ site.businessName }}</h2>
              <p class="site-card-domain">{{ site.domainLabel }}</p>
              <p class="site-card-updated">
                {{ sitesStore.formatLastUpdated(site.lastUpdatedAt) }}
              </p>
              <NuxtLink :to="`/sites/${site.id}`" class="site-card-action">
                Manage site
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </NuxtLink>
            </article>
          </div>

          <p v-if="sitesStore.siteSummaries.length === 0" class="sites-empty">
            You don't have any live websites yet. When a site is delivered, it will appear here.
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
const appConfig = useAppConfig();
</script>

<style scoped src="~/assets/css/sites.css"></style>
