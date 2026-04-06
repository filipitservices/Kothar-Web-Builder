import type { ColorCustomization } from '~/types/templateRequest';

/**
 * CSS custom properties for the subtle selected-surface gradient wash
 * (shared by color preset cards and form selectable options).
 * Low contrast; pairs with global rules in `components.css`.
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
