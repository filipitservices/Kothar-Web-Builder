/**
 * POST /api/orders/finalize-draft
 *
 * Authoritative draft → submitted transition: verifies Firebase session, confirms order is draft,
 * asserts Whop product access via live checkAccess (no reliance on client + billing doc timing),
 * then updates status with Admin SDK.
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { assertMethod, readBody } from 'h3';
import { getAdminApp, getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import {
  evaluateWhopProductAccess,
  resolveProductIdForAccessCheck,
} from '../../utils/whop-assert-access';
import { getWhopApiClient } from '../../utils/whop-client';
import { membershipCancelPolicyBlocksSubmit } from '../../utils/whop-membership-submit-policy';
import { logger } from '../../utils/logger';
import { ACCESS_COLLECTION, ACCESS_BILLING_DOC_ID } from '~/constants/access';
import { ORDER_STATUS_DEFAULT } from '~/types/order';

interface FinalizeDraftBody {
  orderId?: string;
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST');

  const runtimeConfig = useRuntimeConfig();
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
    logger.warn('[Finalize draft] Session verification failed:', msg);
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  let body: FinalizeDraftBody = {};
  try {
    body = await readBody<FinalizeDraftBody>(event);
  } catch {
    body = {};
  }

  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId is required' });
  }

  const db = getFirestore(getAdminApp());
  const orderRef = db.collection('users').doc(uid).collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' });
  }

  const orderData = orderSnap.data();
  if (orderData?.status !== 'draft') {
    throw createError({ statusCode: 409, statusMessage: 'Order is not a draft' });
  }

  const billingSnap = await db
    .collection('users')
    .doc(uid)
    .collection(ACCESS_COLLECTION)
    .doc(ACCESS_BILLING_DOC_ID)
    .get();

  const existing = billingSnap.exists
    ? (() => {
        const b = billingSnap.data();
        return {
          whopUserId: typeof b?.whopUserId === 'string' ? b.whopUserId : undefined,
          whopMembershipId:
            typeof b?.whopMembershipId === 'string' ? b.whopMembershipId : undefined,
        };
      })()
    : null;

  const evalResult = await evaluateWhopProductAccess(uid, existing);
  let allowed = evalResult.outcome === 'granted';

  let membershipPolicyBlocked = false;
  if (allowed && evalResult.outcome === 'granted') {
    const grant = evalResult.grant;
    const apiKey = runtimeConfig.whopApiKey;
    if (typeof apiKey === 'string' && apiKey.length > 0) {
      const whopClient = getWhopApiClient(apiKey, runtimeConfig.whopAppId);
      const productId = await resolveProductIdForAccessCheck(
        whopClient,
        runtimeConfig.whopProductId,
        runtimeConfig.whopPlanId
      );
      if (productId) {
        membershipPolicyBlocked = await membershipCancelPolicyBlocksSubmit(whopClient, {
          companyId: runtimeConfig.whopCompanyId,
          productId,
          membershipId: existing?.whopMembershipId ?? null,
          whopUserId: grant.whopUserId,
        });
        if (membershipPolicyBlocked) {
          allowed = false;
        }
      }
    }
  }

  if (!allowed) {
    /** 200 + body avoids browser console treating entitlement denial as a failed request. */
    return { ok: false as const, reason: 'subscription_required' as const };
  }

  try {
    await orderRef.update({
      status: ORDER_STATUS_DEFAULT,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('[Finalize draft] Firestore update failed:', msg);
    throw createError({ statusCode: 500, statusMessage: 'Failed to finalize order' });
  }

  return { ok: true as const };
});
