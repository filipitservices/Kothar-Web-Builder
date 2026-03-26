/**
 * Resolve Firebase uid from Whop-linked fields on entitlement docs (Admin only).
 * Used when webhooks omit checkout metadata (e.g. membership.deactivated).
 */

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { logger } from './logger';
import { ACCESS_COLLECTION } from '~/constants/access';

function firebaseUidFromBillingDocPath(path: string): string | null {
  const parts = path.split('/');
  if (parts.length >= 2 && parts[0] === 'users') {
    const uid = parts[1];
    return typeof uid === 'string' && uid.length > 0 ? uid : null;
  }
  return null;
}

/**
 * Collection-group query on `access` billing docs. Requires deployed indexes (see firebase/firestore.indexes.json).
 */
export async function findFirebaseUidByAccessBillingField(
  field: 'whopMembershipId' | 'whopUserId',
  value: string
): Promise<string | null> {
  if (!value) {
    return null;
  }
  const db = getFirestore(getAdminApp());
  try {
    const q = await db.collectionGroup(ACCESS_COLLECTION).where(field, '==', value).limit(5).get();
    const uids = new Set<string>();
    for (const d of q.docs) {
      const uid = firebaseUidFromBillingDocPath(d.ref.path);
      if (uid) {
        uids.add(uid);
      }
    }
    if (uids.size === 1) {
      const only = [...uids][0];
      return typeof only === 'string' ? only : null;
    }
    if (uids.size > 1) {
      logger.warn('[Access billing lookup] Ambiguous match for', field, value, 'uids:', uids.size);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('[Access billing lookup] collectionGroup query failed:', field, msg);
  }
  return null;
}
