<template>
  <div class="templates-list">
    <div v-if="showHeader" class="templates-header">
      <h3>Templates</h3>
      <p class="subtitle">Click to apply a template</p>
    </div>

    <CategoryNav
      :categories="categories"
      :selected-category="selectedCategory"
      :get-category-label="getCategoryLabel"
      @select="selectedCategory = ($event as Template['category'] | null)"
    />

    <div class="templates-container">
      <TemplateCard
        v-for="template in filteredTemplates"
        :key="template.id"
        :template="template"
        @click="handleTemplateClick(template)"
      />
    </div>

    <TemplateScreenSelector
      :is-open="showScreenSelector"
      :template-name="selectedTemplate?.name || ''"
      @select="handleScreenSelect"
      @close="closeScreenSelector"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTemplatesStore } from '~/stores/templates';
import type { Template } from '~/stores/templates';
import CategoryNav from './CategoryNav.vue';
import TemplateCard from './TemplateCard.vue';
import TemplateScreenSelector from './TemplateScreenSelector.vue';

interface TemplatesListEmits {
  apply: [templateId: string, screen: 'desktop' | 'mobile' | 'both'];
}

const props = withDefaults(
  defineProps<{ showHeader?: boolean }>(),
  { showHeader: true }
);
const emit = defineEmits<TemplatesListEmits>();
const templatesStore = useTemplatesStore();

const selectedCategory = ref<Template['category'] | null>(null);
const showScreenSelector = ref(false);
const selectedTemplate = ref<Template | null>(null);

const categories = computed(() => templatesStore.categories);

const filteredTemplates = computed(() => {
  if (selectedCategory.value === null) {
    return templatesStore.getAllTemplates;
  }
  return templatesStore.getTemplatesByCategory(selectedCategory.value);
});

const getCategoryLabel = (category: string): string => {
  return templatesStore.getCategoryLabel(category as Template['category']);
};

const handleTemplateClick = (template: Template) => {
  selectedTemplate.value = template;
  showScreenSelector.value = true;
};

const handleScreenSelect = (screen: 'desktop' | 'mobile' | 'both') => {
  if (selectedTemplate.value) {
    emit('apply', selectedTemplate.value.id, screen);
    closeScreenSelector();
  }
};

const closeScreenSelector = () => {
  showScreenSelector.value = false;
  selectedTemplate.value = null;
};
</script>

<style scoped>
.templates-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.templates-header {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.templates-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  margin: var(--space-xs) 0 0 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.templates-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.templates-container::-webkit-scrollbar {
  display: none;
}
</style>
