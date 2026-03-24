import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from './firebase-admin';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';

export interface AccessBillingWritePayload {
  hasAccess: boolean;
  whopMembershipId?: string;
  whopUserId?: string;
  validUntil?: string | null;
  source: 'webhook' | 'reconcile';
}

/**
 * Upserts the server-owned entitlement doc at users/{uid}/access/billing.
 */
export async function upsertAccessBilling(
  firebaseUid: string,
  payload: AccessBillingWritePayload
): Promise<void> {
  const db = getFirestore(getAdminApp());
  const ref = db
    .collection('users')
    .doc(firebaseUid)
    .collection(ACCESS_COLLECTION)
    .doc(ACCESS_BILLING_DOC_ID);

  await ref.set(
    {
      hasAccess: payload.hasAccess,
      whopMembershipId: payload.whopMembershipId ?? null,
      whopUserId: payload.whopUserId ?? null,
      validUntil: payload.validUntil ?? null,
      source: payload.source,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
