/**
 * GET /api/access/me
 *
 * Returns Whop entitlement snapshot for the current Firebase session user.
 * Reads users/{uid}/access/billing via Admin SDK (same trust model as issue reports).
 * When Whop API credentials are set, always reconciles with checkAccess (no stale true).
 */

import { getFirestore } from 'firebase-admin/firestore';
import { assertMethod, setResponseHeader } from 'h3';
import { getAdminApp, getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { upsertAccessBilling } from '../../utils/access-billing';
import { isWhopAccessSyncRuntimeConfigured } from '../../utils/whop-assert-access';
import { syncBillingAccessFromWhop } from '../../utils/whop-access-reconcile';
import { logger } from '../../utils/logger';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';
import type { AccessMeResponse } from '~/types/access';
import { appendPaidMembershipActive } from '../../utils/access-me-paid-membership';

type BillingExisting = {
  whopUserId?: string | null;
  whopMembershipId?: string | null;
};

async function persistBillingRevocation(
  uid: string,
  existing: BillingExisting | null
): Promise<void> {
  await upsertAccessBilling(uid, {
    hasAccess: false,
    whopMembershipId:
      typeof existing?.whopMembershipId === 'string' ? existing.whopMembershipId : undefined,
    whopUserId: typeof existing?.whopUserId === 'string' ? existing.whopUserId : undefined,
    source: 'reconcile',
  });
}

async function respondAccessMe(
  uid: string,
  existing: BillingExisting | null,
  base: Omit<AccessMeResponse, 'paidMembershipActive'>
): Promise<AccessMeResponse> {
  return appendPaidMembershipActive(uid, existing, base);
}

export default defineEventHandler(async (event): Promise<AccessMeResponse> => {
  assertMethod(event, 'GET');

  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate');
  setResponseHeader(event, 'Pragma', 'no-cache');

  const sessionConfig = getSessionConfig();
  const sessionCookie = getCookie(event, sessionConfig.name);
  if (!sessionCookie) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  let uid: string;
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Session invalid';
    logger.warn('[Access] Session verification failed:', msg);
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  const db = getFirestore(getAdminApp());
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(ACCESS_COLLECTION)
    .doc(ACCESS_BILLING_DOC_ID)
    .get();

  const existing: BillingExisting | null =
    snap.exists
      ? (() => {
          const data = snap.data();
          return {
            whopUserId: typeof data?.whopUserId === 'string' ? data.whopUserId : undefined,
            whopMembershipId:
              typeof data?.whopMembershipId === 'string' ? data.whopMembershipId : undefined,
          };
        })()
      : null;

  if (isWhopAccessSyncRuntimeConfigured()) {
    const outcome = await syncBillingAccessFromWhop(uid, existing);
    if (outcome === 'granted') {
      return respondAccessMe(uid, existing, { hasAccess: true, pending: false });
    }
    if (outcome === 'denied') {
      return respondAccessMe(uid, existing, { hasAccess: false, pending: false });
    }

    // Cannot map Firebase user → any Whop user id: revoke stale positives so rules match API (fail closed).
    if (
      outcome === 'inconclusive_no_candidates' &&
      snap.exists &&
      snap.data()?.hasAccess === true
    ) {
      await persistBillingRevocation(uid, existing);
      return respondAccessMe(uid, existing, { hasAccess: false, pending: false });
    }

    // Live check could not produce grant/deny (errors, unknown payloads, unresolvable product id): do not
    // leave Firestore hasAccess true or rules still allow draft→submitted while API says no access.
    if (
      outcome === 'inconclusive_api_errors' &&
      snap.exists &&
      snap.data()?.hasAccess === true
    ) {
      await persistBillingRevocation(uid, existing);
      return respondAccessMe(uid, existing, { hasAccess: false, pending: false });
    }

    // API errors / unrecognized payloads: do not trust a cached positive without a live check
    if (!snap.exists) {
      return respondAccessMe(uid, existing, { hasAccess: false, pending: true });
    }
    const data = snap.data();
    if (data?.hasAccess === true) {
      return respondAccessMe(uid, existing, { hasAccess: false, pending: true });
    }
    return respondAccessMe(uid, existing, { hasAccess: false, pending: false });
  }

  // Webhook-only: no Whop API — Firestore snapshot is the only server-side source
  if (snap.exists) {
    const data = snap.data();
    if (data?.hasAccess === true) {
      return respondAccessMe(uid, existing, { hasAccess: true, pending: false });
    }
  }

  if (!snap.exists) {
    return respondAccessMe(uid, existing, { hasAccess: false, pending: true });
  }

  return respondAccessMe(uid, existing, { hasAccess: false, pending: false });
});
