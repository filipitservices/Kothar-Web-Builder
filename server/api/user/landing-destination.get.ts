/**
 * Get Landing Destination API
 *
 * GET /api/user/landing-destination
 *
 * Returns the post-login landing path based on account state.
 * Requires authentication via session cookie.
 *
 * Logic: If user has at least one order (pending request) → /sites
 *        Else → /gallery
 *
 * Uses orders count from Firestore (users/{uid}/orders).
 * Sites are not yet Firestore-backed; when they are, extend to check sites count.
 */

import { getAdminAuth, getAdminApp, getSessionConfig } from '../../utils/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../../utils/logger';

export interface LandingDestinationResponse {
  destination: '/sites' | '/gallery';
}

export default defineEventHandler(async (event): Promise<LandingDestinationResponse | { error: string }> => {
  const sessionConfig = getSessionConfig();
  const sessionCookie = getCookie(event, sessionConfig.name);

  if (!sessionCookie) {
    return { error: 'unauthorized' };
  }

  try {
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    const db = getFirestore(getAdminApp());
    const ordersRef = db.collection('users').doc(uid).collection('orders');
    const snapshot = await ordersRef.count().get();
    const ordersCount = snapshot.data().count ?? 0;

    const destination: LandingDestinationResponse['destination'] =
      ordersCount > 0 ? '/sites' : '/gallery';

    return { destination };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('[Landing Destination] Failed:', errorMessage);
    return { error: 'failed' };
  }
});
