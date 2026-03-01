/**
 * Shared storage path and filename helpers.
 * Used by order submission and order update composables for Firebase Storage.
 */

/**
 * Sanitize a filename for use in Storage path: remove path separators and dangerous chars.
 * Collisions for same name are avoided by prefixing with index.
 */
export function sanitizeStorageFileName(originalName: string, index: number): string {
  const base = originalName.replace(/[/\\?*:|\x00-\x1f]/g, '').trim() || 'file';
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
  const nameWithoutExt = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;
  const safe = nameWithoutExt.replace(/\s+/g, '_').slice(0, 100);
  return `${index}_${safe}${ext}`;
}
