/**
 * Local calendar date key (YYYY-MM-DD) for daily request limits.
 * Must stay aligned between draft creation and draft deletion counter logic.
 */

export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalDateKey(): string {
  return formatLocalDateKey(new Date());
}
