/** Form state, progress, and color defaults for the template request form. */
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

export interface FormProgress {
  completed: number;
  total: number;
}

export interface UseTemplateRequestFormReturn {
  formData: Ref<TemplateRequestFormData>;
  progress: ComputedRef<FormProgress>;
  defaultColors: ComputedRef<ColorCustomization>;
  updateField: <K extends keyof TemplateRequestFormData>(
    field: K,
    value: TemplateRequestFormData[K]
  ) => void;
  updateColors: (colors: ColorCustomization) => void;
  resetColors: () => ColorCustomization;
  hydrateFormData: (data: TemplateRequestFormData) => void;
}

const TOTAL_FIELDS = 14;

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

export function useTemplateRequestForm(
  template: Ref<ShowcaseTemplate | undefined>,
  uploadedFiles: Ref<readonly File[]>
): UseTemplateRequestFormReturn {
  
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

  const formData = ref<TemplateRequestFormData>(
    createInitialFormData(defaultColors.value)
  );

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

    return {
      completed,
      total: TOTAL_FIELDS
    };
  });

  function updateField<K extends keyof TemplateRequestFormData>(
    field: K,
    value: TemplateRequestFormData[K]
  ): void {
    formData.value = {
      ...formData.value,
      [field]: value
    };
  }

  function updateColors(colors: ColorCustomization): void {
    formData.value = {
      ...formData.value,
      colorCustomization: { ...colors }
    };
  }

  function resetColors(): ColorCustomization {
    const colors = { ...defaultColors.value };
    updateColors(colors);
    return colors;
  }

  function resetForm(): void {
    formData.value = createInitialFormData(defaultColors.value);
  }

  function hydrateFormData(data: TemplateRequestFormData): void {
    formData.value = {
      ...data,
      colorCustomization: { ...data.colorCustomization },
      goals: [...data.goals],
      files: data.files ? [...data.files] : []
    };
  }

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
    hydrateFormData
  };
}
