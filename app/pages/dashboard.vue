<template>
  <div class="dashboard-container">
    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-content">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <h1 class="welcome-title">Welcome back{{ userName ? `, ${userName}` : '' }}</h1>
          <p class="welcome-subtitle">What would you like to create today?</p>
        </section>

        <!-- Builder Hero Card -->
        <section class="builder-hero">
          <NuxtLink to="/builder" class="builder-card">
            <div class="builder-card__content">
              <div class="builder-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="builder-card__text">
                <h2 class="builder-card__title">Start Building</h2>
                <p class="builder-card__description">
                  Create your website from scratch. Drag blocks, customize content, and preview on desktop and mobile.
                </p>
              </div>
            </div>
            <div class="builder-card__action">
              <span>Open Builder</span>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </NuxtLink>
        </section>

        <!-- Templates Showcase Section -->
        <section class="templates-section">
          <div class="templates-header">
            <div class="templates-header__text">
              <h2 class="templates-header__title">Professional Templates</h2>
              <p class="templates-header__subtitle">
                Start with a professionally designed website. Preview, customize colors, and we'll build it for you.
              </p>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="category-filter">
            <button 
              class="category-btn"
              :class="{ 'active': selectedCategory === null }"
              @click="selectedCategory = null"
            >
              All
            </button>
            <button 
              v-for="category in categories" 
              :key="category"
              class="category-btn"
              :class="{ 'active': selectedCategory === category }"
              @click="selectedCategory = category"
            >
              {{ getCategoryLabel(category) }}
            </button>
          </div>

          <!-- Templates Grid -->
          <div class="templates-grid">
            <div 
              v-for="template in filteredTemplates" 
              :key="template.id" 
              class="template-card"
              @click="openShowcase(template)"
            >
              <div class="template-preview">
                <div class="preview-placeholder" :style="getPreviewStyle(template)">
                  <div class="preview-browser">
                    <div class="browser-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div class="preview-content">
                      <div class="preview-hero" :style="{ background: template.colorScheme.primary }"></div>
                      <div class="preview-sections">
                        <div class="preview-section"></div>
                        <div class="preview-section"></div>
                        <div class="preview-section"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="template-info">
                <span class="template-industry">{{ template.industry }}</span>
                <h3 class="template-name">{{ template.name }}</h3>
                <p class="template-description">{{ template.description }}</p>
                <div class="template-meta">
                  <span class="section-count">{{ template.sections.length }} sections</span>
                  <span class="view-cta">Preview →</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Showcase Modal -->
    <ShowcaseModal
      v-if="showModal"
      :template="selectedTemplate"
      @close="closeShowcase"
      @choose="handleChooseDesign"
    />

    <!-- Footer -->
    <footer class="dashboard-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; 2026 SOSG. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useShowcaseStore, type ShowcaseTemplate, type ShowcaseCategory } from '~/stores/showcase';
import ShowcaseModal from '~/components/ShowcaseModal.vue';

// Route protection: Requires authentication
definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'DashboardPage', display: 'Dashboard' });

const { currentUser } = useAuth();
const showcaseStore = useShowcaseStore();
const router = useRouter();

// User name for greeting
const userName = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || '';
});

// Template showcase state
const selectedCategory = ref<ShowcaseCategory | null>(null);
const showModal = ref(false);
const selectedTemplate = ref<ShowcaseTemplate | null>(null);

// Computed
const categories = computed(() => showcaseStore.categories);

const filteredTemplates = computed(() => {
  if (selectedCategory.value === null) {
    return showcaseStore.getAllTemplates;
  }
  return showcaseStore.getTemplatesByCategory(selectedCategory.value);
});

// Methods
const getCategoryLabel = (category: ShowcaseCategory): string => {
  return showcaseStore.getCategoryLabel(category);
};

const getPreviewStyle = (template: ShowcaseTemplate) => {
  return {
    '--primary-color': template.colorScheme.primary,
    '--secondary-color': template.colorScheme.secondary,
    '--bg-color': template.colorScheme.background
  };
};

const openShowcase = (template: ShowcaseTemplate) => {
  selectedTemplate.value = template;
  showModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeShowcase = () => {
  showModal.value = false;
  selectedTemplate.value = null;
  document.body.style.overflow = '';
};

const handleChooseDesign = (templateId: string) => {
  closeShowcase();
  router.push(`/gallery/request/${templateId}`);
};
</script>

<style src="~/assets/css/style.css"></style>
<style scoped src="~/assets/css/dashboard.css"></style>
