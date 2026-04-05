/**
 * Color Presets
 *
 * Curated color palettes for quick selection in the template request form.
 * Showcase templates that use a preset should keep colorScheme in sync with
 * `getPresetColorsById(presetId)` to avoid drift.
 */

import type { ColorCustomization, ColorPreset, ColorDefinition } from '~/types/templateRequest';

/**
 * Curated color presets for quick selection.
 * Each preset is designed for specific industries/moods.
 *
 * Contract (showcase `.show-btn--primary`): accent = CTA fill, primary = CTA label color —
 * they must contrast. Primary also drives hero gradients and section headings.
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
      accent: '#c9a227',
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
      accent: '#ea580c',
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
      secondary: '#4f46e5',
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

export type ColorPresetId = (typeof COLOR_PRESETS)[number]['id'];

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
 * Canonical lowercase #rrggbb or null if invalid.
 */
export function normalizeHexColor(hex: string): string | null {
  const t = hex.trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(t)) {
    return null;
  }
  return t.toLowerCase();
}

/**
 * Normalize a full color customization object; returns null if any channel is invalid.
 */
export function normalizeColorCustomization(
  colors: ColorCustomization
): ColorCustomization | null {
  const primary = normalizeHexColor(colors.primary);
  const secondary = normalizeHexColor(colors.secondary);
  const accent = normalizeHexColor(colors.accent);
  const background = normalizeHexColor(colors.background);
  const text = normalizeHexColor(colors.text);
  if (!primary || !secondary || !accent || !background || !text) {
    return null;
  }
  return { primary, secondary, accent, background, text };
}

/**
 * True if both customize objects match on all five channels after normalization.
 */
export function sameColorCustomization(a: ColorCustomization, b: ColorCustomization): boolean {
  const na = normalizeColorCustomization(a);
  const nb = normalizeColorCustomization(b);
  if (!na || !nb) {
    return false;
  }
  return (
    na.primary === nb.primary &&
    na.secondary === nb.secondary &&
    na.accent === nb.accent &&
    na.background === nb.background &&
    na.text === nb.text
  );
}

/**
 * Find a preset that matches the given colors (canonical hex equality).
 * Returns the preset ID if found, null otherwise.
 */
export function findMatchingPreset(colors: ColorCustomization): string | null {
  const normalized = normalizeColorCustomization(colors);
  if (!normalized) {
    return null;
  }
  for (const preset of COLOR_PRESETS) {
    const c = preset.colors;
    if (
      c.primary === normalized.primary &&
      c.secondary === normalized.secondary &&
      c.accent === normalized.accent &&
      c.background === normalized.background &&
      c.text === normalized.text
    ) {
      return preset.id;
    }
  }
  return null;
}

/**
 * Returns a copy of preset colors by id, or undefined if unknown.
 */
export function getPresetColorsById(id: string): ColorCustomization | undefined {
  const preset = COLOR_PRESETS.find((p) => p.id === id);
  return preset ? { ...preset.colors } : undefined;
}

/**
 * Validate hex color format.
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
