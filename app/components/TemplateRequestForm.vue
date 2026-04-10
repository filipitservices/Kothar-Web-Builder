<template>
  <form class="request-form" :class="{ 'request-form--read-only': readOnly }" @submit.prevent="handleSubmit">
    <!-- Progress Indicator (conditionally shown) -->
    <FormProgress
      v-if="showProgress"
      :completed="progress.completed"
      :total="progress.total"
    />

    <!-- 1. Design Customization -->
    <FormSection
      title="Design Customization"
      hint="Choose colors that represent your brand (required)"
      variant="palette"
    >
      <template #icon><PaletteIcon /></template>
      <div
        class="form-group"
        data-form-field="colorCustomization"
        :class="{ 'form-group--error': errors.colorCustomization }"
      >
        <ColorSchemePicker
          :colors="formData.colorCustomization"
          :default-colors="defaultColors"
          :color-ui-reset-key="colorUiResetKey"
          @update:colors="handleColorsUpdate"
          @reset="handleColorsReset"
        />
        <p v-if="errors.colorCustomization" class="form-error">{{ errors.colorCustomization }}</p>
      </div>
    </FormSection>

    <!-- 2. Branding -->
    <FormSection
      title="Branding"
      hint="Your logos, images, and brand assets"
      variant="branding"
      :step="1"
    >
      <template #icon><BrandingIcon /></template>

      <!-- 2a. Logos subsection -->
      <div
        class="form-subsection form-subsection--logos"
        data-form-field="logoBranding"
        :class="{ 'form-group--error': errors.logoBranding }"
      >
        <h4 class="form-subsection__title">Logos &amp; Emblems</h4>
        <p class="form-subsection__desc">Upload your logo files — primary logo, icon, or emblem variations.</p>
        <div class="form-group">
          <FileUploadArea
            tone="logo"
            dropzone-vertical="compact"
            accept="image/*,.svg"
            formats-text="PNG, JPG, SVG, WebP"
            aria-label="Upload logo files"
            :accepted-types="['image/']"
            title="Upload logo assets"
            description="Primary logo, icon marks, and emblem variants for your brand."
            cta-text="Drop logo files here"
            @update:files="handleLogoFilesUpdate"
          />
        </div>
        <p v-if="errors.logoBranding" class="form-error">{{ errors.logoBranding }}</p>
      </div>

      <!-- 2b. Branding Material subsection -->
      <div
        class="form-subsection form-subsection--branding"
        data-form-field="brandBranding"
        :class="{ 'form-group--error': errors.brandBranding }"
      >
        <h4 class="form-subsection__title">Branding Material</h4>
        <p class="form-subsection__desc">Brand guidelines, photos, documents, or any reference material.</p>

        <div v-if="existingAttachments?.length" class="form-group existing-attachments">
          <label class="form-label">Current attachments</label>
          <ul class="existing-attachments-list" aria-label="Files already attached to this request">
            <li
              v-for="(att, index) in existingAttachments"
              :key="`${att.originalName}-${att.storagePath}-${index}`"
              class="existing-attachments-item"
            >
              <span class="existing-attachments-name">{{ att.originalName }}</span>
              <span class="existing-attachments-size">{{ formatAttachmentSize(att.size) }}</span>
              <a
                v-if="att.downloadURL"
                :href="att.downloadURL"
                target="_blank"
                rel="noopener noreferrer"
                class="existing-attachments-link"
              >
                Download
              </a>
            </li>
          </ul>
        </div>

        <div class="form-group">
          <FileUploadArea
            tone="brand"
            accept="image/*,.pdf,.ai,.psd,.eps,.svg"
            formats-text="PNG, JPG, PDF, SVG, AI, PSD, EPS"
            title="Upload branding materials"
            description="Guidelines, product/service photos, and other reference files."
            cta-text="Drop brand files here"
            @update:files="handleFilesUpdate"
          />
        </div>
        <p v-if="errors.brandBranding" class="form-error">{{ errors.brandBranding }}</p>
      </div>
    </FormSection>

    <!-- 3. Business Info -->
    <FormSection
      title="Business Info"
      hint="Tell us about your company"
      variant="business"
      :step="2"
    >
      <template #icon><BusinessIcon /></template>

      <div class="form-group" data-form-field="businessName" :class="{ 'form-group--error': errors.businessName }">
        <label for="businessName" class="form-label">Business Name <span class="required">*</span></label>
        <input
          id="businessName"
          :value="formData.businessName"
          type="text"
          class="form-input"
          :class="{ 'form-input--invalid': errors.businessName }"
          placeholder="e.g., Smith Plumbing Services"
          @input="onTextInput($event, 'businessName')"
          @blur="handleBlur('businessName')"
        />
        <p v-if="errors.businessName" class="form-error">{{ errors.businessName }}</p>
      </div>

      <div class="form-group" data-form-field="preferredUrl" :class="{ 'form-group--error': errors.preferredUrl }">
        <label for="preferredUrl" class="form-label">Preferred URL <span class="required">*</span></label>
        <div class="preferred-url-wrap">
          <div class="preferred-url-icon" aria-hidden="true">
            <LinkIcon />
          </div>
          <input
            id="preferredUrl"
            :value="formData.preferredUrl"
            type="text"
            class="form-input preferred-url-input"
            :class="{ 'form-input--invalid': errors.preferredUrl }"
            placeholder="e.g., smith-plumbing"
            @input="onTextInput($event, 'preferredUrl')"
            @blur="handleBlur('preferredUrl')"
          />
        </div>
        <p class="form-hint">
          URL availability will be checked and you'll receive a response separately. This is a preference, not a guaranteed reservation.
        </p>
        <p v-if="errors.preferredUrl" class="form-error">{{ errors.preferredUrl }}</p>
      </div>

      <div class="form-group" data-form-field="location" :class="{ 'form-group--error': errors.location }">
        <label for="location" class="form-label">Location <span class="required">*</span></label>
        <LocationInput
          :model-value="formData.location"
          input-id="location"
          placeholder="e.g., Austin, TX"
          :read-only="readOnly"
          @update:model-value="handleFieldInput('location', $event)"
          @blur="handleBlur('location')"
        />
        <p v-if="errors.location" class="form-error">{{ errors.location }}</p>
      </div>

      <div
        class="form-group"
        data-form-field="industry"
        :class="{ 'form-group--error': errors.industry || errors.customIndustry }"
      >
        <label class="form-label">Industry / Type <span class="required">*</span></label>
        <IndustryCardGrid
          :model-value="formData.industry"
          :custom-value="formData.customIndustry"
          :custom-value-error="!!errors.customIndustry"
          :read-only="readOnly"
          label="Industry / Type"
          @update:model-value="handleIndustryChange"
          @update:custom-value="handleFieldInput('customIndustry', $event)"
          @custom-blur="handleBlur('customIndustry')"
        />
        <p v-if="errors.industry" class="form-error">{{ errors.industry }}</p>
        <p v-if="errors.customIndustry" class="form-error">{{ errors.customIndustry }}</p>
      </div>
    </FormSection>

    <!-- 4. Website Goals -->
    <FormSection
      title="Website Goals"
      hint="What do you want to achieve?"
      variant="target"
      :step="3"
    >
      <template #icon><TargetIcon /></template>

      <div class="form-group" data-form-field="goals" :class="{ 'form-group--error': errors.goals }">
        <label class="form-label">What are the primary goals for your website? <span class="required">*</span></label>
        <GoalSelector
          :model-value="formData.goals"
          :goals="WEBSITE_GOALS"
          :max-selection="3"
          :read-only="readOnly"
          @update:model-value="handleFieldInput('goals', $event)"
        />
        <p v-if="errors.goals" class="form-error">{{ errors.goals }}</p>
      </div>

      <div class="form-group" data-form-field="audienceTags" :class="{ 'form-group--error': errors.audienceTags }">
        <label class="form-label">Who do you serve?</label>
        <p class="form-hint">Add tags describing your target audience. Type freely or pick from suggestions.</p>
        <TagInput
          :model-value="formData.audienceTags"
          :suggestions="AUDIENCE_TAG_SUGGESTIONS"
          placeholder="e.g., Homeowners, Small businesses..."
          :read-only="readOnly"
          @update:model-value="handleFieldInput('audienceTags', $event)"
        />
        <p v-if="errors.audienceTags" class="form-error">{{ errors.audienceTags }}</p>
      </div>
    </FormSection>

    <!-- 5. Additional Requests -->
    <FormSection
      title="Additional Requests"
      hint="Anything else we should know?"
      variant="requests"
      :step="4"
    >
      <template #icon><RequestsIcon /></template>

      <div class="form-group" data-form-field="additionalNotes" :class="{ 'form-group--error': errors.additionalNotes }">
        <label for="additionalNotes" class="form-label">Notes &amp; special requests</label>
        <textarea
          id="additionalNotes"
          :value="formData.additionalNotes"
          class="form-textarea form-textarea--tall"
          :class="{ 'form-textarea--invalid': errors.additionalNotes }"
          rows="4"
          placeholder="Tell us anything else that would help us create the perfect website for your business..."
          @input="onTextInput($event, 'additionalNotes')"
          @blur="handleBlur('additionalNotes')"
        />
        <p v-if="errors.additionalNotes" class="form-error">{{ errors.additionalNotes }}</p>
      </div>

      <div
        class="form-group"
        data-form-field="requestCategories"
        :class="{ 'form-group--error': errors.requestCategories }"
      >
        <label class="form-label">What would help your site the most?</label>
        <p class="form-hint">Select any that apply — these help us prioritize your build.</p>
        <RequestCategorySelector
          :model-value="formData.requestCategories"
          :read-only="readOnly"
          @update:model-value="handleFieldInput('requestCategories', $event)"
        />
        <p v-if="errors.requestCategories" class="form-error">{{ errors.requestCategories }}</p>
      </div>
    </FormSection>

    <!-- Submit Section (hidden when read-only) -->
    <FormSubmit
      v-if="!readOnly"
      :title="submitTitle"
      :description="submitDescription"
      :button-text="submitButtonText"
      :loading-text="submitLoadingText"
      :loading="isSubmitting"
    />
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type {
  ColorCustomization,
  TemplateRequestFormData,
  TemplateRequestValidatableField
} from '~/types/templateRequest';
import type { OrderAttachment } from '~/types/order';
import { useTemplateRequestForm } from '~/composables/useTemplateRequestForm';
import {
  useTemplateRequestValidation,
  TEMPLATE_REQUEST_VALIDATION_FIELD_ORDER
} from '~/composables/useTemplateRequestValidation';

