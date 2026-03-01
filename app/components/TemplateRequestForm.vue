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

      <div class="form-group" :class="{ 'form-group--error': errors.businessName }">
        <label for="businessName" class="form-label">Business Name <span class="required">*</span></label>
        <input
          id="businessName"
          :value="formData.businessName"
          type="text"
          class="form-input"
          :class="{ 'form-input--invalid': errors.businessName }"
          placeholder="e.g., Smith Plumbing Services"
          required
          @input="handleFieldInput('businessName', ($event.target as HTMLInputElement).value)"
          @blur="handleBlur('businessName')"
        />
        <p v-if="errors.businessName" class="form-error">{{ errors.businessName }}</p>
      </div>

      <div class="form-row">
        <div class="form-group" :class="{ 'form-group--error': errors.industry }">
          <label for="industry" class="form-label">Industry / Type <span class="required">*</span></label>
          <select
            id="industry"
            :value="formData.industry"
            class="form-select"
            :class="{ 'form-select--invalid': errors.industry }"
            required
            @change="handleFieldInput('industry', ($event.target as HTMLSelectElement).value)"
            @blur="handleBlur('industry')"
          >
            <option value="">Select your industry</option>
            <option v-for="option in INDUSTRY_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <p v-if="errors.industry" class="form-error">{{ errors.industry }}</p>
        </div>
        <div class="form-group" :class="{ 'form-group--error': errors.yearsInBusiness }">
          <label for="yearsInBusiness" class="form-label">Years in Business</label>
          <input
            id="yearsInBusiness"
            :value="formData.yearsInBusiness"
            type="text"
            class="form-input"
            :class="{ 'form-input--invalid': errors.yearsInBusiness }"
            placeholder="e.g., 15"
            inputmode="numeric"
            @input="handleFieldInput('yearsInBusiness', ($event.target as HTMLInputElement).value)"
            @blur="handleBlur('yearsInBusiness')"
          />
          <p v-if="errors.yearsInBusiness" class="form-error">{{ errors.yearsInBusiness }}</p>
        </div>
      </div>

      <div class="form-group" :class="{ 'form-group--error': errors.businessDescription }">
        <label for="businessDescription" class="form-label">Tell us about your business</label>
        <textarea
          id="businessDescription"
          :value="formData.businessDescription"
          class="form-textarea"
          :class="{ 'form-textarea--invalid': errors.businessDescription }"
          rows="3"
          placeholder="What makes your business unique? What do you specialize in?"
          @input="handleFieldInput('businessDescription', ($event.target as HTMLTextAreaElement).value)"
          @blur="handleBlur('businessDescription')"
        />
        <p v-if="errors.businessDescription" class="form-error">{{ errors.businessDescription }}</p>
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
        <div class="form-group" :class="{ 'form-group--error': errors.contactName }">
          <label for="contactName" class="form-label">Contact Name <span class="required">*</span></label>
          <IconInput
            id="contactName"
            :model-value="formData.contactName"
            type="text"
            placeholder="Your name"
            required
            @update:model-value="handleFieldInput('contactName', $event)"
            @blur="handleBlur('contactName')"
          >
            <template #icon><UserIcon /></template>
          </IconInput>
          <p v-if="errors.contactName" class="form-error">{{ errors.contactName }}</p>
        </div>
        <div class="form-group" :class="{ 'form-group--error': errors.email }">
          <label for="email" class="form-label">Email <span class="required">*</span></label>
          <IconInput
            id="email"
            :model-value="formData.email"
            type="email"
            placeholder="you@company.com"
            required
            @update:model-value="handleFieldInput('email', $event)"
            @blur="handleBlur('email')"
          >
            <template #icon><EmailIcon /></template>
          </IconInput>
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group" :class="{ 'form-group--error': errors.phone }">
          <label for="phone" class="form-label">Phone Number</label>
          <IconInput
            id="phone"
            :model-value="formData.phone"
            type="tel"
            placeholder="(555) 123-4567"
            @update:model-value="handleFieldInput('phone', $event)"
            @blur="handleBlur('phone')"
          >
            <template #icon><PhoneIcon /></template>
          </IconInput>
          <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
        </div>
        <div class="form-group" :class="{ 'form-group--error': errors.website }">
          <label for="website" class="form-label">Current Website (if any)</label>
          <IconInput
            id="website"
            :model-value="formData.website"
            type="url"
            placeholder="https://www.example.com"
            @update:model-value="handleFieldInput('website', $event)"
            @blur="handleBlur('website')"
          >
            <template #icon><GlobeIcon /></template>
          </IconInput>
          <p v-if="errors.website" class="form-error">{{ errors.website }}</p>
        </div>
      </div>

      <div class="form-group" :class="{ 'form-group--error': errors.address }">
        <label for="address" class="form-label">Business Address</label>
        <IconInput
          id="address"
          :model-value="formData.address"
          type="text"
          placeholder="123 Main St, City, State 12345"
          @update:model-value="handleFieldInput('address', $event)"
          @blur="handleBlur('address')"
        >
          <template #icon><MapPinIcon /></template>
        </IconInput>
        <p v-if="errors.address" class="form-error">{{ errors.address }}</p>
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

      <div class="form-group" :class="{ 'form-group--error': errors.goals }">
        <label class="form-label">What are the primary goals for your website? <span class="required">*</span></label>
        <GoalSelector
          :model-value="formData.goals"
          :goals="WEBSITE_GOALS"
          @update:model-value="handleFieldInput('goals', $event)"
        />
        <p v-if="errors.goals" class="form-error">{{ errors.goals }}</p>
      </div>

      <div class="form-group" :class="{ 'form-group--error': errors.targetAudience }">
        <label for="targetAudience" class="form-label">Who is your target audience?</label>
        <textarea
          id="targetAudience"
          :value="formData.targetAudience"
          class="form-textarea"
          :class="{ 'form-textarea--invalid': errors.targetAudience }"
          rows="2"
          placeholder="e.g., Homeowners in the Greater Metro area, property managers, commercial businesses"
          @input="handleFieldInput('targetAudience', ($event.target as HTMLTextAreaElement).value)"
          @blur="handleBlur('targetAudience')"
        />
        <p v-if="errors.targetAudience" class="form-error">{{ errors.targetAudience }}</p>
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

      <div class="form-group" :class="{ 'form-group--error': errors.additionalNotes }">
        <label for="additionalNotes" class="form-label">Any additional notes or special requests?</label>
        <textarea
          id="additionalNotes"
          :value="formData.additionalNotes"
          class="form-textarea form-textarea--tall"
          :class="{ 'form-textarea--invalid': errors.additionalNotes }"
          rows="4"
          placeholder="Tell us anything else that would help us create the perfect website for your business..."
          @input="handleFieldInput('additionalNotes', ($event.target as HTMLTextAreaElement).value)"
          @blur="handleBlur('additionalNotes')"
        />
        <p v-if="errors.additionalNotes" class="form-error">{{ errors.additionalNotes }}</p>
      </div>
    </FormSection>

    <!-- Submit Section -->
    <FormSubmit :loading="isSubmitting" />
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type {
  ColorCustomization,
  TemplateRequestFormData,
  TemplateRequestValidatableField
} from '~/types/templateRequest';
import { useTemplateRequestForm } from '~/composables/useTemplateRequestForm';
import { useTemplateRequestValidation } from '~/composables/useTemplateRequestValidation';

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

