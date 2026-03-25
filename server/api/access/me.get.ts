/**
 * GET /api/access/me
 *
 * Returns Whop entitlement snapshot for the current Firebase session user.
 * Reads users/{uid}/access/billing via Admin SDK (same trust model as issue reports).
 * When Firestore is missing or out of date, reconciles against Whop API in one place.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { assertMethod, setResponseHeader } from 'h3';
import { getAdminApp, getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { reconcileBillingAccess } from '../../utils/whop-access-reconcile';
import { logger } from '../../utils/logger';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';
import type { AccessMeResponse } from '~/types/access';

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

  let existing: { whopUserId?: string | null; whopMembershipId?: string | null } | null = null;

  if (snap.exists) {
    const data = snap.data();
    if (data?.hasAccess === true) {
      return { hasAccess: true, pending: false };
    }
    existing = {
      whopUserId: typeof data?.whopUserId === 'string' ? data.whopUserId : undefined,
      whopMembershipId: typeof data?.whopMembershipId === 'string' ? data.whopMembershipId : undefined,
    };
  }

  const reconciled = await reconcileBillingAccess(uid, existing);
  if (reconciled) {
    return { hasAccess: true, pending: false };
  }

  if (!snap.exists) {
    return { hasAccess: false, pending: true };
  }

  return { hasAccess: false, pending: false };
});
