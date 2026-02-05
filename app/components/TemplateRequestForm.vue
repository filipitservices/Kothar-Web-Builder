<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <!-- Progress Indicator -->
    <FormProgress :completed="completedFields" :total="totalFields" />

    <!-- Design Customization -->
    <FormSection
      title="Design Customization"
      hint="Choose colors that represent your brand"
      variant="palette"
      featured
    >
      <template #icon><PaletteIcon /></template>
      <ColorSchemePicker
        :colors="localFormData.colorCustomization"
        :default-colors="defaultColors"
        @update:colors="handleColorsUpdate"
        @reset="resetAllColors"
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
          v-model="localFormData.businessName"
          type="text"
          class="form-input"
          placeholder="e.g., Smith Plumbing Services"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="industry" class="form-label">Industry / Type <span class="required">*</span></label>
          <select id="industry" v-model="localFormData.industry" class="form-select" required>
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
            v-model="localFormData.yearsInBusiness"
            type="text"
            class="form-input"
            placeholder="e.g., 15 years"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="businessDescription" class="form-label">Tell us about your business</label>
        <textarea
          id="businessDescription"
          v-model="localFormData.businessDescription"
          class="form-textarea"
          rows="3"
          placeholder="What makes your business unique? What do you specialize in?"
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
            v-model="localFormData.contactName"
            type="text"
            placeholder="Your name"
            required
          >
            <template #icon><UserIcon /></template>
          </IconInput>
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email <span class="required">*</span></label>
          <IconInput
            id="email"
            v-model="localFormData.email"
            type="email"
            placeholder="you@company.com"
            required
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
            v-model="localFormData.phone"
            type="tel"
            placeholder="(555) 123-4567"
          >
            <template #icon><PhoneIcon /></template>
          </IconInput>
        </div>
        <div class="form-group">
          <label for="website" class="form-label">Current Website (if any)</label>
          <IconInput
            id="website"
            v-model="localFormData.website"
            type="url"
            placeholder="https://www.example.com"
          >
            <template #icon><GlobeIcon /></template>
          </IconInput>
        </div>
      </div>

      <div class="form-group">
        <label for="address" class="form-label">Business Address</label>
        <IconInput
          id="address"
          v-model="localFormData.address"
          type="text"
          placeholder="123 Main St, City, State 12345"
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
          v-model="localFormData.goals"
          :goals="WEBSITE_GOALS"
        />
      </div>

      <div class="form-group">
        <label for="targetAudience" class="form-label">Who is your target audience?</label>
        <textarea
          id="targetAudience"
          v-model="localFormData.targetAudience"
          class="form-textarea"
          rows="2"
          placeholder="e.g., Homeowners in the Greater Metro area, property managers, commercial businesses"
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
        <div class="checkbox-group">
          <label v-for="asset in BRAND_ASSETS" :key="asset.value" class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" :value="asset.value" />
            <span>{{ asset.label }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="additionalNotes" class="form-label">Any additional notes or special requests?</label>
        <textarea
          id="additionalNotes"
          v-model="localFormData.additionalNotes"
          class="form-textarea form-textarea--tall"
          rows="4"
          placeholder="Tell us anything else that would help us create the perfect website for your business..."
        ></textarea>
      </div>
    </FormSection>

    <!-- Submit Section -->
    <FormSubmit :loading="isSubmitting" />
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

// Components
import ColorSchemePicker from '~/components/ColorSchemePicker.vue';
import FormSection from '~/components/form/FormSection.vue';
import FormProgress from '~/components/form/FormProgress.vue';
import FormSubmit from '~/components/form/FormSubmit.vue';
import IconInput from '~/components/form/IconInput.vue';
import GoalSelector from '~/components/form/GoalSelector.vue';

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
import { INDUSTRY_OPTIONS, WEBSITE_GOALS, BRAND_ASSETS } from '~/constants/formOptions';

// Re-export types for consumers
export type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

interface Props {
  template: ShowcaseTemplate;
  isSubmitting?: boolean;
}

interface Emits {
  (e: 'submit', data: TemplateRequestFormData): void;
  (e: 'colorChange', colors: ColorCustomization): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false
});

const emit = defineEmits<Emits>();

/**
 * Default colors from the template (used for reset)
 */
const defaultColors = computed<ColorCustomization>(() => ({
  primary: props.template.colorScheme.primary,
  secondary: props.template.colorScheme.secondary,
  accent: props.template.colorScheme.accent,
  background: props.template.colorScheme.background,
  text: props.template.colorScheme.text
}));

/**
 * Create initial form data with template's default colors
 */
function createInitialFormData(): TemplateRequestFormData {
  return {
    businessName: '',
    industry: '',
    yearsInBusiness: '',
    businessDescription: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    goals: [],
    targetAudience: '',
    brandAssets: [],
    additionalNotes: '',
    colorCustomization: { ...defaultColors.value }
  };
}

const localFormData = ref<TemplateRequestFormData>(createInitialFormData());

/**
 * Total trackable fields for progress
 * Includes all form inputs:
 * - Color customization (1) - always completed (pre-filled from template)
 * - Business info: businessName, industry, yearsInBusiness, businessDescription (4)
 * - Contact info: contactName, email, phone, website, address (5)
 * - Goals: goals selection, targetAudience (2)
 * - Branding: brandAssets, additionalNotes (2)
 */
const totalFields = 14;

/**
 * Count completed fields for progress indicator
 * Tracks every input field in the form
 */
const completedFields = computed(() => {
  let count = 0;
  
  // Design customization - always counts as 1 (pre-filled from template)
  // Colors are always set, whether using template defaults or a custom preset
  count++;
  
  // Business information
  if (localFormData.value.businessName.trim()) count++;
  if (localFormData.value.industry) count++;
  if (localFormData.value.yearsInBusiness.trim()) count++;
  if (localFormData.value.businessDescription.trim()) count++;
  
  // Contact information
  if (localFormData.value.contactName.trim()) count++;
  if (localFormData.value.email.trim()) count++;
  if (localFormData.value.phone.trim()) count++;
  if (localFormData.value.website.trim()) count++;
  if (localFormData.value.address.trim()) count++;
  
  // Website goals
  if (localFormData.value.goals.length > 0) count++;
  if (localFormData.value.targetAudience.trim()) count++;
  
  // Branding & content
  if (localFormData.value.brandAssets.length > 0) count++;
  if (localFormData.value.additionalNotes.trim()) count++;
  
  return count;
});

/**
 * Handle color updates from the picker
 */
function handleColorsUpdate(colors: ColorCustomization): void {
  localFormData.value = {
    ...localFormData.value,
    colorCustomization: colors
  };
  emit('colorChange', colors);
}

/**
 * Reset colors to template defaults
 */
function resetAllColors(): void {
  const colors = { ...defaultColors.value };
  localFormData.value = {
    ...localFormData.value,
    colorCustomization: colors
  };
  emit('colorChange', colors);
}

/**
 * Handle form submission
 */
function handleSubmit(): void {
  emit('submit', localFormData.value);
}

/**
 * Watch for template changes and reset form
 */
watch(() => props.template.id, () => {
  localFormData.value = createInitialFormData();
  emit('colorChange', localFormData.value.colorCustomization);
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
