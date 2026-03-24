/**
 * Whop-linked access snapshot at users/{uid}/access/billing (server-written).
 * Client may read; writes are denied in Firestore rules.
 */
export interface AccessBillingSnapshot {
  hasAccess: boolean;
  /** Whop membership id when active */
  whopMembershipId?: string;
  /** Whop user id for support / reconciliation */
  whopUserId?: string;
  /** ISO timestamp string when membership expires or period ends, if known */
  validUntil?: string | null;
  /** Last update source */
  source?: 'webhook' | 'reconcile';
  updatedAt?: unknown;
}

export interface AccessMeResponse {
  /** Entitlement for gated actions (submit / update submitted order). */
  hasAccess: boolean;
  /** True when no billing doc exists yet. */
  pending: boolean;
}

export interface CheckoutSessionResponse {
  /** Absolute URL to open Whop checkout. */
  url: string;
}
