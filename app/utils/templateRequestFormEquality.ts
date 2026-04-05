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

/**
 * Compare two form snapshots for unsaved detection (normalized goals / brand assets).
 */
export function areTemplateRequestSnapshotsEqual(
  a: TemplateRequestFormData,
  b: TemplateRequestFormData
): boolean {
  if (a.businessName.trim() !== b.businessName.trim()) return false;
  if (a.industry.trim() !== b.industry.trim()) return false;
  if (a.yearsInBusiness.trim() !== b.yearsInBusiness.trim()) return false;
  if (a.businessDescription.trim() !== b.businessDescription.trim()) return false;
  if (a.contactName.trim() !== b.contactName.trim()) return false;
  if (a.email.trim() !== b.email.trim()) return false;
  if (a.phone.trim() !== b.phone.trim()) return false;
  if (a.website.trim() !== b.website.trim()) return false;
  if (a.address.trim() !== b.address.trim()) return false;

  const goalsA = sortedStrings(a.goals);
  const goalsB = sortedStrings(b.goals);
  if (goalsA.length !== goalsB.length) return false;
  for (let i = 0; i < goalsA.length; i++) {
    if (goalsA[i] !== goalsB[i]) return false;
  }

  if (a.targetAudience.trim() !== b.targetAudience.trim()) return false;

  const assetsA = sortedStrings(a.brandAssets);
  const assetsB = sortedStrings(b.brandAssets);
  if (assetsA.length !== assetsB.length) return false;
  for (let i = 0; i < assetsA.length; i++) {
    if (assetsA[i] !== assetsB[i]) return false;
  }

  if (!filesMetaEqual(a.files, b.files)) return false;

  if (a.additionalNotes.trim() !== b.additionalNotes.trim()) return false;

  return colorsEqual(a.colorCustomization, b.colorCustomization);
}
