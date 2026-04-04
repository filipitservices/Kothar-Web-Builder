/**
 * POST /api/cron/cleanup-abandoned-drafts
 *
 * Secured by NUXT_ABANDONED_DRAFT_CRON_SECRET: send the same value in header
 * `x-cron-secret` or `Authorization: Bearer <secret>`.
 * Intended to be invoked on a schedule (e.g. Google Cloud Scheduler → HTTPS).
 */

import { timingSafeEqual } from 'node:crypto';
import { assertMethod, getRequestHeader, createError, type H3Event } from 'h3';
import { runAbandonedDraftCleanup } from '../../utils/abandoned-draft-cleanup';
import { isAdminInitialized } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';

function timingSafeSecretEqual(expected: string, received: string): boolean {
  if (expected.length !== received.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
}

function extractProvidedSecret(event: H3Event): string {
  const cronHeader = getRequestHeader(event, 'x-cron-secret');
  if (typeof cronHeader === 'string' && cronHeader.length > 0) {
    return cronHeader.trim();
  }
  const auth = getRequestHeader(event, 'authorization');
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST');

  const runtimeConfig = useRuntimeConfig();
  const expected = runtimeConfig.abandonedDraftCronSecret;
  if (typeof expected !== 'string' || expected.length === 0) {
    logger.warn('[cleanup-abandoned-drafts] NUXT_ABANDONED_DRAFT_CRON_SECRET is not set');
    throw createError({
      statusCode: 503,
      statusMessage: 'Abandoned draft cleanup is not configured',
    });
  }

  const provided = extractProvidedSecret(event);
  if (provided.length === 0 || !timingSafeSecretEqual(expected, provided)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  if (!isAdminInitialized()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Firebase Admin is not available',
    });
  }

  try {
    const result = await runAbandonedDraftCleanup();
    logger.log(
      '[cleanup-abandoned-drafts] done',
      `scanned=${result.scanned}`,
      `deleted=${result.deleted}`
    );
    return { ok: true as const, scanned: result.scanned, deleted: result.deleted };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('[cleanup-abandoned-drafts] failed:', msg);
    throw createError({
      statusCode: 500,
      statusMessage: 'Cleanup failed',
    });
  }
});
