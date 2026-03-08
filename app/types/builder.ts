/**
 * Builder Page Types
 * Centralized type definitions for the builder interface
 */

export type BlockType = 'hero' | 'navbar' | 'footer' | 'cta' | 'features' | 'services' | 'team' | 'process' | 'testimonial' | 'logos' | 'credentials' | 'location' | 'faq' | 'pricing' | 'form' | 'stats' | 'gallery' | 'text';

export interface BlockItem {
  id: string;
  type: BlockType;
  label: string;
}

export type FieldErrorKey = 'companyName' | 'email' | 'telephone' | 'address' | 'city' | 'postalCode' | 'website' | 'businessHours' | 'taxId';

export interface InfoField {
  name: FieldErrorKey;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'select';
  placeholder: string;
}

/** Drawing tool state; used by builder and DrawingOverlay. */
export interface DrawingState {
  desktopEnabled?: boolean;
  mobileEnabled?: boolean;
  strokeType?: 'dash' | 'line' | 'circle' | 'square' | 'triangle' | 'half_triangle';
  color?: string;
  lineWidth?: number;
  isTextMode?: boolean;
  textFontSize?: number;
  textColor?: string;
  textFontFamily?: string;
}

export type ScreenId = 'desktop' | 'mobile' | 'both';

/** Block definition within a template (structure only, no content). */
export interface TemplateBlock {
  type: BlockType;
  label: string;
}
