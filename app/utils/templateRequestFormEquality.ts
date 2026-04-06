import type { ColorCustomization, TemplateRequestFormData } from '~/types/templateRequest';

function sortedStrings(values: readonly string[]): string[] {
  return [...values].map((s) => s.trim()).sort((a, b) => a.localeCompare(b));
}

function colorsEqual(a: ColorCustomization, b: ColorCustomization): boolean {
  return (
    a.primary === b.primary &&
    a.secondary === b.secondary &&
    a.accent === b.accent &&
    a.background === b.background &&
    a.text === b.text
  );
}

function filesMetaEqual(a: readonly File[], b: readonly File[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a.at(i);
    const y = b.at(i);
    if (x === undefined || y === undefined) return false;
    if (
      x.name !== y.name ||
      x.size !== y.size ||
      x.lastModified !== y.lastModified
    ) {
      return false;
    }
  }
  return true;
}

function sortedArraysEqual(a: readonly string[], b: readonly string[]): boolean {
  const sa = sortedStrings(a);
  const sb = sortedStrings(b);
  if (sa.length !== sb.length) return false;
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

/**
 * Compare two form snapshots for unsaved detection.
 */
export function areTemplateRequestSnapshotsEqual(
  a: TemplateRequestFormData,
  b: TemplateRequestFormData
): boolean {
  // Business info
  if (a.businessName.trim() !== b.businessName.trim()) return false;
  if (a.preferredUrl.trim() !== b.preferredUrl.trim()) return false;
  if (a.location.displayName.trim() !== b.location.displayName.trim()) return false;
  if (a.location.verified !== b.location.verified) return false;
  if (a.industry.trim() !== b.industry.trim()) return false;
  if (a.customIndustry.trim() !== b.customIndustry.trim()) return false;

  // Contact
  if (a.contactName.trim() !== b.contactName.trim()) return false;
  if (a.email.trim() !== b.email.trim()) return false;
  if (a.phone.trim() !== b.phone.trim()) return false;
  if (a.website.trim() !== b.website.trim()) return false;

  // Goals
  if (!sortedArraysEqual(a.goals, b.goals)) return false;

  // Audience tags
  if (!sortedArraysEqual(a.audienceTags, b.audienceTags)) return false;

  // Brand assets
  if (!sortedArraysEqual(a.brandAssets, b.brandAssets)) return false;

  // Logo assets
  if (!sortedArraysEqual(a.logoAssets, b.logoAssets)) return false;

  // Files
  if (!filesMetaEqual(a.files, b.files)) return false;
  if (!filesMetaEqual(a.logoFiles, b.logoFiles)) return false;

  // Additional requests
  if (a.additionalNotes.trim() !== b.additionalNotes.trim()) return false;
  if (!sortedArraysEqual(a.requestCategories, b.requestCategories)) return false;

  return colorsEqual(a.colorCustomization, b.colorCustomization);
}
