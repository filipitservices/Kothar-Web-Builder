<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <!-- Progress Indicator (conditionally shown) -->
    <FormProgress 
      v-if="showProgress" 
      :completed="progress.completed" 
      :total="progress.total" 
    />

    <!-- Design Customization -->
    <FormSection
      title="Design Customization"
      hint="Choose colors that represent your brand"
      variant="palette"
      featured
    >
      <template #icon><PaletteIcon /></template>
      <ColorSchemePicker
        :colors="formData.colorCustomization"
        :default-colors="defaultColors"
        @update:colors="handleColorsUpdate"
        @reset="handleColorsReset"
      />
    </FormSection>

    <!-- Business Information -->
    <FormSection
      title="Business Information"
      hint="Tell us about your company"
      variant="building"
      :step="1"
    >
      <template #icon><BuildingIcon /></template>

      <div class="form-group">
        <label for="businessName" class="form-label">Business Name <span class="required">*</span></label>
        <input
          id="businessName"
          :value="formData.businessName"
          type="text"
          class="form-input"
          placeholder="e.g., Smith Plumbing Services"
          required
          @input="updateField('businessName', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="industry" class="form-label">Industry / Type <span class="required">*</span></label>
          <select 
            id="industry" 
            :value="formData.industry" 
            class="form-select" 
            required
            @change="updateField('industry', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Select your industry</option>
            <option v-for="option in INDUSTRY_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="yearsInBusiness" class="form-label">Years in Business</label>
          <input
            id="yearsInBusiness"
            :value="formData.yearsInBusiness"
            type="text"
            class="form-input"
            placeholder="e.g., 15 years"
            @input="updateField('yearsInBusiness', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="businessDescription" class="form-label">Tell us about your business</label>
        <textarea
          id="businessDescription"
          :value="formData.businessDescription"
          class="form-textarea"
          rows="3"
          placeholder="What makes your business unique? What do you specialize in?"
          @input="updateField('businessDescription', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </FormSection>

    <!-- Contact Information -->
    <FormSection
      title="Contact Information"
      hint="How can we reach you?"
      variant="contact"
      :step="2"
    >
      <template #icon><ContactIcon /></template>

      <div class="form-row">
        <div class="form-group">
          <label for="contactName" class="form-label">Contact Name <span class="required">*</span></label>
          <IconInput
            id="contactName"
            :model-value="formData.contactName"
            type="text"
            placeholder="Your name"
            required
            @update:model-value="updateField('contactName', $event)"
          >
            <template #icon><UserIcon /></template>
          </IconInput>
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email <span class="required">*</span></label>
          <IconInput
            id="email"
            :model-value="formData.email"
            type="email"
            placeholder="you@company.com"
            required
            @update:model-value="updateField('email', $event)"
          >
            <template #icon><EmailIcon /></template>
          </IconInput>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <IconInput
            id="phone"
            :model-value="formData.phone"
            type="tel"
            placeholder="(555) 123-4567"
            @update:model-value="updateField('phone', $event)"
          >
            <template #icon><PhoneIcon /></template>
          </IconInput>
        </div>
        <div class="form-group">
          <label for="website" class="form-label">Current Website (if any)</label>
          <IconInput
            id="website"
            :model-value="formData.website"
            type="url"
            placeholder="https://www.example.com"
            @update:model-value="updateField('website', $event)"
          >
            <template #icon><GlobeIcon /></template>
          </IconInput>
        </div>
      </div>

      <div class="form-group">
        <label for="address" class="form-label">Business Address</label>
        <IconInput
          id="address"
          :model-value="formData.address"
          type="text"
          placeholder="123 Main St, City, State 12345"
          @update:model-value="updateField('address', $event)"
        >
          <template #icon><MapPinIcon /></template>
        </IconInput>
      </div>
    </FormSection>

    <!-- Website Goals -->
    <FormSection
      title="Website Goals"
      hint="What do you want to achieve?"
      variant="target"
      :step="3"
    >
      <template #icon><TargetIcon /></template>

      <div class="form-group">
        <label class="form-label">What are the primary goals for your website? <span class="required">*</span></label>
        <GoalSelector
          :model-value="formData.goals"
          :goals="WEBSITE_GOALS"
          @update:model-value="updateField('goals', $event)"
        />
      </div>

      <div class="form-group">
        <label for="targetAudience" class="form-label">Who is your target audience?</label>
        <textarea
          id="targetAudience"
          :value="formData.targetAudience"
          class="form-textarea"
          rows="2"
          placeholder="e.g., Homeowners in the Greater Metro area, property managers, commercial businesses"
          @input="updateField('targetAudience', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </FormSection>

    <!-- Branding & Content -->
    <FormSection
      title="Branding & Content"
      hint="Assets you already have"
      variant="sparkle"
      :step="4"
    >
      <template #icon><SparkleIcon /></template>

      <div class="form-group">
        <label class="form-label">Do you have existing brand assets?</label>
        <FileUploadArea
          accept="image/*,.pdf,.ai,.psd,.eps,.svg"
          formats-text="PNG, JPG, PDF, SVG, AI, PSD, EPS"
          @update:files="handleFilesUpdate"
        />
      </div>

      <div class="form-group">
        <label for="additionalNotes" class="form-label">Any additional notes or special requests?</label>
        <textarea
          id="additionalNotes"
          :value="formData.additionalNotes"
          class="form-textarea form-textarea--tall"
          rows="4"
          placeholder="Tell us anything else that would help us create the perfect website for your business..."
          @input="updateField('additionalNotes', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </FormSection>

    <!-- Submit Section -->
    <FormSubmit :loading="isSubmitting" />
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';
import { useTemplateRequestForm } from '~/composables/useTemplateRequestForm';

