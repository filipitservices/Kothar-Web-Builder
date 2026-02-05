```vue
<template>
  <div class="dashboard-container">
    <!-- Navigation Header -->
    <nav class="dashboard-header">
      <div class="nav-inner">
        <div class="nav-brand">
          <NuxtLink to="/" class="logo">SOSG</NuxtLink>
        </div>
        <div class="nav-actions">
          <UserMenu :show-name="true" />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-content">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <h1 class="welcome-title">Welcome back{{ userName ? `, ${userName}` : '' }}</h1>
          <p class="welcome-subtitle">Choose where you'd like to start today</p>
        </section>

        <!-- Spaces Grid -->
        <section class="spaces-section">
          <div class="spaces-grid">
            <!-- Website Builder Space -->
            <NuxtLink to="/builder" class="space-card space-card--builder">
              <div class="space-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="space-content">
                <h2 class="space-title">Website Builder</h2>
                <p class="space-description">
                  Build your website block-by-block. Drag, customize, and preview on desktop and mobile.
                </p>
              </div>
              <div class="space-action">
                <span class="action-text">Open Builder</span>
                <svg class="action-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </NuxtLink>

            <!-- Template Gallery Space -->
            <NuxtLink to="/gallery" class="space-card space-card--gallery">
              <div class="space-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div class="space-content">
                <h2 class="space-title">Template Gallery</h2>
                <p class="space-description">
                  Browse professional website designs. Preview full layouts and request a custom build.
                </p>
              </div>
              <div class="space-action">
                <span class="action-text">Browse Templates</span>
                <svg class="action-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Quick Stats (Optional future enhancement) -->
        <section class="stats-section">
          <div class="stats-header">
            <h3 class="stats-title">Quick Actions</h3>
          </div>
          <div class="quick-actions">
            <button class="quick-action" @click="navigateTo('/builder')">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>New Project</span>
            </button>
            <button class="quick-action" @click="navigateTo('/gallery')">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
                <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>Find Template</span>
            </button>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; 2026 SOSG. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import UserMenu from '~/components/UserMenu.vue';

// Route protection: Requires authentication
definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'DashboardPage', display: 'Dashboard' });

const { currentUser } = useAuth();

const userName = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || '';
});
</script>

<style src="~/assets/css/style.css"></style>
<style scoped src="~/assets/css/dashboard.css"></style>
```
