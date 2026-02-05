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

export interface DrawingState {
  desktopEnabled?: boolean;
  mobileEnabled?: boolean;
  [key: string]: any;
}

export type ScreenId = 'desktop' | 'mobile' | 'both';
