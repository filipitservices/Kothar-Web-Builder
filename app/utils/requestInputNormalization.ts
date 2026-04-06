import type { LocationData, TemplateRequestFormData } from '~/types/templateRequest';

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

function appendOptionalLocationString(
  out: LocationData,
  key: 'city' | 'state' | 'country' | 'postcode',
  raw: string | undefined
): void {
  if (raw === undefined) return;
  const v = normalizeSingleLineInput(raw);
  if (v.length === 0) return;
  out[key] = v;
}

/**
 * Returns a Firestore-safe `LocationData`: required `displayName` and `verified` only;
 * optional string and coordinate keys are present only when they have valid values.
 * Never adds own properties with value `undefined` (Firestore rejects undefined).
 */
export function normalizeLocationData(input: LocationData): LocationData {
  const out: LocationData = {
    displayName: normalizeSingleLineInput(input.displayName),
    verified: input.verified,
  };
  appendOptionalLocationString(out, 'city', input.city);
  appendOptionalLocationString(out, 'state', input.state);
  appendOptionalLocationString(out, 'country', input.country);
  appendOptionalLocationString(out, 'postcode', input.postcode);
  if (typeof input.lat === 'number' && Number.isFinite(input.lat)) {
    out.lat = input.lat;
  }
  if (typeof input.lon === 'number' && Number.isFinite(input.lon)) {
    out.lon = input.lon;
  }
  return out;
}

export function normalizeTemplateRequestFormData(
  data: TemplateRequestFormData
): TemplateRequestFormData {
  return {
    ...data,
    businessName: normalizeSingleLineInput(data.businessName),
    preferredUrl: normalizeSingleLineInput(data.preferredUrl),
    location: normalizeLocationData(data.location),
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
