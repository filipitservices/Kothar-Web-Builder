/** Form state, progress, and color defaults for the template request form. */
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type {
  ColorCustomization,
  TemplateRequestFormData,
  LocationData
} from '~/types/templateRequest';
import { normalizeLocationData } from '~/utils/requestInputNormalization';

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

/** Progress steps: color + logo + brand + business (4) + goals + audience + notes + categories — see progress computed. */
const TOTAL_FIELDS = 10;

function createEmptyLocation(): LocationData {
  return { displayName: '', verified: false };
}

function createInitialFormData(colors: ColorCustomization): TemplateRequestFormData {
  return {
    colorCustomization: { ...colors },
    logoAssets: [],
    logoFiles: [],
    brandAssets: [],
    files: [],
    businessName: '',
    preferredUrl: '',
    location: createEmptyLocation(),
    industry: '',
    customIndustry: '',
    goals: [],
    audienceTags: [],
    additionalNotes: '',
    requestCategories: []
  };
}

export function useTemplateRequestForm(
  template: Ref<ShowcaseTemplate | undefined>,
  uploadedFiles: Ref<readonly File[]>,
  uploadedLogoFiles: Ref<readonly File[]>
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

    // Design customization — always counts as 1 (pre-filled from template)
    completed++;

    // Branding (new uploads or already attached names)
    if (uploadedLogoFiles.value.length > 0 || data.logoAssets.length > 0) completed++;
    if (uploadedFiles.value.length > 0 || data.brandAssets.length > 0) completed++;

    // Business info
    if (data.businessName.trim()) completed++;
    if (data.preferredUrl.trim()) completed++;
    if (data.location.displayName.trim()) completed++;
    if (data.industry) completed++;

    // Website goals
    if (data.goals.length > 0) completed++;
    if (data.audienceTags.length > 0) completed++;

    // Additional requests
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
      audienceTags: [...(data.audienceTags ?? [])],
      requestCategories: [...(data.requestCategories ?? [])],
      logoAssets: [...(data.logoAssets ?? [])],
      logoFiles: data.logoFiles ? [...data.logoFiles] : [],
      files: data.files ? [...data.files] : [],
      location: data.location
        ? normalizeLocationData({
            displayName: data.location.displayName,
            verified: data.location.verified,
            city: data.location.city,
            state: data.location.state,
            country: data.location.country,
            postcode: data.location.postcode,
            lat: data.location.lat,
            lon: data.location.lon
          })
        : createEmptyLocation()
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
