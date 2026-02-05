<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <!-- Progress Indicator -->
    <div class="form-progress">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <span class="progress-label">{{ completedFields }} of {{ totalFields }} fields completed</span>
    </div>

    <!-- Design Customization -->
    <fieldset class="form-fieldset form-fieldset--featured">
      <legend class="fieldset-legend">
        <span class="legend-icon legend-icon--palette">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.53-.21-1.01-.54-1.37-.33-.35-.54-.82-.54-1.33 0-1.1.9-2 2-2h2.36c3.1 0 5.62-2.52 5.62-5.62C22.96 5.82 18.16 2 12 2z"/>
            <circle cx="7.5" cy="11.5" r="1.5"/>
            <circle cx="10.5" cy="7.5" r="1.5"/>
            <circle cx="16.5" cy="7.5" r="1.5"/>
            <circle cx="17.5" cy="11.5" r="1.5"/>
          </svg>
        </span>
        <span class="legend-text">
          <span class="legend-title">Design Customization</span>
          <span class="legend-hint">Choose colors that represent your brand</span>
        </span>
      </legend>
      <ColorSchemePicker
        :colors="localFormData.colorCustomization"
        :default-colors="defaultColors"
        @update:colors="handleColorsUpdate"
        @reset="resetAllColors"
      />
    </fieldset>

    <!-- Business Information -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">
        <span class="legend-icon legend-icon--building">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
          </svg>
        </span>
        <span class="legend-text">
          <span class="legend-title">Business Information</span>
          <span class="legend-hint">Tell us about your company</span>
        </span>
        <span class="legend-step">1</span>
      </legend>

      <div class="form-group">
        <label for="businessName" class="form-label">Business Name <span class="required">*</span></label>
        <div class="input-wrapper">
          <input
            id="businessName"
            v-model="localFormData.businessName"
            type="text"
            class="form-input"
            placeholder="e.g., Smith Plumbing Services"
            required
          />
        </div>
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
      <legend class="fieldset-legend">
        <span class="legend-icon legend-icon--contact">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
        <span class="legend-text">
          <span class="legend-title">Contact Information</span>
          <span class="legend-hint">How can we reach you?</span>
        </span>
        <span class="legend-step">2</span>
      </legend>

      <div class="form-row">
        <div class="form-group">
          <label for="contactName" class="form-label">Contact Name <span class="required">*</span></label>
          <div class="input-wrapper input-wrapper--icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="contactName"
              v-model="localFormData.contactName"
              type="text"
              class="form-input form-input--with-icon"
              placeholder="Your name"
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email <span class="required">*</span></label>
          <div class="input-wrapper input-wrapper--icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="email"
              v-model="localFormData.email"
              type="email"
              class="form-input form-input--with-icon"
              placeholder="you@company.com"
              required
            />
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone" class="form-label">Phone Number</label>
          <div class="input-wrapper input-wrapper--icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <input
              id="phone"
              v-model="localFormData.phone"
              type="tel"
              class="form-input form-input--with-icon"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        <div class="form-group">
          <label for="website" class="form-label">Current Website (if any)</label>
          <div class="input-wrapper input-wrapper--icon">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <input
              id="website"
              v-model="localFormData.website"
              type="url"
              class="form-input form-input--with-icon"
              placeholder="https://www.example.com"
            />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="address" class="form-label">Business Address</label>
        <div class="input-wrapper input-wrapper--icon">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <input
            id="address"
            v-model="localFormData.address"
            type="text"
            class="form-input form-input--with-icon"
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>
    </fieldset>

    <!-- Website Goals -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">
        <span class="legend-icon legend-icon--target">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </span>
        <span class="legend-text">
          <span class="legend-title">Website Goals</span>
          <span class="legend-hint">What do you want to achieve?</span>
        </span>
        <span class="legend-step">3</span>
      </legend>

      <div class="form-group">
        <label class="form-label">What are the primary goals for your website? <span class="required">*</span></label>
        <div class="checkbox-grid">
          <label
            v-for="goal in WEBSITE_GOALS"
            :key="goal.value"
            class="checkbox-card"
            :class="{ 'checkbox-card--checked': localFormData.goals.includes(goal.value) }"
          >
            <input type="checkbox" v-model="localFormData.goals" :value="goal.value" />
            <span class="checkbox-card__icon">
              <svg v-if="goal.value === 'generate-leads'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <svg v-else-if="goal.value === 'showcase-services'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <svg v-else-if="goal.value === 'build-credibility'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <svg v-else-if="goal.value === 'local-seo'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <svg v-else-if="goal.value === 'booking'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
            <span class="checkbox-card__label">{{ goal.label }}</span>
            <span class="checkbox-card__check">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </span>
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
      <legend class="fieldset-legend">
        <span class="legend-icon legend-icon--sparkle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </span>
        <span class="legend-text">
          <span class="legend-title">Branding & Content</span>
          <span class="legend-hint">Assets you already have</span>
        </span>
        <span class="legend-step">4</span>
      </legend>

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
    </fieldset>

    <!-- Submit Section -->
    <div class="form-submit">
      <div class="submit-content">
        <div class="submit-info">
          <h3 class="submit-title">Ready to get started?</h3>
          <p class="submit-description">We'll review your request and get back to you within 1-2 business days with a personalized proposal.</p>
        </div>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="submit-btn__loading">
            <svg class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60" stroke-linecap="round"/>
            </svg>
            Submitting...
          </span>
          <span v-else class="submit-btn__content">
            Submit Request
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
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
 * Total trackable fields for progress
 */
