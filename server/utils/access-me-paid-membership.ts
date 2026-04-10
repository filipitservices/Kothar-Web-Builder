/**
 * Enriches GET /api/access/me with paidMembershipActive: true only when Whop membership
 * is in good standing (same rules as finalize-draft membership policy).
 */

import { getFirestore } from 'firebase-admin/firestore';
import {
  evaluateWhopProductAccess,
  isWhopAccessSyncRuntimeConfigured,
  resolveProductIdForAccessCheck,
} from './whop-assert-access';
import { getAdminApp } from './firebase-admin';
import { getWhopApiClient } from './whop-client';
import { membershipCancelPolicyBlocksSubmit } from './whop-membership-submit-policy';
import { logger } from './logger';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';
import type { AccessMeResponse } from '~/types/access';

export interface BillingExistingFields {
  whopUserId?: string | null;
  whopMembershipId?: string | null;
}

async function readBillingExisting(uid: string): Promise<BillingExistingFields | null> {
  const db = getFirestore(getAdminApp());
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(ACCESS_COLLECTION)
    .doc(ACCESS_BILLING_DOC_ID)
    .get();
  if (!snap.exists) return null;
  const data = snap.data();
  return {
    whopUserId: typeof data?.whopUserId === 'string' ? data.whopUserId : undefined,
    whopMembershipId: typeof data?.whopMembershipId === 'string' ? data.whopMembershipId : undefined,
  };
}

/**
 * Appends `paidMembershipActive` to the base access snapshot.
 * When live Whop membership APIs are unavailable, matches `hasAccess` for non-pending snapshots.
 * Re-reads billing so `whopMembershipId` is fresh after reconcile/sync.
 */
export async function appendPaidMembershipActive(
  uid: string,
  _existingHint: BillingExistingFields | null,
  base: Omit<AccessMeResponse, 'paidMembershipActive'>
): Promise<AccessMeResponse> {
  if (!base.hasAccess || base.pending) {
    return { ...base, paidMembershipActive: false };
  }

  if (!isWhopAccessSyncRuntimeConfigured()) {
    return { ...base, paidMembershipActive: true };
  }

  const runtimeConfig = useRuntimeConfig();
  const apiKey = runtimeConfig.whopApiKey;
  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return { ...base, paidMembershipActive: true };
  }

  try {
    const existing = await readBillingExisting(uid);
    const evalResult = await evaluateWhopProductAccess(uid, existing);
    if (evalResult.outcome !== 'granted') {
      return { ...base, paidMembershipActive: false };
    }

    const whopClient = getWhopApiClient(apiKey, runtimeConfig.whopAppId);
    const productId = await resolveProductIdForAccessCheck(
      whopClient,
      runtimeConfig.whopProductId,
      runtimeConfig.whopPlanId
    );
    if (!productId) {
      return { ...base, paidMembershipActive: true };
    }

    const membershipBlocked = await membershipCancelPolicyBlocksSubmit(whopClient, {
      companyId: runtimeConfig.whopCompanyId,
      productId,
      membershipId: existing?.whopMembershipId ?? null,
      whopUserId: evalResult.grant.whopUserId,
    });

    return { ...base, paidMembershipActive: !membershipBlocked };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('[Access] paidMembershipActive enrichment failed:', msg);
    return { ...base, paidMembershipActive: false };
  }
}