import ColorSchemePicker from '~/components/ColorSchemePicker.vue';
import FormSection from '~/components/form/FormSection.vue';
import FormProgress from '~/components/form/FormProgress.vue';
import FormSubmit from '~/components/form/FormSubmit.vue';
import GoalSelector from '~/components/form/GoalSelector.vue';
import FileUploadArea from '~/components/form/FileUploadArea.vue';
import IndustryCardGrid from '~/components/form/IndustryCardGrid.vue';
import LocationInput from '~/components/form/LocationInput.vue';
import TagInput from '~/components/form/TagInput.vue';
import RequestCategorySelector from '~/components/form/RequestCategorySelector.vue';

import {
  PaletteIcon,
  BrandingIcon,
  BusinessIcon,
  TargetIcon,
  RequestsIcon,
  LinkIcon
} from '~/components/icons/SectionIcons.vue';

import { WEBSITE_GOALS, AUDIENCE_TAG_SUGGESTIONS } from '~/constants/formOptions';
export type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

interface Props {
  template: ShowcaseTemplate;
  colorUiResetScopeId: string;
  isSubmitting?: boolean;
  showProgress?: boolean;
  initialFormData?: TemplateRequestFormData | null;
  readOnly?: boolean;
  existingAttachments?: OrderAttachment[];
  submitTitle?: string;
  submitDescription?: string;
  submitButtonText?: string;
  submitLoadingText?: string;
}

