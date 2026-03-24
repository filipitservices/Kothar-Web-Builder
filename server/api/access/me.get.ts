/**
 * GET /api/access/me
 *
 * Returns Whop entitlement snapshot for the current Firebase session user.
 * Reads users/{uid}/access/billing via Admin SDK (same trust model as issue reports).
 */

import { getFirestore } from 'firebase-admin/firestore';
import { assertMethod } from 'h3';
import { getAdminApp, getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';
import type { AccessMeResponse } from '~/types/access';

export default defineEventHandler(async (event): Promise<AccessMeResponse> => {
  assertMethod(event, 'GET');

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

  if (!snap.exists) {
    return { hasAccess: false, pending: true };
  }

  const data = snap.data();
  const hasAccess = data?.hasAccess === true;

  return { hasAccess, pending: false };
});
