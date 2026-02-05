```vue
<template>
  <div class="gallery-container">
    <!-- Navigation Header -->
    <nav class="gallery-header">
      <div class="nav-inner">
        <div class="nav-left">
          <NuxtLink to="/dashboard" class="back-link">
            <svg viewBox="0 0 20 20" fill="currentColor" class="back-icon">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Dashboard</span>
          </NuxtLink>
        </div>
        <div class="nav-brand">
          <span class="logo">Template Gallery</span>
        </div>
        <div class="nav-actions">
          <UserMenu />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="gallery-main">
      <!-- Hero Section -->
      <section class="gallery-hero">
        <h1 class="gallery-title">Professional Website Templates</h1>
        <p class="gallery-subtitle">
          Browse our collection of fully-designed websites for small and medium businesses. 
          Choose a design, and we'll help you customize it for your business.
        </p>
      </section>

      <!-- Category Filter -->
      <section class="category-section">
        <div class="category-filter">
          <button 
            class="category-btn"
            :class="{ 'active': selectedCategory === null }"
            @click="selectedCategory = null"
          >
            All Templates
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
      </section>

      <!-- Templates Grid -->
      <section class="templates-section">
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
    </main>

    <!-- Showcase Modal -->
    <ShowcaseModal
      v-if="showModal"
      :template="selectedTemplate"
      @close="closeShowcase"
      @choose="handleChooseDesign"
    />

    <!-- Footer -->
    <footer class="gallery-footer">
      <div class="footer-inner">
        <p class="footer-text">&copy; 2026 SOSG. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useShowcaseStore, type ShowcaseTemplate, type ShowcaseCategory } from '~/stores/showcase';
import UserMenu from '~/components/UserMenu.vue';
import ShowcaseModal from '~/components/ShowcaseModal.vue';

// Route protection: Requires authentication
definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'GalleryPage', display: 'Template Gallery' });

const showcaseStore = useShowcaseStore();
const router = useRouter();

// State
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
  // Prevent body scroll when modal is open
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
<style scoped src="~/assets/css/gallery.css"></style>
```