interface Emits {
  (e: 'submit', data: TemplateRequestFormData): void;
  (e: 'colorChange', colors: ColorCustomization): void;
  (e: 'progressUpdate', progress: { completed: number; total: number }): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  showProgress: true,
  initialFormData: undefined,
  readOnly: false,
  existingAttachments: () => [],
  submitTitle: undefined,
  submitDescription: undefined,
  submitButtonText: undefined,
  submitLoadingText: undefined
});

const emit = defineEmits<Emits>();

const uploadedFiles = ref<readonly File[]>([]);
const uploadedLogoFiles = ref<readonly File[]>([]);
const templateRef = computed(() => props.template);

const {
  formData,
  progress,
  defaultColors,
  updateField,
  updateColors,
  resetColors,
  hydrateFormData
} = useTemplateRequestForm(templateRef, uploadedFiles, uploadedLogoFiles);

const colorUiHydrationGeneration = ref(0);

watch(
  () => props.initialFormData,
  (data) => {
    if (data) {
      hydrateFormData(data);
      colorUiHydrationGeneration.value += 1;
    }
  },
  { immediate: true }
);

watch(
  () => props.template.id,
  () => {
    colorUiHydrationGeneration.value += 1;
  }
);

const colorUiResetKey = computed(
  () =>
    `${props.colorUiResetScopeId}:${props.template.id}:${colorUiHydrationGeneration.value}`
);

