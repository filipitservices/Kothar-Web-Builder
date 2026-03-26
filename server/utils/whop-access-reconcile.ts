/**
 * Align Firestore billing with Whop using evaluateWhopProductAccess + upserts.
 */

import { upsertAccessBilling } from './access-billing';
import { evaluateWhopProductAccess, type ExistingBillingFields } from './whop-assert-access';

/**
 * Result of a Whop API sync (Firestore updated on granted/denied; see inconclusive_*).
 */
export type BillingAccessSyncOutcome =
  | 'granted'
  | 'denied'
  | 'inconclusive_no_candidates'
  | 'inconclusive_api_errors';


/**
 * Aligns `users/{uid}/access/billing` with Whop `checkAccess` when API key + product/plan exist.
 */
export async function syncBillingAccessFromWhop(
  firebaseUid: string,
  existing: ExistingBillingFields | null
): Promise<BillingAccessSyncOutcome> {
  const result = await evaluateWhopProductAccess(firebaseUid, existing);

  if (result.outcome === 'granted') {
    await upsertAccessBilling(firebaseUid, {
      hasAccess: true,
      whopMembershipId: result.grant.membershipId,
      whopUserId: result.grant.whopUserId,
      source: 'reconcile',
    });
    return 'granted';
  }

  if (result.outcome === 'denied') {
    const membershipId =
      typeof existing?.whopMembershipId === 'string' && existing.whopMembershipId.length > 0
        ? existing.whopMembershipId
        : undefined;
    await upsertAccessBilling(firebaseUid, {
      hasAccess: false,
      whopMembershipId: membershipId,
      whopUserId: result.whopUserIdForDoc,
      source: 'reconcile',
    });
    return 'denied';
  }

  return result.outcome;
}
