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

/**
 * Curated audience tag suggestions for the "Who we serve" tag input.
 * Users may type custom tags freely; these are guidance, not constraints.
 */
export const AUDIENCE_TAG_SUGGESTIONS = [
  'Homeowners',
  'Restaurant owners',
  'Local shop customers',
  'Small agencies',
  'Consultants',
  'Property managers',
  'Small business owners',
  'Contractors',
  'Parents / Families',
  'Students',
  'Seniors',
  'Pet owners',
  'Fitness enthusiasts',
  'Real estate agents',
  'Medical professionals',
  'Nonprofit organizations',
  'Corporate teams',
  'Freelancers'
] as const;

/**
 * Request category options for the Additional Requests section.
 * Practical types aligned with SMB website work.
 */
export const REQUEST_CATEGORIES = [
  { value: 'specific-page', label: 'Specific page or section' },
  { value: 'custom-feature', label: 'Custom feature or integration' },
  { value: 'contact-emphasis', label: 'Contact emphasis' },
  { value: 'social-proof', label: 'Social proof / testimonials' },
  { value: 'booking-support', label: 'Booking / scheduling support' },
  { value: 'services-detail', label: 'Services detail' },
  { value: 'portfolio-gallery', label: 'Portfolio / gallery' },
  { value: 'seo-optimization', label: 'SEO optimization' },
  { value: 'mobile-first', label: 'Mobile-first design' },
  { value: 'ecommerce-listing', label: 'E-commerce / product listing' },
  { value: 'blog-content', label: 'Blog / content section' },
  { value: 'faq-section', label: 'FAQ section' }
] as const;

/** Type for request category values */
export type RequestCategoryValue = typeof REQUEST_CATEGORIES[number]['value'];

/**
 * Blocklist for "Other" custom industry validation.
 * Lowercase entries; comparison should be case-insensitive and trimmed.
 */
export const NONSENSE_INDUSTRY_VALUES = new Set([
  'other',
  'n/a',
  'na',
  'none',
  'nothing',
  'idk',
  'test',
  'asdf',
  'xxx',
  '---',
  '...',
  'abc',
  'aaa',
  'unknown',
  'stuff',
  'things',
  'business',
  'company'
]);