// Validation: centralized, run on blur and submit; clear error on input
const { errors, validateField, validateAll, clearFieldError } =
  useTemplateRequestValidation(formData);

function handleFieldInput<K extends keyof TemplateRequestFormData>(
  field: K,
  value: TemplateRequestFormData[K]
): void {
  updateField(field, value);
  clearFieldError(field as TemplateRequestValidatableField);
}

function handleBlur(field: TemplateRequestValidatableField): void {
  validateField(field);
}

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
 * Trim string fields for submission (validation already ran).
 */
function trimFormPayload(data: TemplateRequestFormData): TemplateRequestFormData {
  return {
    ...data,
    businessName: data.businessName.trim(),
    industry: data.industry.trim(),
    yearsInBusiness: data.yearsInBusiness.trim(),
    businessDescription: data.businessDescription.trim(),
    contactName: data.contactName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    website: data.website.trim(),
    address: data.address.trim(),
    targetAudience: data.targetAudience.trim(),
    additionalNotes: data.additionalNotes.trim()
  };
}

/**
 * Handle form submission. Block if validation fails.
 */
function handleSubmit(): void {
  if (!validateAll()) {
    return;
  }
  const raw = {
    ...formData.value,
    brandAssets: uploadedFiles.value.map((f) => f.name),
    files: [...uploadedFiles.value]
  };
  const submissionData = trimFormPayload(raw);
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

/* Invalid state for IconInput when parent form-group has error */
.form-group--error :deep(.icon-input__field) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
}

.form-group--error :deep(.icon-input__field:focus) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}
</style>
