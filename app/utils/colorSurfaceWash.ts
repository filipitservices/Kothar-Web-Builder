import type { ColorCustomization } from '~/types/templateRequest';

/**
 * CSS custom properties for the selected color **preset** card wash in
 * `ColorSchemePicker` only. Uses the preset’s own primary / accent / background.
 *
 * Other selectable cards (industry, goals, request categories) use layered
 * section-themed washes from `FormSection.vue` (`:deep(.form-option--selected)`),
 * not the user’s palette, so they stay visually distinct from the Color Scheme UI.
 */
export function selectionSurfaceCustomProperties(
  colors: ColorCustomization
): Record<string, string> {
  const { primary, accent, background } = colors;
  return {
    '--preset-surface-a': `color-mix(in srgb, ${primary} 10%, transparent)`,
    '--preset-surface-b': `color-mix(in srgb, ${accent} 8%, transparent)`,
    '--preset-surface-mid': `color-mix(in srgb, ${background} 40%, transparent)`
  };
}
