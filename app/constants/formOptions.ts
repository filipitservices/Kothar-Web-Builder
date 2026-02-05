/**
 * Form Options Constants
 *
 * Static option data for the template request form.
 * Centralized here to keep components lean.
 */

/**
 * Industry options for the business type dropdown
 */
export const INDUSTRY_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'construction', label: 'Construction / Contracting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'accounting', label: 'Accounting / Tax' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'medical', label: 'Medical / Dental' },
  { value: 'therapy', label: 'Therapy / Wellness' },
  { value: 'restaurant', label: 'Restaurant / Food' },
  { value: 'retail', label: 'Retail' },
  { value: 'photography', label: 'Photography' },
  { value: 'agency', label: 'Marketing / Design Agency' },
  { value: 'other', label: 'Other' }
] as const;

/**
 * Website goal options for the checkbox selection
 */
export const WEBSITE_GOALS = [
  { value: 'generate-leads', label: 'Generate leads & inquiries' },
  { value: 'showcase-services', label: 'Showcase services & portfolio' },
  { value: 'build-credibility', label: 'Build credibility & trust' },
  { value: 'local-seo', label: 'Improve local SEO / visibility' },
  { value: 'booking', label: 'Allow online booking / scheduling' },
  { value: 'ecommerce', label: 'Sell products online' }
] as const;

/**
 * Brand asset options for the checkbox selection
 */
export const BRAND_ASSETS = [
  { value: 'logo', label: 'Logo' },
  { value: 'colors', label: 'Brand colors' },
  { value: 'photos', label: 'Professional photos' },
  { value: 'copy', label: 'Written content / copy' },
  { value: 'none', label: 'I need help with all of this' }
] as const;

/**
 * Type for industry option values
 */
export type IndustryValue = typeof INDUSTRY_OPTIONS[number]['value'];

/**
 * Type for website goal values
 */
export type WebsiteGoalValue = typeof WEBSITE_GOALS[number]['value'];

/**
 * Type for brand asset values
 */
export type BrandAssetValue = typeof BRAND_ASSETS[number]['value'];
