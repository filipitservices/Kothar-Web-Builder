/**
 * POST /api/webhooks/whop
 *
 * Verifies Whop Standard Webhooks signatures via @whop/sdk, then updates
 * users/{firebaseUid}/access/billing via Admin SDK.
 */

import { assertMethod, getRequestHeaders, readRawBody } from 'h3';
import { getWhopWebhookClient } from '../../utils/whop-client';
import { upsertAccessBilling } from '../../utils/access-billing';
import { logger } from '../../utils/logger';
import { WHOP_METADATA_FIREBASE_UID } from '~/constants/access';

function headersToRecord(headers: ReturnType<typeof getRequestHeaders>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return out;
}

function readFirebaseUidFromMetadata(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const raw = metadata[WHOP_METADATA_FIREBASE_UID];
  if (typeof raw === 'string' && raw.length > 0) return raw;
  return null;
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST');

  const config = useRuntimeConfig();
  const secret = config.whopWebhookSecret;
  if (!secret || typeof secret !== 'string') {
    logger.error('[Whop Webhook] NUXT_WHOP_WEBHOOK_SECRET is not set');
    throw createError({ statusCode: 500, statusMessage: 'Webhook not configured' });
  }

  const raw = await readRawBody(event, 'utf8');
  if (typeof raw !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' });
  }

  const whop = getWhopWebhookClient(secret);
  let parsed: unknown;
  try {
    parsed = whop.webhooks.unwrap(raw, {
      headers: headersToRecord(getRequestHeaders(event)),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    logger.warn('[Whop Webhook] Signature verification failed:', msg);
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' });
  }

  if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  const payload = parsed as unknown as {
    type: string;
    data?: { id: string; metadata?: Record<string, unknown>; user?: { id: string } | null };
  };
  const eventType = payload.type;

  try {
    if (eventType === 'membership.activated') {
      const data = payload.data;
      if (!data?.id) {
        return { ok: true };
      }
      const firebaseUid = readFirebaseUidFromMetadata(data.metadata);
      if (!firebaseUid) {
        logger.warn('[Whop Webhook] membership.activated missing metadata.firebase_uid');
        return { ok: true };
      }
      const whopUserId = data.user?.id ?? null;
      await upsertAccessBilling(firebaseUid, {
        hasAccess: true,
        whopMembershipId: data.id,
        whopUserId: whopUserId ?? undefined,
        source: 'webhook',
      });
    } else if (eventType === 'membership.deactivated') {
      const data = payload.data;
      if (!data?.id) {
        return { ok: true };
      }
      const firebaseUid = readFirebaseUidFromMetadata(data.metadata);
      if (!firebaseUid) {
        logger.warn('[Whop Webhook] membership.deactivated missing metadata.firebase_uid');
        return { ok: true };
      }
      const whopUserId = data.user?.id ?? null;
      await upsertAccessBilling(firebaseUid, {
        hasAccess: false,
        whopMembershipId: data.id,
        whopUserId: whopUserId ?? undefined,
        source: 'webhook',
      });
    } else {
      // Acknowledge other events without processing
      logger.log('[Whop Webhook] Ignoring event type:', eventType);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('[Whop Webhook] Handler error:', msg);
    throw createError({ statusCode: 500, statusMessage: 'Webhook processing failed' });
  }

  return { ok: true };
});
