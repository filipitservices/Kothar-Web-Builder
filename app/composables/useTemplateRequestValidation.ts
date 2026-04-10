/** Centralized validation for the template request form; does not mutate form data. */
import { ref, type Ref } from 'vue';
import type {
  ColorCustomization,
  TemplateRequestFormData,
  TemplateRequestValidatableField,
  TemplateRequestValidationErrors
} from '~/types/templateRequest';
import {
  INDUSTRY_OPTIONS,
  WEBSITE_GOALS,
  REQUEST_CATEGORIES,
  NONSENSE_INDUSTRY_VALUES,
  WEBSITE_GOALS_MAX,
  REQUEST_CATEGORIES_MAX
} from '~/constants/formOptions';
import {
  hasDisallowedControlChars,
  normalizeMultilineInput,
  normalizeSingleLineInput,
  normalizeTags,
} from '~/utils/requestInputNormalization';

/** Minimum length for name-like fields */
const NAME_MIN_LENGTH = 2;
/** Maximum length for name-like fields */
const NAME_MAX_LENGTH = 200;
/** Maximum length for long text (notes) */
const LONG_TEXT_MAX_LENGTH = 2000;
/** Max goals selection (re-exported constant name for local validators) */
const GOALS_MAX = WEBSITE_GOALS_MAX;
/** Preferred URL max length */
const PREFERRED_URL_MAX_LENGTH = 100;
const LOCATION_MAX_LENGTH = 200;
const TAG_MAX_LENGTH = 60;
const TAGS_MAX_COUNT = 20;

const INDUSTRY_VALUES = new Set<string>(INDUSTRY_OPTIONS.map((o) => o.value));
const GOAL_VALUES = new Set<string>(WEBSITE_GOALS.map((g) => g.value));
const CATEGORY_VALUES = new Set<string>(REQUEST_CATEGORIES.map((c) => c.value));

