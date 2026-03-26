/**
 * Live Whop product access evaluation (checkAccess + member discovery).
 * Used by GET /api/access/me sync, POST /api/orders/finalize-draft, and billing upserts.
 * No Firestore writes here — callers persist when needed.
 */

import type Whop from '@whop/sdk';
import { getAdminAuth } from './firebase-admin';
import { getWhopApiClient } from './whop-client';
import { logger } from './logger';

export interface ExistingBillingFields {
  whopUserId?: string | null;
  whopMembershipId?: string | null;
}

export type WhopAccessEvalOutcome =
  | 'granted'
  | 'denied'
  | 'inconclusive_no_candidates'
  | 'inconclusive_api_errors';

export interface WhopAccessGrantDetails {
  whopUserId: string;
  membershipId: string | undefined;
}

function whopLiveCheckConfigurable(
  apiKey: unknown,
  productId: unknown,
  planId: unknown
): boolean {
  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return false;
  }
  const hasProduct = typeof productId === 'string' && productId.trim().length > 0;
  const hasPlan = typeof planId === 'string' && planId.trim().length > 0;
  return hasProduct || hasPlan;
}

/** True when API key + product id and/or plan id allow live Whop checks. */
export function isWhopAccessSyncRuntimeConfigured(): boolean {
  const config = useRuntimeConfig();
  return whopLiveCheckConfigurable(config.whopApiKey, config.whopProductId, config.whopPlanId);
}

function productIdFromPlanPayload(plan: unknown): string | null {
  if (plan === null || plan === undefined || typeof plan !== 'object') {
    return null;
  }
  const root = plan as Record<string, unknown>;
  const product = root.product;
  if (product === null || product === undefined || typeof product !== 'object') {
    return null;
  }
  const pid = (product as Record<string, unknown>).id;
  return typeof pid === 'string' && pid.trim().length > 0 ? pid.trim() : null;
}

/** Resolves product id for `checkAccess` / membership list (plan id → product via Plans API). */
export async function resolveProductIdForAccessCheck(
  client: Whop,
  productIdRaw: unknown,
  planIdRaw: unknown
): Promise<string | null> {
  if (typeof productIdRaw === 'string' && productIdRaw.trim().length > 0) {
    return productIdRaw.trim();
  }
  if (typeof planIdRaw !== 'string' || planIdRaw.trim().length === 0) {
    return null;
  }
  try {
    const plan = await client.plans.retrieve(planIdRaw.trim());
    const resolved = productIdFromPlanPayload(plan);
    if (!resolved) {
      logger.warn(
        '[Access] Plan has no product id (standalone plan?). Set NUXT_WHOP_PRODUCT_ID for access checks.'
      );
    }
    return resolved;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn('[Access] plans.retrieve failed; set NUXT_WHOP_PRODUCT_ID if this persists:', msg);
    return null;
  }
}

function whopCheckIndicatesAccess(check: unknown): boolean {
  if (!check || typeof check !== 'object') {
    return false;
  }
  const c = check as Record<string, unknown>;
  if (c.has_access === true || c.hasAccess === true) {
    return true;
  }
  const level = c.access_level ?? c.accessLevel;
  return level === 'admin' || level === 'customer';
}

function whopCheckIndicatesDenial(check: unknown): boolean {
  if (!check || typeof check !== 'object') {
    return false;
  }
  const c = check as Record<string, unknown>;
  if (c.has_access === false || c.hasAccess === false) {
    return true;
  }
  const level = c.access_level ?? c.accessLevel;
  return level === 'no_access';
}

export type WhopAccessEvalResult =
  | { outcome: 'granted'; grant: WhopAccessGrantDetails }
  | { outcome: 'denied'; whopUserIdForDoc: string }
  | { outcome: 'inconclusive_no_candidates' }
  | { outcome: 'inconclusive_api_errors' };

/**
 * Evaluates Whop access for a Firebase user without writing Firestore.
 */
export async function evaluateWhopProductAccess(
  firebaseUid: string,
  existing: ExistingBillingFields | null
): Promise<WhopAccessEvalResult> {
  const config = useRuntimeConfig();
  const apiKey = config.whopApiKey;
  const companyId = config.whopCompanyId;
  const appId = config.whopAppId;

  if (!whopLiveCheckConfigurable(apiKey, config.whopProductId, config.whopPlanId)) {
    return { outcome: 'inconclusive_api_errors' };
  }
  if (typeof apiKey !== 'string' || apiKey.length === 0) {
    return { outcome: 'inconclusive_api_errors' };
  }

  const client = getWhopApiClient(apiKey, appId);

  const productId = await resolveProductIdForAccessCheck(
    client,
    config.whopProductId,
    config.whopPlanId
  );
  if (!productId) {
    return { outcome: 'inconclusive_api_errors' };
  }

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

  if (candidates.length === 0) {
    return { outcome: 'inconclusive_no_candidates' };
  }

  const membershipId =
    typeof existing?.whopMembershipId === 'string' && existing.whopMembershipId.length > 0
      ? existing.whopMembershipId
      : undefined;

  let sawDefinitiveDenial = false;

  for (const whopUserId of candidates) {
    try {
      const check = await client.users.checkAccess(productId, { id: whopUserId });
      if (whopCheckIndicatesAccess(check)) {
        return {
          outcome: 'granted',
          grant: { whopUserId, membershipId },
        };
      }
      if (whopCheckIndicatesDenial(check)) {
        sawDefinitiveDenial = true;
        continue;
      }
      logger.warn(
        '[Access] Whop checkAccess returned unrecognized shape for candidate:',
        whopUserId
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[Access] Whop checkAccess failed for candidate:', whopUserId, msg);
    }
  }

  if (sawDefinitiveDenial) {
    const fallbackId = candidates[0];
    if (typeof fallbackId !== 'string') {
      return { outcome: 'inconclusive_api_errors' };
    }
    const whopUserIdForDoc = fromDoc ?? fallbackId;
    return { outcome: 'denied', whopUserIdForDoc };
  }

  return { outcome: 'inconclusive_api_errors' };
}

/** True only when Whop definitively grants product access (authoritative for submit). */
export async function assertWhopProductAccess(
  firebaseUid: string,
  existing: ExistingBillingFields | null
): Promise<boolean> {
  const result = await evaluateWhopProductAccess(firebaseUid, existing);
  return result.outcome === 'granted';
}
