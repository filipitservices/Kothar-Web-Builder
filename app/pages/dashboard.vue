<template>
  <div class="dashboard-container">
    <!-- Control strip: greeting + primary action -->
    <header class="dashboard-strip">
      <div class="dashboard-strip__inner">
        <div class="dashboard-strip__greeting">
          <h1 class="dashboard-strip__title">Welcome back{{ userName ? `, ${userName}` : '' }}</h1>
          <p class="dashboard-strip__subtitle">Choose a path below to get started.</p>
        </div>
        <NuxtLink to="/builder" class="dashboard-strip__cta">
          <span class="dashboard-strip__cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </span>
          <span>Open Builder</span>
          <svg class="dashboard-strip__cta-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>
    </header>

    <!-- Templates: contrast block -->
    <section class="dashboard-showcase" aria-labelledby="showcase-heading">
      <div class="dashboard-showcase__inner">
        <div class="dashboard-showcase__head">
          <div class="dashboard-showcase__head-text">
            <h2 id="showcase-heading" class="dashboard-showcase__title">Professional Templates</h2>
            <p class="dashboard-showcase__subtitle">Preview, customize, and request a design. We build it for you.</p>
          </div>
          <div class="dashboard-showcase__filter" role="tablist" aria-label="Template category">
            <button
              type="button"
              role="tab"
              class="dashboard-pill"
              :class="{ 'dashboard-pill--active': selectedCategory === null }"
              :aria-selected="selectedCategory === null"
              @click="selectedCategory = null"
            >
              All
            </button>
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              role="tab"
              class="dashboard-pill"
              :class="{ 'dashboard-pill--active': selectedCategory === category }"
              :aria-selected="selectedCategory === category"
              @click="selectedCategory = category"
            >
              {{ getCategoryLabel(category) }}
            </button>
          </div>
        </div>

        <div class="dashboard-showcase__grid">
          <article
            v-for="template in filteredTemplates"
            :key="template.id"
            class="dashboard-card"
            tabindex="0"
            role="button"
            :aria-label="`Preview ${template.name}, ${template.industry}`"
            @click="openShowcase(template)"
            @keydown.enter.prevent="openShowcase(template)"
            @keydown.space.prevent="openShowcase(template)"
          >
            <div class="dashboard-card__preview" :style="getPreviewStyle(template)">
              <div class="dashboard-card__browser">
                <div class="dashboard-card__browser-bar">
                  <span></span><span></span><span></span>
                </div>
                <div class="dashboard-card__mock">
                  <div class="dashboard-card__mock-hero"></div>
                  <div class="dashboard-card__mock-body">
                    <div class="dashboard-card__mock-line"></div>
                    <div class="dashboard-card__mock-line dashboard-card__mock-line--short"></div>
                    <div class="dashboard-card__mock-line dashboard-card__mock-line--shorter"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dashboard-card__info">
              <span class="dashboard-card__industry">{{ template.industry }}</span>
              <h3 class="dashboard-card__name">{{ template.name }}</h3>
              <p class="dashboard-card__desc">{{ template.description }}</p>
              <div class="dashboard-card__meta">
                <span class="dashboard-card__sections">{{ template.sections.length }} sections</span>
                <span class="dashboard-card__action">Preview</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <ShowcaseModal
      v-if="showModal"
      :template="selectedTemplate"
      @close="closeShowcase"
      @choose="handleChooseDesign"
    />

    <footer class="dashboard-footer">
      <div class="dashboard-footer__inner">
        <p class="dashboard-footer__text">&copy; 2026 {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useShowcaseStore, type ShowcaseTemplate, type ShowcaseCategory } from '~/stores/showcase';
import ShowcaseModal from '~/components/ShowcaseModal.vue';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'DashboardPage', display: 'Dashboard' });

const { currentUser } = useAuth();
const showcaseStore = useShowcaseStore();
const router = useRouter();
const appConfig = useAppConfig();

const userName = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || '';
});

const selectedCategory = ref<ShowcaseCategory | null>(null);
const showModal = ref(false);
const selectedTemplate = ref<ShowcaseTemplate | null>(null);

const categories = computed(() => showcaseStore.categories);

const filteredTemplates = computed(() => {
  if (selectedCategory.value === null) {
    return showcaseStore.getAllTemplates;
  }
  return showcaseStore.getTemplatesByCategory(selectedCategory.value);
});

const getCategoryLabel = (category: ShowcaseCategory): string => {
  return showcaseStore.getCategoryLabel(category);
};

const getPreviewStyle = (template: ShowcaseTemplate) => ({
  '--preview-primary': template.colorScheme.primary,
  '--preview-bg': template.colorScheme.background
});

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

<style scoped src="~/assets/css/dashboard.css"></style>
