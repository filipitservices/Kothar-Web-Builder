/**
 * Contact fields on orders satisfy Firestore rules; they are not collected in the template form.
 * Single source: Firebase Auth profile (display name / email local-part for contactName, email for email).
 */

import type { User } from 'firebase/auth';
import type { OrderContactInfo } from '~/types/order';

const CONTACT_NAME_MAX = 200;
const MIN_CONTACT_NAME_LEN = 2;

function contactNameFromUser(user: User | null): string {
  if (!user) {
    return 'Account holder';
  }
  const dn = user.displayName?.trim();
  if (dn && dn.length >= MIN_CONTACT_NAME_LEN) {
    return dn.slice(0, CONTACT_NAME_MAX);
  }
  const email = user.email?.trim();
  if (email) {
    const local = email.split('@')[0] ?? '';
    if (local.length >= MIN_CONTACT_NAME_LEN) {
      return local.slice(0, CONTACT_NAME_MAX);
    }
  }
  return 'Account holder';
}

/**
 * Builds `contactInfo` for Firestore writes. Requires a verified email on the user.
 */
export function buildContactInfoFromAuth(user: User | null): OrderContactInfo {
  const emailRaw = user?.email?.trim().toLowerCase() ?? '';
  if (
    emailRaw.length === 0 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)
  ) {
    throw new Error('A verified email is required to save your request.');
  }
  return {
    contactName: contactNameFromUser(user),
    email: emailRaw,
    phone: '',
    website: ''
  };
}
