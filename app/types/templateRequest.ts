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
 * Form data for template requests.
 * Contains all business and contact information along with color customization.
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
  /** Uploaded brand asset files */
  files: File[];
  additionalNotes: string;
  colorCustomization: ColorCustomization;
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
