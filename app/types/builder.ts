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
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  strokeType: 'dash' | 'line' | 'circle' | 'square' | 'triangle' | 'half_triangle';
  color: string;
  lineWidth: number;
  isTextMode: boolean;
  textFontSize: number;
  textColor: string;
  textEmphasis: 'normal' | 'bold' | 'italic';
}

export type ScreenId = 'desktop' | 'mobile' | 'both';

/**
 * Minimal shape for ScreenCard ref when forwarding drawing canvas to parent.
 * Used to type ref access without reaching into component internals with untyped casts.
 */
export interface ScreenCardRefShape {
  overlayRef?: {
    canvas?: unknown;
    getTextBoxes?: () => unknown[];
  } | null;
}