const totalFields = 6;

/**
 * Count completed fields for progress indicator
 */
const completedFields = computed(() => {
  let count = 0;
  if (localFormData.value.businessName.trim()) count++;
  if (localFormData.value.industry) count++;
  if (localFormData.value.contactName.trim()) count++;
  if (localFormData.value.email.trim()) count++;
  if (localFormData.value.goals.length > 0) count++;
  if (localFormData.value.businessDescription.trim() || localFormData.value.targetAudience.trim()) count++;
  return count;
});

/**
 * Progress percentage for visual indicator
 */
const progressPercentage = computed(() => {
  return Math.round((completedFields.value / totalFields) * 100);
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

<!-- Import shared form styles -->
<style src="~/assets/css/components.css"></style>

<!-- Component-specific styles -->
<style scoped>
/**
 * TemplateRequestForm - Enhanced visual design
 * Uses design tokens from components.css
 */

.request-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ==========================================================================
   PROGRESS INDICATOR
   ========================================================================== */

.form-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0f4ff 0%, #fff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-label {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
}

/* ==========================================================================
   FIELDSET ENHANCEMENTS
   ========================================================================== */

.form-fieldset {
  border: none;
  padding: 1.5rem;
  margin: 0 0 1rem 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-fieldset:hover {
  border-color: #d1d5db;
}

.form-fieldset:focus-within {
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.06);
}

.form-fieldset:last-of-type {
  margin-bottom: 0;
}

.form-fieldset--featured {
  background: linear-gradient(135deg, #fafbfc 0%, #fff 100%);
  border-color: #e0e7ff;
}

/* Fieldset inner spacing */
.form-fieldset .form-group {
  margin-bottom: 1.25rem;
}

.form-fieldset .form-group:last-child {
  margin-bottom: 0;
}

.form-fieldset .form-row {
  margin-bottom: 1.25rem;
}

.form-fieldset .form-row:last-child {
  margin-bottom: 0;
}

/* ==========================================================================
   LEGEND WITH ICON
   ========================================================================== */

.fieldset-legend {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.legend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.legend-icon svg {
  width: 20px;
  height: 20px;
}

.legend-icon--palette {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  color: #1e3a8a;
}

.legend-icon--building {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.legend-icon--contact {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.legend-icon--target {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.legend-icon--sparkle {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #6d28d9;
}

.legend-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.legend-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.legend-hint {
  font-size: 0.8125rem;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.3;
}

.legend-step {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
}

/* ==========================================================================
   INPUT WITH ICON
   ========================================================================== */

.input-wrapper {
  position: relative;
}

.input-wrapper--icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.15s ease;
}

.input-wrapper--icon:focus-within .input-icon {
  color: #1e3a8a;
}

.form-input--with-icon {
  padding-left: 2.75rem;
}

/* ==========================================================================
   CHECKBOX GRID (Goals section)
   ========================================================================== */

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}

.checkbox-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.checkbox-card:hover {
  border-color: #d1d5db;
  background: #fafbfc;
}

.checkbox-card--checked {
  border-color: #1e3a8a;
  background: rgba(30, 58, 138, 0.04);
}

.checkbox-card--checked:hover {
  background: rgba(30, 58, 138, 0.06);
}

.checkbox-card input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.checkbox-card__icon svg {
  width: 18px;
  height: 18px;
  color: #6b7280;
  transition: color 0.15s ease;
}

.checkbox-card--checked .checkbox-card__icon {
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
}

.checkbox-card--checked .checkbox-card__icon svg {
  color: #1e3a8a;
}

.checkbox-card__label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.checkbox-card__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #e5e7eb;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s ease;
}

.checkbox-card__check svg {
  width: 12px;
  height: 12px;
  color: #fff;
}

.checkbox-card--checked .checkbox-card__check {
  opacity: 1;
  transform: scale(1);
  background: #1e3a8a;
}

/* ==========================================================================
   TEXTAREA VARIANT
   ========================================================================== */

.form-textarea--tall {
  min-height: 120px;
}

/* ==========================================================================
   SUBMIT SECTION
   ========================================================================== */

.form-submit {
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #2d5aa8 100%);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(30, 58, 138, 0.15);
}

.submit-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.submit-info {
  flex: 1;
}

.submit-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.375rem 0;
}

.submit-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.5;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1.75rem;
  background: #fff;
  color: #1e3a8a;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn:hover:not(:disabled) {
  background: #f0f4ff;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn__content svg {
  width: 18px;
  height: 18px;
}

.submit-btn__loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   RESPONSIVE
   ========================================================================== */

@media (max-width: 640px) {
  .form-progress {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .progress-label {
    text-align: center;
  }

  .fieldset-legend {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .legend-step {
    order: -1;
    margin-left: auto;
  }

  .form-submit {
    padding: 1.5rem;
  }

  .submit-content {
    flex-direction: column;
    text-align: center;
  }

  .submit-info {
    margin-bottom: 0.5rem;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
