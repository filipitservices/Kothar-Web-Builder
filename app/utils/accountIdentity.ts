/**
 * Single source of truth for how we display the signed-in account in UI
 * (navbar UserMenu, greetings, etc.).
 */

import type { AuthUser } from '~/types/auth';

function emailLocalPart(email: string | null | undefined): string {
  if (!email) return '';
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email.trim();
}

/**
 * Inline / dropdown header label: display name, else email local-part, else "User".
 */
export function getAccountDisplayLabel(user: AuthUser | null): string {
  if (!user) return 'User';
  const dn = user.displayName?.trim();
  if (dn) return dn;
  const local = emailLocalPart(user.email);
  if (local) return local;
  return 'User';
}

/**
 * Short greeting token: first word of display name, else email local-part, else empty.
 */
export function getAccountFirstName(user: AuthUser | null): string {
  if (!user) return '';
  const dn = user.displayName?.trim();
  if (dn) {
    const first = dn.split(/\s+/)[0];
    if (first) return first;
  }
  return emailLocalPart(user.email);
}