function isAllowedNameChars(value: string): boolean {
  return /^[\p{L}\p{N}\s\-'.&,/()]*$/u.test(value);
}

function hasMinLetters(value: string, min: number = 2): boolean {
  const letters = value.match(/[a-zA-Z]/g);
  return (letters?.length ?? 0) >= min;
}

function validateName(
  value: string,
  fieldLabel: string
): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return `${fieldLabel} is required`;
  }
  if (hasDisallowedControlChars(value)) {
    return `${fieldLabel} contains unsupported characters`;
  }
  if (trimmed.length < NAME_MIN_LENGTH) {
    return `${fieldLabel} must be at least ${NAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `${fieldLabel} must be at most ${NAME_MAX_LENGTH} characters`;
  }
  if (/^\d+$/.test(trimmed)) {
    return `${fieldLabel} cannot be only numbers`;
  }
  if (!hasMinLetters(trimmed)) {
    return `${fieldLabel} must contain at least two letters`;
  }
  if (!isAllowedNameChars(trimmed)) {
    return `${fieldLabel} can only contain letters, numbers, spaces, hyphens, apostrophes, and periods`;
  }
  return undefined;
}

function validateColorCustomization(colors: ColorCustomization): string | undefined {
  const keys: (keyof ColorCustomization)[] = [
    'primary',
    'secondary',
    'accent',
    'background',
    'text'
  ];
  for (const k of keys) {
    const v = colors[k]?.trim() ?? '';
    if (v.length === 0) {
      return 'Please set all colors in your color scheme';
    }
  }
  return undefined;
}

function validateLogoBranding(
  data: TemplateRequestFormData,
  newLogoFileCount: number
): string | undefined {
  if (newLogoFileCount === 0 && data.logoAssets.length === 0) {
    return 'Upload at least one logo image';
  }
  return undefined;
}

function validateBrandBranding(
  data: TemplateRequestFormData,
  newBrandFileCount: number
): string | undefined {
  if (newBrandFileCount === 0 && data.brandAssets.length === 0) {
    return 'Upload at least one branding image or file';
  }
  return undefined;
}

function validatePreferredUrl(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return 'Preferred URL is required';
  }
  if (hasDisallowedControlChars(value)) {
    return 'URL contains unsupported characters';
  }
  if (trimmed.length > PREFERRED_URL_MAX_LENGTH) {
    return `Preferred URL must be at most ${PREFERRED_URL_MAX_LENGTH} characters`;
  }
  if (/\s/.test(trimmed)) {
    return 'URL cannot contain spaces';
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\-._~]*$/.test(trimmed)) {
    return 'URL can only contain letters, numbers, and hyphens';
  }
  return undefined;
}

function validateLocation(data: TemplateRequestFormData): string | undefined {
  const trimmed = normalizeSingleLineInput(data.location.displayName ?? '');
  if (trimmed.length === 0) {
    return 'Location is required';
  }
  if (hasDisallowedControlChars(data.location.displayName ?? '')) {
    return 'Location contains unsupported characters';
  }
  if (trimmed.length > LOCATION_MAX_LENGTH) {
    return `Location must be at most ${LOCATION_MAX_LENGTH} characters`;
  }
  if (!data.location.verified) {
    return 'Select a location from the suggestions to verify your address';
  }
  return undefined;
}

function validateIndustry(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return 'Please select your industry';
  }
  if (!INDUSTRY_VALUES.has(trimmed)) {
    return 'Please select a valid industry';
  }
  return undefined;
}

function validateCustomIndustry(data: TemplateRequestFormData): string | undefined {
  if (data.industry !== 'other') {
    return undefined;
  }
  const trimmed = normalizeSingleLineInput(data.customIndustry);
  if (trimmed.length === 0) {
    return 'Please describe your industry';
  }
  if (hasDisallowedControlChars(data.customIndustry)) {
    return 'Industry description contains unsupported characters';
  }
  if (trimmed.length < 3) {
    return 'Industry description must be at least 3 characters';
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `Industry description must be at most ${NAME_MAX_LENGTH} characters`;
  }
  if (/^\d+$/.test(trimmed)) {
    return 'Industry description cannot be only numbers';
  }
  if (!hasMinLetters(trimmed)) {
    return 'Industry description must contain at least two letters';
  }
  if (NONSENSE_INDUSTRY_VALUES.has(trimmed.toLowerCase())) {
    return 'Please provide a meaningful industry description';
  }
  return undefined;
}

function validateGoals(goals: string[]): string | undefined {
  if (!goals || goals.length === 0) {
    return 'Please select at least one website goal';
  }
  if (goals.length > GOALS_MAX) {
    return `Please select at most ${GOALS_MAX} goals`;
  }
  const invalid = goals.some((g) => !GOAL_VALUES.has(g));
  if (invalid) {
    return 'Please select only from the listed goals';
  }
  return undefined;
}

function validateAudienceTags(tags: string[]): string | undefined {
  if (!tags || tags.length === 0) {
    return undefined;
  }
  if (tags.length > TAGS_MAX_COUNT) {
    return `Please add at most ${TAGS_MAX_COUNT} audience tags`;
  }
  const normalized = normalizeTags(tags);
  const hasEmpty = tags.some((t) => normalizeSingleLineInput(t).length === 0);
  if (hasEmpty) {
    return 'Audience tags cannot be empty';
  }
  if (normalized.length !== tags.length) {
    return 'Audience tags must be unique';
  }
  if (tags.some((tag) => hasDisallowedControlChars(tag))) {
    return 'Audience tags contain unsupported characters';
  }
  if (normalized.some((tag) => tag.length > TAG_MAX_LENGTH)) {
    return `Audience tags must be at most ${TAG_MAX_LENGTH} characters`;
  }
  return undefined;
}

function validateLongText(
  value: string,
  maxLength: number,
  fieldLabel: string
): string | undefined {
  const trimmed = normalizeMultilineInput(value);
  if (trimmed.length === 0) {
    return undefined;
  }
  if (hasDisallowedControlChars(value, true)) {
    return `${fieldLabel} contains unsupported characters`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldLabel} must be at most ${maxLength} characters`;
  }
  return undefined;
}

function validateRequestCategories(values: string[]): string | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }
  if (values.length > REQUEST_CATEGORIES_MAX) {
    return `Please select at most ${REQUEST_CATEGORIES_MAX} priorities`;
  }
  const invalid = values.some((v) => !CATEGORY_VALUES.has(v));
  if (invalid) {
    return 'Please select only from the listed categories';
  }
  return undefined;
}

