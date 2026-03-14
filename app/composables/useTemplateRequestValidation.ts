/** Centralized validation for the template request form; does not mutate form data. */
import { ref, type Ref } from 'vue';
import type {
  TemplateRequestFormData,
  TemplateRequestValidatableField,
  TemplateRequestValidationErrors
} from '~/types/templateRequest';
import { INDUSTRY_OPTIONS, WEBSITE_GOALS } from '~/constants/formOptions';

/** Minimum length for name-like fields */
const NAME_MIN_LENGTH = 2;
/** Maximum length for name-like fields */
const NAME_MAX_LENGTH = 200;
/** Maximum length for long text (description, notes, audience) */
const LONG_TEXT_MAX_LENGTH = 2000;
/** Years in business: min/max (business-appropriate range) */
const YEARS_MIN = 0;
const YEARS_MAX = 200;
/** Phone: min/max digit count after normalizing */
const PHONE_DIGITS_MIN = 10;
const PHONE_DIGITS_MAX = 15;
/** Email max length (RFC 5321) */
const EMAIL_MAX_LENGTH = 254;

const INDUSTRY_VALUES = new Set<string>(INDUSTRY_OPTIONS.map((o) => o.value));
const GOAL_VALUES = new Set<string>(WEBSITE_GOALS.map((g) => g.value));

/**
 * Allowed characters for business/contact names: letters, digits, space, hyphen, apostrophe, period.
 * Reject strings that contain any other character to avoid nonsense or excessive special chars.
 */
function isAllowedNameChars(value: string): boolean {
  return /^[a-zA-Z0-9\s\-'.]*$/.test(value);
}

/**
 * Must contain at least two alphabetic characters (so "12" or "---" is invalid).
 */
function hasMinLetters(value: string, min: number = 2): boolean {
  const letters = value.match(/[a-zA-Z]/g);
  return (letters?.length ?? 0) >= min;
}

/**
 * Trim and validate a name-like field (business name, contact name).
 * Rules: required, 2–200 chars after trim, not purely numeric, at least 2 letters, allowed chars only.
 */
function validateName(
  value: string,
  fieldLabel: string
): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return `${fieldLabel} is required`;
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

/**
 * Validate years in business: optional; if provided, must be a non-negative integer in [YEARS_MIN, YEARS_MAX].
 * No alphabetic characters; explicit parse, no silent coercion.
 */
function validateYearsInBusiness(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (!/^\d+$/.test(trimmed)) {
    return 'Years in business must be a whole number (no letters or symbols)';
  }
  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num) || num !== parseFloat(trimmed)) {
    return 'Years in business must be a whole number';
  }
  if (num < YEARS_MIN) {
    return `Years in business cannot be less than ${YEARS_MIN}`;
  }
  if (num > YEARS_MAX) {
    return `Years in business cannot exceed ${YEARS_MAX}`;
  }
  return undefined;
}

/**
 * Email format: local@domain.tld, non-empty, max length.
 * Simple pattern: at least one non-whitespace before @, then domain with at least one dot.
 */
function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Email is required';
  }
  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return 'Email is too long';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Please enter a valid email address';
  }
  return undefined;
}

/**
 * Phone: optional. If provided, must contain 10–15 digits (after stripping spaces, dashes, parens, plus).
 */
function validatePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
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

/**
 * Website: optional. If provided, must look like a URL (http(s) or domain with TLD).
 */
function validateWebsite(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const hasProtocol = /^https?:\/\/.+\..+/.test(trimmed);
  const looksLikeDomain = /^[a-zA-Z0-9][a-zA-Z0-9-.]*\.[a-zA-Z]{2,}/.test(trimmed);
  if (!hasProtocol && !looksLikeDomain) {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
  if (trimmed.length > 2048) {
    return 'URL is too long';
  }
  return undefined;
}

/**
 * Long text (description, notes, target audience): optional; if provided, max length.
 */
function validateLongText(
  value: string,
  maxLength: number,
  fieldLabel: string
): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > maxLength) {
    return `${fieldLabel} must be at most ${maxLength} characters`;
  }
  return undefined;
}

/**
 * Address: optional; if provided, reasonable max length.
 */
function validateAddress(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > 500) {
    return 'Address must be at most 500 characters';
  }
  return undefined;
}

/**
 * Industry: required, must be one of the predefined options.
 */
function validateIndustry(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Please select your industry';
  }
  if (!INDUSTRY_VALUES.has(trimmed)) {
    return 'Please select a valid industry';
  }
  return undefined;
}

/**
 * Goals: at least one required.
 */
function validateGoals(goals: string[]): string | undefined {
  if (!goals || goals.length === 0) {
    return 'Please select at least one website goal';
  }
  const invalid = goals.some((g) => !GOAL_VALUES.has(g));
  if (invalid) {
    return 'Please select only from the listed goals';
  }
  return undefined;
}

export interface UseTemplateRequestValidationReturn {
  errors: Ref<TemplateRequestValidationErrors>;
  validateField: (field: TemplateRequestValidatableField) => string | undefined;
  validateAll: () => boolean;
  clearFieldError: (field: TemplateRequestValidatableField) => void;
}

/**
 * Run the validator for a given field against current form data.
 */
function runValidator(
  field: TemplateRequestValidatableField,
  data: TemplateRequestFormData
): string | undefined {
  switch (field) {
    case 'businessName':
      return validateName(data.businessName, 'Business name');
    case 'contactName':
      return validateName(data.contactName, 'Contact name');
    case 'industry':
      return validateIndustry(data.industry);
    case 'yearsInBusiness':
      return validateYearsInBusiness(data.yearsInBusiness);
    case 'businessDescription':
      return validateLongText(
        data.businessDescription,
        LONG_TEXT_MAX_LENGTH,
        'Business description'
      );
    case 'email':
      return validateEmail(data.email);
    case 'phone':
      return validatePhone(data.phone);
    case 'website':
      return validateWebsite(data.website);
    case 'address':
      return validateAddress(data.address);
    case 'goals':
      return validateGoals(data.goals);
    case 'targetAudience':
      return validateLongText(
        data.targetAudience,
        LONG_TEXT_MAX_LENGTH,
        'Target audience'
      );
    case 'additionalNotes':
      return validateLongText(
        data.additionalNotes,
        LONG_TEXT_MAX_LENGTH,
        'Additional notes'
      );
    default: {
      const _: never = field;
      return undefined;
    }
  }
}

/**
 * Template request form validation composable.
 * Centralizes all validation logic; does not mutate form data.
 */
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
      'industry',
      'yearsInBusiness',
      'businessDescription',
      'contactName',
      'email',
      'phone',
      'website',
      'address',
      'goals',
      'targetAudience',
      'additionalNotes'
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
