<template>
  <div class="request-container">
    <!-- Navigation Header -->
    <nav class="request-header">
      <div class="nav-inner">
        <div class="nav-left">
          <NuxtLink to="/gallery" class="back-link">
            <svg viewBox="0 0 20 20" fill="currentColor" class="back-icon">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Back to Gallery</span>
          </NuxtLink>
        </div>
        <div class="nav-actions">
          <UserMenu />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="request-main">
      <div class="request-content">
        <!-- Two Column Layout -->
        <div class="request-grid">
          <!-- Left: Template Preview -->
          <aside class="template-preview-section">
            <div class="preview-card">
              <div class="preview-label">Live Preview</div>
              <div class="preview-device">
                <div class="preview-frame">
                  <div class="preview-screen">
                    <ShowcaseRenderer
                      v-if="previewTemplate"
                      :template="previewTemplate"
                      view-mode="desktop"
                    />
                  </div>
                </div>
              </div>
              <div class="preview-info">
                <span class="preview-industry">{{ originalTemplate?.industry }}</span>
                <h3 class="preview-name">{{ originalTemplate?.name }}</h3>
                <p class="preview-description">{{ originalTemplate?.description }}</p>
              </div>
              <NuxtLink to="/gallery" class="change-template-link">
                Choose a different design →
              </NuxtLink>
            </div>
          </aside>

          <!-- Right: Request Form -->
          <section class="form-section">
            <div class="form-header">
              <h1 class="form-title">Tell Us About Your Business</h1>
              <p class="form-subtitle">
                We'll use this information to customize your website. The more details you provide, the better we can tailor the design to your needs.
              </p>
            </div>

            <TemplateRequestForm
              v-if="originalTemplate"
              :template="originalTemplate"
              :is-submitting="isSubmitting"
              @color-change="handleColorChange"
              @submit="handleSubmit"
            />
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useShowcaseStore, type ShowcaseTemplate } from '~/stores/showcase';
import UserMenu from '~/components/UserMenu.vue';
import ShowcaseRenderer from '~/components/showcase/ShowcaseRenderer.vue';
import TemplateRequestForm, {
  type TemplateRequestFormData,
  type ColorCustomization
} from '~/components/TemplateRequestForm.vue';

// Route protection
definePageMeta({
  middleware: 'auth'
});

defineOptions({ name: 'TemplateRequestPage', display: 'Template Request Form' });

const route = useRoute();
const router = useRouter();
const showcaseStore = useShowcaseStore();

// Get template from route param
const templateId = computed(() => route.params.id as string);

// Original template from store (immutable reference)
const originalTemplate = ref<ShowcaseTemplate | undefined>(undefined);

// Preview template with customizable colors (derived from original)
const previewTemplate = ref<ShowcaseTemplate | undefined>(undefined);

// Form state
const isSubmitting = ref(false);

onMounted(() => {
  const template = showcaseStore.getTemplateById(templateId.value);
  if (!template) {
    // Redirect to gallery if template not found
    router.push('/gallery');
    return;
  }

  // Store the original template
  originalTemplate.value = template;

  // Create a copy for the preview that can be modified with custom colors
  previewTemplate.value = createPreviewTemplate(template, template.colorScheme);
});

/**
 * Create a preview template with custom color scheme
 * This creates a new object so Vue reactivity picks up changes
 */
function createPreviewTemplate(
  base: ShowcaseTemplate,
  colors: ColorCustomization
): ShowcaseTemplate {
  return {
    ...base,
    colorScheme: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text
    }
  };
}

/**
 * Handle color changes from the form - update the preview template
 */
function handleColorChange(colors: ColorCustomization): void {
  if (!originalTemplate.value) return;

  // Create new preview template with updated colors
  previewTemplate.value = createPreviewTemplate(originalTemplate.value, colors);
}

/**
 * Handle form submission
 */
async function handleSubmit(formData: TemplateRequestFormData): Promise<void> {
  isSubmitting.value = true;

  try {
    // Build the submission payload
    const payload = {
      templateId: templateId.value,
      templateName: originalTemplate.value?.name,
      ...formData,
      submittedAt: new Date().toISOString()
    };

    console.log('Form submission:', payload);

    // Simulate API call (replace with actual API integration)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success and redirect
    alert('Thank you! Your request has been submitted. We\'ll be in touch soon.');
    router.push('/dashboard');
  } catch (error) {
    console.error('Submission error:', error);
    alert('There was an error submitting your request. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style src="~/assets/css/components.css"></style>
<style scoped src="~/assets/css/request-form.css"></style>
