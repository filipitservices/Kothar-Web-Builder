/**
 * App policy for template submission: Whop `checkAccess` can remain true while a membership
 * is scheduled to cancel or has a cancel in progress. We deny finalize-draft when the
 * membership record indicates the user has cancelled or is canceling (see Whop Membership schema).
 *
 * When `whopMembershipId` is missing on Firestore billing (common), we resolve membership rows
 * via `memberships.list` (company_id + product_ids + user_ids) per Whop API.
 */
import type Whop from '@whop/sdk';
import { logger } from './logger';

function membershipPayloadBlocksSubmitAfterUserCancellation(m: unknown): boolean {
  if (!m || typeof m !== 'object') return false;
  const r = m as Record<string, unknown>;
  const status = r.status;
  if (
    status === 'canceled' ||
    status === 'canceling' ||
    status === 'expired' ||
    status === 'completed'
  ) {
    return true;
  }
  if (r.cancel_at_period_end === true) {
    return true;
  }
  const canceledAt = r.canceled_at ?? r.canceledAt;
  if (canceledAt != null && canceledAt !== '') {
    return true;
  }
  return false;
}

/**
 * When true, finalize-draft must reject (403) even if `users.checkAccess` grants.
 * Uses memberships.retrieve when id is known; otherwise memberships.list with company + product + user.
 */
export async function membershipCancelPolicyBlocksSubmit(
  client: Whop,
  params: {
    companyId?: string | null;
    productId: string;
    membershipId?: string | null;
    whopUserId: string;
  }
): Promise<boolean> {
  const { membershipId, whopUserId, productId, companyId } = params;
  const uid = typeof whopUserId === 'string' ? whopUserId.trim() : '';
  if (!uid) {
    return false;
  }

  if (membershipId && membershipId.trim()) {
    try {
      const m = await client.memberships.retrieve(membershipId.trim());
      return membershipPayloadBlocksSubmitAfterUserCancellation(m);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[Access] memberships.retrieve failed; falling back to list:', msg);
    }
  }

  const cid = typeof companyId === 'string' && companyId.trim().length > 0 ? companyId.trim() : '';
  if (!cid) {
    logger.warn(
      '[Access] membership cancel policy: NUXT_WHOP_COMPANY_ID is required to list memberships when whopMembershipId is missing.'
    );
    return false;
  }

  try {
    const page = client.memberships.list({
      company_id: cid,
      product_ids: [productId],
      user_ids: [uid],
      first: 25,
    });
    for await (const m of page) {
      if (membershipPayloadBlocksSubmitAfterUserCancellation(m)) {
        return true;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('[Access] memberships.list failed:', msg);
  }
  return false;
}