export interface TemplateRequestValidationBrandingContext {
  newLogoFileCount: number;
  newBrandFileCount: number;
}

/** Document order for validating and scrolling to the first invalid field on submit. */
export const TEMPLATE_REQUEST_VALIDATION_FIELD_ORDER: readonly TemplateRequestValidatableField[] = [
  'colorCustomization',
  'logoBranding',
  'brandBranding',
  'businessName',
  'preferredUrl',
  'location',
  'industry',
  'customIndustry',
  'goals',
  'audienceTags',
  'additionalNotes',
  'requestCategories'
];

export interface UseTemplateRequestValidationReturn {
  errors: Ref<TemplateRequestValidationErrors>;
  validateField: (field: TemplateRequestValidatableField) => string | undefined;
  validateAll: (branding?: TemplateRequestValidationBrandingContext) => boolean;
  clearFieldError: (field: TemplateRequestValidatableField) => void;
}

export function runTemplateRequestValidator(
  field: TemplateRequestValidatableField,
  data: TemplateRequestFormData,
  branding: TemplateRequestValidationBrandingContext
): string | undefined {
  switch (field) {
    case 'colorCustomization':
      return validateColorCustomization(data.colorCustomization);
    case 'logoBranding':
      return validateLogoBranding(data, branding.newLogoFileCount);
    case 'brandBranding':
      return validateBrandBranding(data, branding.newBrandFileCount);
    case 'businessName':
      return validateName(data.businessName, 'Business name');
    case 'preferredUrl':
      return validatePreferredUrl(data.preferredUrl);
    case 'location':
      return validateLocation(data);
    case 'industry':
      return validateIndustry(data.industry);
    case 'customIndustry':
      return validateCustomIndustry(data);
    case 'goals':
      return validateGoals(data.goals);
    case 'audienceTags':
      return validateAudienceTags(data.audienceTags);
    case 'additionalNotes':
      return validateLongText(
        data.additionalNotes,
        LONG_TEXT_MAX_LENGTH,
        'Additional notes'
      );
    case 'requestCategories':
      return validateRequestCategories(data.requestCategories);
    default: {
      const _: never = field;
      return undefined;
    }
  }
}

/**
 * Pure validation snapshot: same rules as validateAll on the composable, without mutating reactive state.
 */
export function getTemplateRequestValidationErrors(
  data: TemplateRequestFormData,
  branding: TemplateRequestValidationBrandingContext
): TemplateRequestValidationErrors {
  const newErrors: TemplateRequestValidationErrors = {};
  for (const field of TEMPLATE_REQUEST_VALIDATION_FIELD_ORDER) {
    const message = runTemplateRequestValidator(field, data, branding);
    if (message) {
      newErrors[field] = message;
    }
  }
  return newErrors;
}

export function isTemplateRequestFormValid(
  data: TemplateRequestFormData,
  branding: TemplateRequestValidationBrandingContext
): boolean {
  return Object.keys(getTemplateRequestValidationErrors(data, branding)).length === 0;
}

export function useTemplateRequestValidation(
  formData: Ref<TemplateRequestFormData>
): UseTemplateRequestValidationReturn {
  const errors = ref<TemplateRequestValidationErrors>({});

  function validateField(field: TemplateRequestValidatableField): string | undefined {
    const message = runTemplateRequestValidator(field, formData.value, {
      newLogoFileCount: 0,
      newBrandFileCount: 0
    });
    errors.value = {
      ...errors.value,
      [field]: message ?? undefined
    };
    return message;
  }

  function validateAll(branding?: TemplateRequestValidationBrandingContext): boolean {
    const data = formData.value;
    const ctx: TemplateRequestValidationBrandingContext = branding ?? {
      newLogoFileCount: 0,
      newBrandFileCount: 0
    };
    const newErrors = getTemplateRequestValidationErrors(data, ctx);

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function clearFieldError(field: TemplateRequestValidatableField): void {
    const { [field]: _, ...rest } = errors.value;
    errors.value = { ...rest };
  }

  return {
    errors,
    validateField,
    validateAll,
    clearFieldError
  };
}
