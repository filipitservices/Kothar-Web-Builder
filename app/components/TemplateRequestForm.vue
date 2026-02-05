<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <!-- Design Customization -->
    <fieldset class="form-fieldset">
      <legend class="fieldset-legend">Design Customization</legend>

      <div class="color-palette-container">
        <div class="color-palette-header">
          <span class="color-palette-title">Color Scheme</span>
          <button
            v-if="hasColorChanges"
            type="button"
            class="color-palette-reset"
            @click="resetAllColors"
          >
            Reset to defaults
          </button>
        </div>
        <p class="color-palette-hint">Click any color to customize. Changes update the preview instantly.</p>

        <div class="color-palette">
          <div
            v-for="colorDef in colorDefinitions"
            :key="colorDef.key"
            class="color-swatch-item"
          >
            <label class="color-swatch-control">
              <input
                type="color"
                :value="localFormData.colorCustomization[colorDef.key]"
                class="color-swatch-input"
                @input="handleColorChange(colorDef.key, ($event.target as HTMLInputElement).value)"
              />
              <span
                class="color-swatch"
                :style="{ backgroundColor: localFormData.colorCustomization[colorDef.key] }"
              ></span>
            </label>
            <span class="color-swatch-label">{{ colorDef.label }}</span>
          </div>
        </div>
      </div>
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
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="construction">Construction / Contracting</option>
            <option value="landscaping">Landscaping</option>
            <option value="cleaning">Cleaning Services</option>
            <option value="legal">Legal Services</option>
            <option value="accounting">Accounting / Tax</option>
            <option value="consulting">Consulting</option>
            <option value="medical">Medical / Dental</option>
            <option value="therapy">Therapy / Wellness</option>
            <option value="restaurant">Restaurant / Food</option>
            <option value="retail">Retail</option>
            <option value="photography">Photography</option>
            <option value="agency">Marketing / Design Agency</option>
            <option value="other">Other</option>
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
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="generate-leads" />
            <span>Generate leads & inquiries</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="showcase-services" />
            <span>Showcase services & portfolio</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="build-credibility" />
            <span>Build credibility & trust</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="local-seo" />
            <span>Improve local SEO / visibility</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="booking" />
            <span>Allow online booking / scheduling</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.goals" value="ecommerce" />
            <span>Sell products online</span>
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
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" value="logo" />
            <span>Logo</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" value="colors" />
            <span>Brand colors</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" value="photos" />
            <span>Professional photos</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" value="copy" />
            <span>Written content / copy</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="localFormData.brandAssets" value="none" />
            <span>I need help with all of this</span>
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

/**
 * Color Customization Schema
 */
export interface ColorCustomization {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

/**
 * Form Data Schema
 */
export interface TemplateRequestFormData {
  businessName: string;
  industry: string;
  yearsInBusiness: string;
  businessDescription: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  goals: string[];
  targetAudience: string;
  brandAssets: string[];
  additionalNotes: string;
  colorCustomization: ColorCustomization;
}

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
 * Color definitions for the palette UI
 */
interface ColorDefinition {
  key: keyof ColorCustomization;
  label: string;
}

const colorDefinitions: ColorDefinition[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' }
];

/**
 * Create initial form data with template's default colors
 */
const createInitialFormData = (): TemplateRequestFormData => ({
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
  colorCustomization: {
    primary: props.template.colorScheme.primary,
    secondary: props.template.colorScheme.secondary,
    accent: props.template.colorScheme.accent,
    background: props.template.colorScheme.background,
    text: props.template.colorScheme.text
  }
});

const localFormData = ref<TemplateRequestFormData>(createInitialFormData());

/**
 * Check if any color has been changed from template defaults
 */
const hasColorChanges = computed(() => {
  const colors = localFormData.value.colorCustomization;
  const defaults = props.template.colorScheme;
  return (
    colors.primary !== defaults.primary ||
    colors.secondary !== defaults.secondary ||
    colors.accent !== defaults.accent ||
    colors.background !== defaults.background ||
    colors.text !== defaults.text
  );
});

/**
 * Handle color change - update local state and emit to parent
 */
const handleColorChange = (colorKey: keyof ColorCustomization, value: string): void => {
  // Validate hex color format
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(value)) {
    return;
  }

  const newColors: ColorCustomization = {
    ...localFormData.value.colorCustomization,
    [colorKey]: value
  };

  localFormData.value = {
    ...localFormData.value,
    colorCustomization: newColors
  };

  emit('colorChange', newColors);
};

/**
 * Reset all colors to template defaults
 */
const resetAllColors = (): void => {
  const defaults = props.template.colorScheme;
  const newColors: ColorCustomization = {
    primary: defaults.primary,
    secondary: defaults.secondary,
    accent: defaults.accent,
    background: defaults.background,
    text: defaults.text
  };

  localFormData.value = {
    ...localFormData.value,
    colorCustomization: newColors
  };

  emit('colorChange', newColors);
};

/**
 * Handle form submission
 */
const handleSubmit = (): void => {
  emit('submit', localFormData.value);
};

/**
 * Watch for template changes
 */
watch(() => props.template.id, () => {
  localFormData.value = createInitialFormData();
  emit('colorChange', localFormData.value.colorCustomization);
});
</script>

<!-- Import shared form styles (not scoped - these are design system patterns) -->
<style src="~/assets/css/components.css"></style>

<!-- Component-specific styles -->
<style scoped>
/**
 * TemplateRequestForm - Component-specific overrides
 *
 * Base form styles come from components.css (imported above)
 * This block only contains component-specific additions
 */

/* ==========================================================================
   COLOR PALETTE
   A contained widget for color customization
   ========================================================================== */

.color-palette-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.color-palette-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.color-palette-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.color-palette-reset {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.15s ease;
}

.color-palette-reset:hover {
  color: #1e3a8a;
  text-decoration: underline;
}

.color-palette-hint {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.color-palette {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-swatch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.color-swatch-control {
  position: relative;
  cursor: pointer;
}

.color-swatch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-swatch {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #e5e7eb, 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-swatch-control:hover .color-swatch {
  transform: scale(1.08);
  box-shadow: 0 0 0 1px #d1d5db, 0 4px 8px rgba(0, 0, 0, 0.12);
}

.color-swatch-control:focus-within .color-swatch {
  box-shadow: 0 0 0 2px #1e3a8a, 0 0 0 4px rgba(30, 58, 138, 0.2);
}

.color-swatch-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* ==========================================================================
   FORM DISCLAIMER
   ========================================================================== */

.form-disclaimer {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 1rem 0 0 0;
  line-height: 1.5;
}

/* ==========================================================================
   RESPONSIVE
   ========================================================================== */

@media (max-width: 480px) {
  .color-palette-container {
    padding: 0.875rem 1rem;
  }

  .color-palette {
    justify-content: space-between;
  }

  .color-swatch {
    width: 36px;
    height: 36px;
  }
}
</style>
