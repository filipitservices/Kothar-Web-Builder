/**
 * Color Presets
 * 
 * Curated color palettes for quick selection in the template request form.
 * Derived from professional design systems and industry standards.
 */

import type { ColorPreset, ColorDefinition } from '~/types/templateRequest';

/**
 * Curated color presets for quick selection.
 * Each preset is designed for specific industries/moods.
 */
export const COLOR_PRESETS: readonly ColorPreset[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Trust & reliability',
    colors: {
      primary: '#1e40af',
      secondary: '#0d9488',
      accent: '#f59e0b',
      background: '#f8fafc',
      text: '#1e293b'
    }
  },
  {
    id: 'modern-teal',
    name: 'Modern Teal',
    description: 'Fresh & contemporary',
    colors: {
      primary: '#0f766e',
      secondary: '#1e40af',
      accent: '#eab308',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'elegant-navy',
    name: 'Elegant Navy',
    description: 'Sophisticated & premium',
    colors: {
      primary: '#1e3a5f',
      secondary: '#b8860b',
      accent: '#1e3a5f',
      background: '#fafafa',
      text: '#1f2937'
    }
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    description: 'Growth & prosperity',
    colors: {
      primary: '#166534',
      secondary: '#1e40af',
      accent: '#059669',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    description: 'Dynamic & innovative',
    colors: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#06b6d4',
      background: '#fafafa',
      text: '#1f2937'
    }
  },
  {
    id: 'warm-earthy',
    name: 'Warm Earthy',
    description: 'Natural & inviting',
    colors: {
      primary: '#92400e',
      secondary: '#166534',
      accent: '#dc2626',
      background: '#fffbeb',
      text: '#1c1917'
    }
  },
  {
    id: 'healthcare-calm',
    name: 'Healthcare Calm',
    description: 'Clean & caring',
    colors: {
      primary: '#0891b2',
      secondary: '#0d9488',
      accent: '#fbbf24',
      background: '#ffffff',
      text: '#1e293b'
    }
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Elegant simplicity',
    colors: {
      primary: '#171717',
      secondary: '#525252',
      accent: '#d4a574',
      background: '#ffffff',
      text: '#262626'
    }
  }
] as const;

/**
 * Color definitions for the custom picker UI.
 * Defines which colors are editable and their display labels.
 */
export const COLOR_DEFINITIONS: readonly ColorDefinition[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' }
] as const;

/**
 * Find a preset that matches the given colors.
 * Returns the preset ID if found, null otherwise.
 */
export function findMatchingPreset(colors: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}): string | null {
  for (const preset of COLOR_PRESETS) {
    if (
      preset.colors.primary === colors.primary &&
      preset.colors.secondary === colors.secondary &&
      preset.colors.accent === colors.accent &&
      preset.colors.background === colors.background &&
      preset.colors.text === colors.text
    ) {
      return preset.id;
    }
  }
  return null;
}

/**
 * Validate hex color format.
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
