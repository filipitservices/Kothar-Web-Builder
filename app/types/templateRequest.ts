/**
 * Template Request Types
 * 
 * Type definitions for the template request form and color customization.
 * Used by TemplateRequestForm, ColorSchemePicker, and the request page.
 */

/**
 * Color scheme customization for templates.
 * Matches the ShowcaseTemplate.colorScheme structure.
 */
export interface ColorCustomization {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

/**
 * Color preset for quick selection.
 */
export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: ColorCustomization;
}

/**
 * Color definition for the picker UI.
 */
export interface ColorDefinition {
  key: keyof ColorCustomization;
  label: string;
}

/**
 * Structured location data, optionally verified via Photon geocoding.
 */
export interface LocationData {
  /** User-visible location text (what was typed or selected). */
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  /** True when the location was confirmed by Photon; false for free-text entries. */
  verified: boolean;
}

/**
 * Form data for template requests.
 * Organized by section: Design Customization, Branding, Business Info,
 * Contact, Website Goals, Additional Requests.
 */
export interface TemplateRequestFormData {
  /* ── Design Customization ── */
  colorCustomization: ColorCustomization;

  /* ── Branding ── */
  /** Logo file names (parallel to logoFiles). */
  logoAssets: string[];
  /** Uploaded logo files (client-only; not persisted). */
  logoFiles: File[];
  /** Brand material file names (parallel to files). */
  brandAssets: string[];
  /** Uploaded brand material files (client-only; not persisted). */
  files: File[];

  /* ── Business Info ── */
  businessName: string;
  /** Desired URL / slug; availability checked asynchronously. */
  preferredUrl: string;
  /** Business location with optional Photon verification. */
  location: LocationData;
  industry: string;
  /** Required when industry is "other"; must be a meaningful description. */
  customIndustry: string;

  /* ── Contact ── */
  contactName: string;
  email: string;
  phone: string;
  website: string;

  /* ── Website Goals ── */
  goals: string[];
  /** Tag-based audience descriptors (free-entry + suggestions). */
  audienceTags: string[];

  /* ── Additional Requests ── */
  additionalNotes: string;
  /** Selectable request categories (e.g. "booking support", "social proof"). */
  requestCategories: string[];
}

/**
 * Industry options for the form dropdown.
 */
export interface IndustryOption {
  value: string;
  label: string;
}

/**
 * Color mode for the picker: presets or custom editing.
 */
export type ColorMode = 'presets' | 'custom';

/**
 * Form field keys that are validated by the template request validation layer.
 * Excludes colorCustomization, file arrays, and brandAssets/logoAssets (derived from files).
 */
export type TemplateRequestValidatableField =
  | 'businessName'
  | 'preferredUrl'
  | 'location'
  | 'industry'
  | 'customIndustry'
  | 'contactName'
  | 'email'
  | 'phone'
  | 'website'
  | 'goals'
  | 'audienceTags'
  | 'additionalNotes'
  | 'requestCategories';

/**
 * Validation errors keyed by validatable field.
 * One error message per field; undefined means no error.
 */
export type TemplateRequestValidationErrors = Partial<
  Record<TemplateRequestValidatableField, string>
>;
