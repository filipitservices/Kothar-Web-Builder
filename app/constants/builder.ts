/**
 * Builder Constants
 * Static data for the builder interface
 */

import type { BlockItem, InfoField } from '~/types/builder';

export const AVAILABLE_BLOCKS: BlockItem[] = [
  { id: 'el-nav', type: 'navbar', label: 'Navigation' },
  { id: 'el-hero', type: 'hero', label: 'Hero Section' },
  { id: 'el-services', type: 'services', label: 'Services' },
  { id: 'el-features', type: 'features', label: 'Features (3-Col)' },
  { id: 'el-team', type: 'team', label: 'Team' },
  { id: 'el-process', type: 'process', label: 'Process / How It Works' },
  { id: 'el-testimonial', type: 'testimonial', label: 'Testimonial' },
  { id: 'el-logos', type: 'logos', label: 'Client Logos / Partners' },
  { id: 'el-credentials', type: 'credentials', label: 'Credentials / Awards' },
  { id: 'el-stats', type: 'stats', label: 'Stats Counter' },
  { id: 'el-pricing', type: 'pricing', label: 'Pricing' },
  { id: 'el-gallery', type: 'gallery', label: 'Gallery' },
  { id: 'el-location', type: 'location', label: 'Location & Hours' },
  { id: 'el-cta', type: 'cta', label: 'Call To Action' },
  { id: 'el-faq', type: 'faq', label: 'FAQ' },
  { id: 'el-form', type: 'form', label: 'Contact Form' },
  { id: 'el-text', type: 'text', label: 'Text Section' },
  { id: 'el-footer', type: 'footer', label: 'Footer' }
];

export const INFO_BAR_FIELDS: InfoField[] = [
  { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Enter company name' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email address' },
  { name: 'telephone', label: 'Telephone', type: 'tel', placeholder: 'Enter phone number' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Enter street address' },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Enter city' },
  { name: 'postalCode', label: 'Postal Code', type: 'text', placeholder: 'Enter postal code' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'Enter website URL' },
  { name: 'businessHours', label: 'Business Hours', type: 'select', placeholder: 'Select business hours' },
  { name: 'taxId', label: 'Tax ID', type: 'text', placeholder: 'Enter tax ID' }
];

export const CANVAS_DIMENSIONS = {
  desktop: { width: 650, height: 380 },
  mobile: { width: 306, height: 520 }
};

export const INITIAL_FIELD_ERRORS = {
  companyName: null,
  email: null,
  telephone: null,
  address: null,
  city: null,
  postalCode: null,
  website: null,
  businessHours: null,
  taxId: null
};

/**
 * Block icon mapping for UI visualization
 */
export const BLOCK_ICONS: Record<string, string> = {
  navbar: '📐',
  hero: '🎯',
  services: '🔧',
  features: '⭐',
  team: '👥',
  process: '🔄',
  stats: '📊',
  gallery: '🖼️',
  testimonial: '💬',
  pricing: '💰',
  faq: '❓',
  cta: '🎯',
  form: '📝',
  text: '📄',
  logos: '🏢',
  credentials: '🏆',
  location: '📍',
  footer: '©'
};
