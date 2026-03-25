/**
 * Single server-side path to align Firestore billing with Whop when webhooks
 * are delayed, metadata is missing (e.g. static checkout URL), or only whopUserId
 * needs confirmation via API.
 */

import { upsertAccessBilling } from './access-billing';
import { getAdminAuth } from './firebase-admin';
import { getWhopApiClient } from './whop-client';
import { logger } from './logger';

export interface ExistingBillingFields {
  whopUserId?: string | null;
  whopMembershipId?: string | null;
}

/**
 * Returns true if Whop confirms access and Firestore was updated.
 */
export async function reconcileBillingAccess(
  firebaseUid: string,
  existing: ExistingBillingFields | null
): Promise<boolean> {
  const config = useRuntimeConfig();
  const apiKey = config.whopApiKey;
  const productId = config.whopProductId;
  const companyId = config.whopCompanyId;
  const appId = config.whopAppId;

  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return false;
  }
  if (typeof productId !== 'string' || productId.length === 0) {
    return false;
  }

  const client = getWhopApiClient(apiKey, appId);

  const candidates: string[] = [];
  const fromDoc =
    typeof existing?.whopUserId === 'string' && existing.whopUserId.length > 0
      ? existing.whopUserId
      : null;
  if (fromDoc) {
    candidates.push(fromDoc);
  }

  if (typeof companyId === 'string' && companyId.length > 0) {
    try {
      const adminAuth = getAdminAuth();
      const userRecord = await adminAuth.getUser(firebaseUid);
      const email = userRecord.email;
      if (email) {
        const page = client.members.list({
          company_id: companyId,
          product_ids: [productId],
          query: email,
          first: 25,
        });
        for await (const m of page) {
          const mu = m.user;
          if (!mu?.id) continue;
          if (
            mu.email &&
            mu.email.toLowerCase() === email.toLowerCase() &&
            !candidates.includes(mu.id)
          ) {
            candidates.push(mu.id);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[Access] Whop member list / Firebase user lookup failed:', msg);
    }
  }

  const membershipId =
    typeof existing?.whopMembershipId === 'string' && existing.whopMembershipId.length > 0
      ? existing.whopMembershipId
      : undefined;

  for (const whopUserId of candidates) {
    try {
      const check = await client.users.checkAccess(productId, { id: whopUserId });
      if (check.has_access === true) {
        await upsertAccessBilling(firebaseUid, {
          hasAccess: true,
          whopMembershipId: membershipId,
          whopUserId,
          source: 'reconcile',
        });
        return true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[Access] Whop checkAccess failed for candidate:', whopUserId, msg);
    }
  }

  return false;
}
