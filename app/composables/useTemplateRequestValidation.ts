/** Centralized validation for the template request form; does not mutate form data. */
import { ref, type Ref } from 'vue';
import type {
  TemplateRequestFormData,
  TemplateRequestValidatableField,
  TemplateRequestValidationErrors
} from '~/types/templateRequest';
import { INDUSTRY_OPTIONS, WEBSITE_GOALS, REQUEST_CATEGORIES, NONSENSE_INDUSTRY_VALUES } from '~/constants/formOptions';
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
/** Phone: min/max digit count after normalizing */
const PHONE_DIGITS_MIN = 10;
const PHONE_DIGITS_MAX = 15;
/** Email max length (RFC 5321) */
const EMAIL_MAX_LENGTH = 254;
/** Max goals selection */
const GOALS_MAX = 3;
/** Preferred URL max length */
const PREFERRED_URL_MAX_LENGTH = 100;
const WEBSITE_MAX_LENGTH = 2048;
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

function validatePreferredUrl(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return undefined;
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
    return undefined;
  }
  if (hasDisallowedControlChars(data.location.displayName ?? '')) {
    return 'Location contains unsupported characters';
  }
  if (trimmed.length > LOCATION_MAX_LENGTH) {
    return `Location must be at most ${LOCATION_MAX_LENGTH} characters`;
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value).toLowerCase();
  if (trimmed.length === 0) {
    return 'Email is required';
  }
  if (hasDisallowedControlChars(value)) {
    return 'Email contains unsupported characters';
  }
  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return 'Email is too long';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return undefined;
  }
  if (hasDisallowedControlChars(value)) {
    return 'Phone number contains unsupported characters';
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < PHONE_DIGITS_MIN) {
    return `Phone number must have at least ${PHONE_DIGITS_MIN} digits`;
  }
  if (digits.length > PHONE_DIGITS_MAX) {
    return `Phone number must have at most ${PHONE_DIGITS_MAX} digits`;
  }
  if (!/^[\d\s\-+()]+$/.test(trimmed)) {
    return 'Phone number can only contain digits, spaces, hyphens, plus, and parentheses';
  }
  return undefined;
}

function validateWebsite(value: string): string | undefined {
  const trimmed = normalizeSingleLineInput(value);
  if (trimmed.length === 0) {
    return undefined;
  }
  if (hasDisallowedControlChars(value)) {
    return 'Website URL contains unsupported characters';
  }
  const hasProtocol = /^https?:\/\/.+\..+/.test(trimmed);
  const looksLikeDomain = /^[a-zA-Z0-9][a-zA-Z0-9-.]*\.[a-zA-Z]{2,}/.test(trimmed);
  if (!hasProtocol && !looksLikeDomain) {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
  if (trimmed.length > WEBSITE_MAX_LENGTH) {
    return 'URL is too long';
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
  const invalid = values.some((v) => !CATEGORY_VALUES.has(v));
  if (invalid) {
    return 'Please select only from the listed categories';
  }
  return undefined;
}

export interface UseTemplateRequestValidationReturn {
  errors: Ref<TemplateRequestValidationErrors>;
  validateField: (field: TemplateRequestValidatableField) => string | undefined;
  validateAll: () => boolean;
  clearFieldError: (field: TemplateRequestValidatableField) => void;
}

function runValidator(
  field: TemplateRequestValidatableField,
  data: TemplateRequestFormData
): string | undefined {
  switch (field) {
    case 'businessName':
      return validateName(data.businessName, 'Business name');
    case 'contactName':
      return validateName(data.contactName, 'Contact name');
    case 'preferredUrl':
      return validatePreferredUrl(data.preferredUrl);
    case 'location':
      return validateLocation(data);
    case 'industry':
      return validateIndustry(data.industry);
    case 'customIndustry':
      return validateCustomIndustry(data);
    case 'email':
      return validateEmail(data.email);
    case 'phone':
      return validatePhone(data.phone);
    case 'website':
      return validateWebsite(data.website);
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

export function useTemplateRequestValidation(
  formData: Ref<TemplateRequestFormData>
): UseTemplateRequestValidationReturn {
  const errors = ref<TemplateRequestValidationErrors>({});

  function validateField(field: TemplateRequestValidatableField): string | undefined {
    const message = runValidator(field, formData.value);
    errors.value = {
      ...errors.value,
      [field]: message ?? undefined
    };
    return message;
  }

  function validateAll(): boolean {
    const data = formData.value;
    const newErrors: TemplateRequestValidationErrors = {};

    const fields: TemplateRequestValidatableField[] = [
      'businessName',
      'preferredUrl',
      'location',
      'industry',
      'customIndustry',
      'contactName',
      'email',
      'phone',
      'website',
      'goals',
      'audienceTags',
      'additionalNotes',
      'requestCategories'
    ];

    for (const field of fields) {
      const message = runValidator(field, data);
      if (message) {
        newErrors[field] = message;
      }
    }

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
