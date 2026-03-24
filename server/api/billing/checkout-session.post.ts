/**
 * POST /api/billing/checkout-session
 *
 * Creates a Whop checkout configuration with metadata.firebase_uid for webhook mapping.
 */

import { assertMethod } from 'h3';
import { getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';
import { getWhopApiClient } from '../../utils/whop-client';
import { WHOP_METADATA_FIREBASE_UID } from '~/constants/access';
import type { CheckoutSessionResponse } from '~/types/access';

function normalizeCheckoutUrl(url: string): string {
  const t = url.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `https://whop.com${path}`;
}

interface CheckoutBody {
  returnUrl?: string;
}

export default defineEventHandler(async (event): Promise<CheckoutSessionResponse> => {
  assertMethod(event, 'POST');

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
    logger.warn('[Checkout] Session verification failed:', msg);
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  const config = useRuntimeConfig();
  const apiKey = config.whopApiKey;
  const planId = config.whopPlanId;
  if (!apiKey || typeof apiKey !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'Billing is not configured' });
  }
  if (!planId || typeof planId !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'Billing plan is not configured' });
  }

  let body: CheckoutBody = {};
  try {
    body = await readBody<CheckoutBody>(event);
  } catch {
    body = {};
  }
  const returnUrl =
    typeof body.returnUrl === 'string' && body.returnUrl.length > 0 ? body.returnUrl : undefined;

  const client = getWhopApiClient(apiKey, config.whopAppId);

  try {
    const checkout = await client.checkoutConfigurations.create({
      plan_id: planId,
      mode: 'payment',
      metadata: {
        [WHOP_METADATA_FIREBASE_UID]: uid,
      },
      redirect_url: returnUrl ?? null,
    });

    return { url: normalizeCheckoutUrl(checkout.purchase_url) };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Checkout failed';
    logger.error('[Checkout] Whop API error:', msg);
    throw createError({ statusCode: 502, statusMessage: 'Could not start checkout. Try again later.' });
  }
});
