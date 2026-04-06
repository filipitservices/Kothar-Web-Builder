import type { TemplateRequestFormData } from '~/types/templateRequest';

const ASCII_CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function normalizeUnicode(value: string): string {
  return value.normalize('NFKC');
}

export function normalizeSingleLineInput(value: string): string {
  const normalized = normalizeUnicode(value);
  return normalized.replace(ASCII_CONTROL_CHAR_PATTERN, '').trim();
}

export function normalizeMultilineInput(value: string): string {
  const normalized = normalizeUnicode(value).replace(/\r\n?/g, '\n');
  return normalized.replace(ASCII_CONTROL_CHAR_PATTERN, '').trim();
}

export function hasDisallowedControlChars(value: string, allowNewlines: boolean = false): boolean {
  if (ASCII_CONTROL_CHAR_PATTERN.test(value)) {
    ASCII_CONTROL_CHAR_PATTERN.lastIndex = 0;
    return true;
  }
  ASCII_CONTROL_CHAR_PATTERN.lastIndex = 0;
  if (allowNewlines) {
    return false;
  }
  return /[\n\r\t]/.test(value);
}

export function normalizeTags(tags: string[]): string[] {
  const normalized = tags
    .map((tag) => normalizeSingleLineInput(tag))
    .filter((tag) => tag.length > 0);
  return [...new Set(normalized)];
}

export function normalizeTemplateRequestFormData(
  data: TemplateRequestFormData
): TemplateRequestFormData {
  return {
    ...data,
    businessName: normalizeSingleLineInput(data.businessName),
    preferredUrl: normalizeSingleLineInput(data.preferredUrl),
    location: {
      ...data.location,
      displayName: normalizeSingleLineInput(data.location.displayName),
      city: data.location.city ? normalizeSingleLineInput(data.location.city) : undefined,
      state: data.location.state ? normalizeSingleLineInput(data.location.state) : undefined,
      country: data.location.country ? normalizeSingleLineInput(data.location.country) : undefined,
      postcode: data.location.postcode ? normalizeSingleLineInput(data.location.postcode) : undefined,
    },
    industry: normalizeSingleLineInput(data.industry),
    customIndustry: normalizeSingleLineInput(data.customIndustry),
    contactName: normalizeSingleLineInput(data.contactName),
    email: normalizeSingleLineInput(data.email).toLowerCase(),
    phone: normalizeSingleLineInput(data.phone),
    website: normalizeSingleLineInput(data.website),
    goals: [...data.goals],
    audienceTags: normalizeTags(data.audienceTags),
    additionalNotes: normalizeMultilineInput(data.additionalNotes),
    requestCategories: [...data.requestCategories],
  };
}