// Components
import ColorSchemePicker from '~/components/ColorSchemePicker.vue';
import FormSection from '~/components/form/FormSection.vue';
import FormProgress from '~/components/form/FormProgress.vue';
import FormSubmit from '~/components/form/FormSubmit.vue';
import IconInput from '~/components/form/IconInput.vue';
import GoalSelector from '~/components/form/GoalSelector.vue';
import FileUploadArea from '~/components/form/FileUploadArea.vue';

// Icons
import {
  PaletteIcon,
  BuildingIcon,
  ContactIcon,
  TargetIcon,
  SparkleIcon,
  UserIcon,
  EmailIcon,
  PhoneIcon,
  GlobeIcon,
  MapPinIcon
} from '~/components/icons/SectionIcons.vue';

// Constants
import { INDUSTRY_OPTIONS, WEBSITE_GOALS } from '~/constants/formOptions';

// Re-export types for consumers
export type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

interface Props {
  template: ShowcaseTemplate;
  isSubmitting?: boolean;
  showProgress?: boolean;
}

interface Emits {
  (e: 'submit', data: TemplateRequestFormData): void;
  (e: 'colorChange', colors: ColorCustomization): void;
  (e: 'progressUpdate', progress: { completed: number; total: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  showProgress: true
});

const emit = defineEmits<Emits>();

// File upload state (managed locally, passed to composable)
const uploadedFiles = ref<readonly File[]>([]);

// Template ref for the composable
const templateRef = computed(() => props.template);

// Use the form composable
const {
  formData,
  progress,
  defaultColors,
  updateField,
  updateColors,
  resetColors
} = useTemplateRequestForm(templateRef, uploadedFiles);

/**
 * Handle files update from FileUploadArea
 */
function handleFilesUpdate(files: readonly File[]): void {
  uploadedFiles.value = files;
}

/**
 * Handle color updates from the picker
 */
function handleColorsUpdate(colors: ColorCustomization): void {
  updateColors(colors);
  emit('colorChange', colors);
}

/**
 * Handle color reset
 */
function handleColorsReset(): void {
  const colors = resetColors();
  emit('colorChange', colors);
}

/**
 * Handle form submission
 */
function handleSubmit(): void {
  // Create submission data with files included
  const submissionData: TemplateRequestFormData = {
    ...formData.value,
    brandAssets: uploadedFiles.value.map(f => f.name),
    files: [...uploadedFiles.value]
  };
  emit('submit', submissionData);
}

/**
 * Emit progress updates when progress changes
 */
watch(
  () => progress.value,
  (newProgress) => {
    emit('progressUpdate', { 
      completed: newProgress.completed, 
      total: newProgress.total 
    });
  },
  { immediate: true }
);

// Also emit on mount to ensure parent has initial values
onMounted(() => {
  emit('progressUpdate', { 
    completed: progress.value.completed, 
    total: progress.value.total 
  });
});
</script>

<style src="~/assets/css/components.css"></style>

<style scoped>
.request-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-textarea--tall {
  min-height: 120px;
}
</style>
