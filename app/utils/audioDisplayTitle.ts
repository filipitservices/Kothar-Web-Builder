/**
 * Extracts a clean display title from an audio filename.
 *
 * Strips bitrate/codec suffix patterns like `(128kbit_AAC)`, `(152kbit_Opus)`,
 * `(160kbit_Opus)`, then strips the file extension, and trims the result.
 *
 * Examples:
 *   "Chet Baker - Time After Time (128kbit_AAC).m4a" → "Chet Baker - Time After Time"
 *   "Bill Evans Blue in Green (152kbit_Opus).opus"   → "Bill Evans Blue in Green"
 */
export function extractDisplayTitle(filename: string): string {
  return filename
    .replace(/\s*\(\d+kbit_\w+\)\.[^.]+$/, '')
    .replace(/\.[^.]+$/, '')
    .trim();
}
