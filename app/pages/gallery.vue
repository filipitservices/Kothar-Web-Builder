<template>
  <div class="dash">
    <!-- Control strip: greeting + primary action -->
    <header class="dash-strip">
      <div class="dash-strip__inner">
        <div class="dash-strip__greeting">
          <h1 class="dash-strip__title">Welcome back{{ userName ? `, ${userName}` : '' }}</h1>
          <p class="dash-strip__subtitle">Choose a path below to get started.</p>
        </div>
        <NuxtLink to="/gallery#templates" class="dash-strip__cta">
          <span class="dash-strip__cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </span>
          <span>Open Builder</span>
          <svg class="dash-strip__cta-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </NuxtLink>
      </div>
    </header>

    <!-- Templates: contrast block -->
    <section class="dash-showcase" aria-labelledby="showcase-heading">
      <div class="dash-showcase__inner">
        <div class="dash-showcase__head">
          <div class="dash-showcase__head-text">
            <h2 id="showcase-heading" class="dash-showcase__title">Professional Templates</h2>
            <p class="dash-showcase__subtitle">Preview, customize, and request a design. We build it for you.</p>
          </div>
          <div class="dash-showcase__filter" role="tablist" aria-label="Template category">
            <button
              type="button"
              role="tab"
              class="dash-pill"
              :class="{ 'dash-pill--active': selectedCategory === null }"
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
              class="dash-pill"
              :class="{ 'dash-pill--active': selectedCategory === category }"
              :aria-selected="selectedCategory === category"
              @click="selectedCategory = category"
            >
              {{ getCategoryLabel(category) }}
            </button>
          </div>
        </div>

        <div class="dash-showcase__grid">
          <article
            v-for="template in filteredTemplates"
            :key="template.id"
            class="dash-card"
            tabindex="0"
            role="button"
            :aria-label="`Preview ${template.name}, ${template.industry}`"
            @click="openShowcase(template)"
            @keydown.enter.prevent="openShowcase(template)"
            @keydown.space.prevent="openShowcase(template)"
          >
            <div class="dash-card__preview" :style="getPreviewStyle(template)">
              <div class="dash-card-browser">
                <div class="dash-card-browser-bar">
                  <span></span><span></span><span></span>
                </div>
                <div class="dash-card-mock">
                  <div class="dash-card-mock-hero"></div>
                  <div class="dash-card-mock-body">
                    <div class="dash-card-mock-line"></div>
                    <div class="dash-card-mock-line dash-card-mock-line--short"></div>
                    <div class="dash-card-mock-line dash-card-mock-line--shorter"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dash-card__info">
              <span class="dash-card__industry">{{ template.industry }}</span>
              <h3 class="dash-card__name">{{ template.name }}</h3>
              <p class="dash-card__desc">{{ template.description }}</p>
              <div class="dash-card__meta">
                <span class="dash-card__sections">{{ template.sections.length }} sections</span>
                <span class="dash-card__action">Preview</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <ShowcaseModal
      v-if="showModal"
      :template="selectedTemplate"
      :loading="isCreating"
      @close="closeShowcase"
      @choose="handleChooseDesign"
    />

    <footer class="dash-footer">
      <div class="dash-footer__inner">
        <p class="dash-footer__text">&copy; 2026 {{ appConfig.appName }}. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useShowcaseStore, type ShowcaseTemplate, type ShowcaseCategory } from '~/stores/showcase';
import { useCreateRequest, CreateRequestError } from '~/composables/useCreateRequest';
import { useToast } from '~/composables/useToast';
import ShowcaseModal from '~/components/ShowcaseModal.vue';

definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'GalleryPage', display: 'Gallery' });

const { currentUser } = useAuth();
const showcaseStore = useShowcaseStore();
const { createDraftRequest } = useCreateRequest();
const toast = useToast();
const router = useRouter();
const appConfig = useAppConfig();

const userName = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || '';
});

const selectedCategory = ref<ShowcaseCategory | null>(null);
const showModal = ref(false);
const selectedTemplate = ref<ShowcaseTemplate | null>(null);
const isCreating = ref(false);

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
  if (isCreating.value) return;
  selectedTemplate.value = template;
  showModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeShowcase = () => {
  if (isCreating.value) return;
  showModal.value = false;
  selectedTemplate.value = null;
  document.body.style.overflow = '';
};

async function handleChooseDesign(templateId: string): Promise<void> {
  if (isCreating.value) return;

  const uid = currentUser.value?.uid;
  if (!uid) return;

  const template = showcaseStore.getTemplateById(templateId);
  if (!template) return;

  isCreating.value = true;
  await nextTick();

  try {
    const result = await createDraftRequest(uid, template);
    type HistoryState = import('vue-router').HistoryState;
    await router.push({
      path: `/gallery/request/${result.orderId}`,
      ...(result.orderForHydration && {
        state: { orderFromCreate: result.orderForHydration } as unknown as HistoryState
      })
    });
  } catch (err) {
    if (err instanceof CreateRequestError) {
      toast.showError(err.message);
    } else {
      toast.showError('Something went wrong. Please try again.');
    }
  } finally {
    isCreating.value = false;
  }
}
</script>

<style scoped src="~/assets/css/gallery.css"></style>
