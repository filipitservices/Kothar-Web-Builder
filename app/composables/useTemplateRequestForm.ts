/**
 * Template Request Form Composable
 * 
 * Encapsulates form state management, progress tracking, and color customization
 * for the template request form.
 * 
 * Usage:
 * ```ts
 * const {
 *   formData,
 *   progress,
 *   defaultColors,
 *   updateFormData,
 *   updateColors,
 *   resetColors,
 *   resetForm
 * } = useTemplateRequestForm(templateRef, uploadedFilesRef);
 * ```
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

export interface FormProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface UseTemplateRequestFormReturn {
  /** Current form data (reactive) */
  formData: Ref<TemplateRequestFormData>;
  /** Progress tracking */
  progress: ComputedRef<FormProgress>;
  /** Default colors from template */
  defaultColors: ComputedRef<ColorCustomization>;
  /** Update a single form field */
  updateField: <K extends keyof TemplateRequestFormData>(
    field: K,
    value: TemplateRequestFormData[K]
  ) => void;
  /** Update color customization */
  updateColors: (colors: ColorCustomization) => void;
  /** Reset colors to template defaults */
  resetColors: () => ColorCustomization;
  /** Reset entire form to initial state */
  resetForm: () => void;
  /** Hydrate form from existing data (e.g. order edit); does not reset on template change. */
  hydrateFormData: (data: TemplateRequestFormData) => void;
}

/**
 * Total trackable fields for progress calculation
 * - Color customization (1) - always completed
 * - Business info: businessName, industry, yearsInBusiness, businessDescription (4)
 * - Contact info: contactName, email, phone, website, address (5)
 * - Goals: goals selection, targetAudience (2)
 * - Branding: uploadedFiles, additionalNotes (2)
 */
const TOTAL_FIELDS = 14;

/**
 * Create initial form data based on template
 */
function createInitialFormData(colors: ColorCustomization): TemplateRequestFormData {
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
    files: [],
    additionalNotes: '',
    colorCustomization: { ...colors }
  };
}

/**
 * Template request form composable
 */
export function useTemplateRequestForm(
  template: Ref<ShowcaseTemplate | undefined>,
  uploadedFiles: Ref<readonly File[]>
): UseTemplateRequestFormReturn {
  
  /**
   * Default colors derived from template
   */
  const defaultColors = computed<ColorCustomization>(() => {
    const t = template.value;
    if (!t) {
      return {
        primary: '#1e3a8a',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1e293b'
      };
    }
    return {
      primary: t.colorScheme.primary,
      secondary: t.colorScheme.secondary,
      accent: t.colorScheme.accent,
      background: t.colorScheme.background,
      text: t.colorScheme.text
    };
  });

  /**
   * Form data state
   */
  const formData = ref<TemplateRequestFormData>(
    createInitialFormData(defaultColors.value)
  );

  /**
   * Calculate progress based on filled fields
   */
  const progress = computed<FormProgress>(() => {
    let completed = 0;
    const data = formData.value;
    
    // Design customization - always counts as 1 (pre-filled from template)
    completed++;
    
    // Business information
    if (data.businessName.trim()) completed++;
    if (data.industry) completed++;
    if (data.yearsInBusiness.trim()) completed++;
    if (data.businessDescription.trim()) completed++;
    
    // Contact information
    if (data.contactName.trim()) completed++;
    if (data.email.trim()) completed++;
    if (data.phone.trim()) completed++;
    if (data.website.trim()) completed++;
    if (data.address.trim()) completed++;
    
    // Website goals
    if (data.goals.length > 0) completed++;
    if (data.targetAudience.trim()) completed++;
    
    // Branding & content
    if (uploadedFiles.value.length > 0) completed++;
    if (data.additionalNotes.trim()) completed++;

    const percentage = TOTAL_FIELDS > 0 
      ? Math.round((completed / TOTAL_FIELDS) * 100) 
      : 0;

    return {
      completed,
      total: TOTAL_FIELDS,
      percentage
    };
  });

  /**
   * Update a single form field (immutable)
   */
  function updateField<K extends keyof TemplateRequestFormData>(
    field: K,
    value: TemplateRequestFormData[K]
  ): void {
    formData.value = {
      ...formData.value,
      [field]: value
    };
  }

  /**
   * Update color customization (immutable)
   */
  function updateColors(colors: ColorCustomization): void {
    formData.value = {
      ...formData.value,
      colorCustomization: { ...colors }
    };
  }

  /**
   * Reset colors to template defaults
   * Returns the new colors for external use
   */
  function resetColors(): ColorCustomization {
    const colors = { ...defaultColors.value };
    updateColors(colors);
    return colors;
  }

  /**
   * Reset entire form to initial state
   */
  function resetForm(): void {
    formData.value = createInitialFormData(defaultColors.value);
  }

  /**
   * Hydrate form from existing data (e.g. prefilling from an order for edit).
   * Replaces current form state; use when initialFormData is provided by parent.
   */
  function hydrateFormData(data: TemplateRequestFormData): void {
    formData.value = {
      ...data,
      colorCustomization: { ...data.colorCustomization },
      goals: [...data.goals],
      files: data.files ? [...data.files] : []
    };
  }

  /**
   * Watch for template changes and reset form (only when not hydrating from external data)
   */
  watch(
    () => template.value?.id,
    () => {
      if (template.value) {
        resetForm();
      }
    }
  );

  return {
    formData,
    progress,
    defaultColors,
    updateField,
    updateColors,
    resetColors,
    resetForm,
    hydrateFormData
  };
}