const { errors, validateField, validateAll, clearFieldError } =
  useTemplateRequestValidation(formData);

function handleFieldInput<K extends keyof TemplateRequestFormData>(
  field: K,
  value: TemplateRequestFormData[K]
): void {
  updateField(field, value);
  clearFieldError(field as TemplateRequestValidatableField);
}

function handleIndustryChange(value: string): void {
  updateField('industry', value);
  clearFieldError('industry');
  if (value !== 'other') {
    updateField('customIndustry', '');
    clearFieldError('customIndustry');
  }
}

function handleBlur(field: TemplateRequestValidatableField): void {
  validateField(field);
}

function onTextInput(
  event: Event,
  field: 'businessName' | 'preferredUrl' | 'additionalNotes'
): void {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    handleFieldInput(field, target.value);
  }
}

function formatAttachmentSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${size} ${sizes[i]}`;
}

function handleFilesUpdate(files: readonly File[]): void {
  uploadedFiles.value = [...files];
  clearFieldError('brandBranding');
}

function handleLogoFilesUpdate(files: readonly File[]): void {
  uploadedLogoFiles.value = [...files];
  clearFieldError('logoBranding');
}

function handleColorsUpdate(colors: ColorCustomization): void {
  updateColors(colors);
  clearFieldError('colorCustomization');
  emit('colorChange', colors);
}

function handleColorsReset(): void {
  const colors = resetColors();
  clearFieldError('colorCustomization');
  emit('colorChange', colors);
}

function scrollToFirstInvalidField(): void {
  const formRoot = document.querySelector('.request-form');
  if (!formRoot) return;

  for (const field of TEMPLATE_REQUEST_VALIDATION_FIELD_ORDER) {
    const message = errors.value[field];
    if (!message) continue;

    const groupKey =
      field === 'customIndustry'
        ? 'industry'
        : field === 'logoBranding'
          ? 'logoBranding'
          : field === 'brandBranding'
            ? 'brandBranding'
            : field;
    const group = formRoot.querySelector(`[data-form-field="${groupKey}"]`);
    if (group instanceof HTMLElement) {
      group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const stableIdFields: Partial<Record<TemplateRequestValidatableField, string>> = {
      businessName: 'businessName',
      preferredUrl: 'preferredUrl',
      location: 'location',
      additionalNotes: 'additionalNotes'
    };
    const stableId = stableIdFields[field];
    if (stableId) {
      document.getElementById(stableId)?.focus();
    } else if (field === 'customIndustry') {
      group?.querySelector<HTMLInputElement>('.industry-card-grid__custom input.form-input')?.focus();
    } else if (field === 'industry') {
      group?.querySelector<HTMLInputElement>('input.form-option__input')?.focus();
    } else if (field === 'goals') {
      group?.querySelector<HTMLInputElement>('input.form-option__input')?.focus();
    } else if (field === 'audienceTags') {
      group?.querySelector<HTMLInputElement>('.tag-input__field')?.focus();
    } else if (field === 'requestCategories') {
      group?.querySelector<HTMLInputElement>('input.form-option__input')?.focus();
    }
    break;
  }
}

function handleSubmit(): void {
  if (props.readOnly) return;
  if (
    !validateAll({
      newLogoFileCount: uploadedLogoFiles.value.length,
      newBrandFileCount: uploadedFiles.value.length
    })
  ) {
    void nextTick(() => {
      scrollToFirstInvalidField();
    });
    return;
  }
  emit('submit', {
    ...formData.value,
    files: [...uploadedFiles.value],
    logoFiles: [...uploadedLogoFiles.value]
  });
}

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

function getSnapshotForDirtyCheck(): TemplateRequestFormData {
  return {
    ...formData.value,
    files: [...uploadedFiles.value],
    logoFiles: [...uploadedLogoFiles.value]
  };
}

defineExpose({
  getSnapshotForDirtyCheck
});
</script>

<style src="~/assets/css/components.css"></style>

<style scoped>
.request-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.request-form--read-only input,
.request-form--read-only select,
.request-form--read-only textarea,
.request-form--read-only [contenteditable],
.request-form--read-only button {
  pointer-events: none;
  opacity: 0.85;
  cursor: not-allowed;
}

.form-textarea--tall {
  min-height: 7.5rem;
}

/* Invalid state when parent form-group has error (.request-form raises specificity over FormSection theming) */
.request-form .form-group--error :deep(.icon-input__field) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
}

.request-form .form-group--error :deep(.icon-input__field:focus) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.request-form .form-group--error :deep(.location-input__field) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
}

.request-form .form-group--error :deep(.location-input__field:focus) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

/* Subsection styling */
.form-subsection {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-lg);
}

.form-subsection--logos {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--color-primary-tint) 72%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-primary-tint) 36%, var(--color-bg)) 100%
  );
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--color-primary) 8%, transparent),
    0 4px 14px color-mix(in srgb, var(--color-primary) 9%, transparent);
}

.form-subsection--logos .form-subsection__title {
  color: color-mix(in srgb, var(--color-primary) 28%, var(--color-text));
  letter-spacing: 0.01em;
}

.form-subsection--logos .form-subsection__desc {
  color: color-mix(in srgb, var(--color-primary) 10%, var(--color-text-muted));
}

.form-subsection--branding {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-accent-warm-deep) 24%, var(--color-border));
  background: linear-gradient(
    168deg,
    color-mix(in srgb, var(--color-accent-warm-tint) 78%, var(--color-bg)) 0%,
    color-mix(in srgb, var(--color-accent-warm-tint) 42%, var(--color-bg)) 55%,
    color-mix(in srgb, var(--color-accent-warm-deep) 6%, var(--color-bg)) 100%
  );
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--color-accent-warm-deep) 10%, transparent),
    0 4px 16px color-mix(in srgb, var(--color-accent-warm-deep) 11%, transparent);
}

.form-subsection--branding .form-subsection__title {
  color: color-mix(in srgb, var(--color-accent-warm-deep) 32%, var(--color-text));
  letter-spacing: 0.01em;
}

.form-subsection--branding .form-subsection__desc {
  color: color-mix(in srgb, var(--color-accent-warm-deep) 12%, var(--color-text-muted));
}

.form-subsection:last-child {
  border-bottom: none;
}

.form-subsection__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--space-xs) 0;
}

.form-subsection__desc {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-md) 0;
  line-height: 1.5;
}

/* Preferred URL field with icon */
.preferred-url-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.preferred-url-icon {
  position: absolute;
  left: var(--space-md);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--color-text-muted);
}

.preferred-url-icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.preferred-url-input {
  padding-left: 2.5rem;
}

/* Hint text for form fields */
.form-hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: var(--space-xs) 0 0;
  line-height: 1.5;
}

/* Existing attachments (order edit): read-only list */
.existing-attachments {
  margin-bottom: var(--space-md);
}

.existing-attachments-list {
  list-style: none;
  margin: 0;
  padding: var(--space-sm) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.existing-attachments-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.form-subsection--branding .existing-attachments-item {
  background: color-mix(in srgb, var(--color-accent-warm-tint) 45%, var(--color-bg));
  border-color: color-mix(in srgb, var(--color-accent-warm-deep) 14%, var(--color-border));
}

.existing-attachments-name {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.existing-attachments-size {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}

.existing-attachments-link {
  flex-shrink: 0;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.existing-attachments-link:hover {
  text-decoration: underline;
}

.form-subsection--branding .existing-attachments-link {
  color: color-mix(in srgb, var(--color-accent-warm-deep) 45%, var(--color-primary));
}
</style>
