<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <!-- Design Customization -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Design Customization</legend>
      <ColorSchemePicker
        :colors="localFormData.colorCustomization"
        :default-colors="defaultColors"
        @update:colors="handleColorsUpdate"
        @reset="resetAllColors"
      />
    </fieldset>

    <!-- Business Information -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Business Information</legend>

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
    </fieldset>

    <!-- Contact Information -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Contact Information</legend>

      <div class="form-row">
        <div class="form-group">
          <label for="contactName" class="form-label">Contact Name <span class="required">*</span></label>
          <input
            id="contactName"
            v-model="localFormData.contactName"
            type="text"
            class="form-input"
            placeholder="Your name"
            required
          />
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email <span class="required">*</span></label>
          <input
            id="email"
            v-model="localFormData.email"
            type="email"
            class="form-input"
            placeholder="you@company.com"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <input
            id="phone"
            v-model="localFormData.phone"
            type="tel"
            class="form-input"
            placeholder="(555) 123-4567"
          />
        </div>
        <div class="form-group">
          <label for="website" class="form-label">Current Website (if any)</label>
          <input
            id="website"
            v-model="localFormData.website"
            type="url"
            class="form-input"
            placeholder="https://www.example.com"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="address" class="form-label">Business Address</label>
        <input
          id="address"
          v-model="localFormData.address"
          type="text"
          class="form-input"
          placeholder="123 Main St, City, State 12345"
        />
      </div>
    </fieldset>

    <!-- Website Goals -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Website Goals</legend>

      <div class="form-group">
        <label class="form-label">What are the primary goals for your website? <span class="required">*</span></label>
        <div class="checkbox-group">
          <label v-for="goal in WEBSITE_GOALS" :key="goal.value" class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" :value="goal.value" />
            <span>{{ goal.label }}</span>
          </label>
        </div>
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
    </fieldset>

    <!-- Branding & Content -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Branding & Content</legend>

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
          class="form-textarea"
          rows="4"
          placeholder="Tell us anything else that would help us create the perfect website for your business..."
        ></textarea>
      </div>
    </fieldset>

    <!-- Submit -->
    <div class="form-actions">
      <button type="submit" class="btn btn--primary btn--lg" :disabled="isSubmitting">
        <span v-if="isSubmitting">Submitting...</span>
        <span v-else>
          Submit Request
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </button>
      <p class="form-disclaimer">
        We'll review your request and get back to you within 1-2 business days.
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';
import ColorSchemePicker from '~/components/ColorSchemePicker.vue';

// Re-export types for consumers
export type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

/**
 * Industry options for the dropdown
 */
const INDUSTRY_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'construction', label: 'Construction / Contracting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'accounting', label: 'Accounting / Tax' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'medical', label: 'Medical / Dental' },
  { value: 'therapy', label: 'Therapy / Wellness' },
  { value: 'restaurant', label: 'Restaurant / Food' },
  { value: 'retail', label: 'Retail' },
  { value: 'photography', label: 'Photography' },
  { value: 'agency', label: 'Marketing / Design Agency' },
  { value: 'other', label: 'Other' }
] as const;

/**
 * Website goals checkbox options
 */
const WEBSITE_GOALS = [
  { value: 'generate-leads', label: 'Generate leads & inquiries' },
  { value: 'showcase-services', label: 'Showcase services & portfolio' },
  { value: 'build-credibility', label: 'Build credibility & trust' },
  { value: 'local-seo', label: 'Improve local SEO / visibility' },
  { value: 'booking', label: 'Allow online booking / scheduling' },
  { value: 'ecommerce', label: 'Sell products online' }
] as const;

/**
 * Brand assets checkbox options
 */
const BRAND_ASSETS = [
  { value: 'logo', label: 'Logo' },
  { value: 'colors', label: 'Brand colors' },
  { value: 'photos', label: 'Professional photos' },
  { value: 'copy', label: 'Written content / copy' },
  { value: 'none', label: 'I need help with all of this' }
] as const;

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

<!-- Import shared form styles -->
<style src="~/assets/css/components.css"></style>

<!-- Component-specific styles -->
<style scoped>
/**
 * TemplateRequestForm - Minimal component-specific styles
 * Base form styles come from components.css (imported above)
 */

.request-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin-top: 2rem;
  padding-top: 1.75rem;
  border-top: 1px solid #e5e7eb;
}

.form-actions .btn {
  min-width: 200px;
}

.form-actions .btn svg {
  width: 18px;
  height: 18px;
}

.form-disclaimer {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 1rem 0 0 0;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .form-actions .btn {
    width: 100%;
  }
}
</style>
