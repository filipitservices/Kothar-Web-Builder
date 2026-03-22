/**
 * POST /api/reports/issue
 *
 * Persists an issue report under users/{uid}/reports/{reportId} using Admin SDK.
 * Auth: session cookie (same model as /api/user/landing-destination).
 * Client Firestore access to this path is denied in firebase/firestore.rules.
 */

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { assertMethod, getHeader } from 'h3';
import { getAdminApp, getAdminAuth, getSessionConfig } from '../../utils/firebase-admin';
import { logger } from '../../utils/logger';
import {
  IssueReportValidationError,
  validateIssueReportInput,
} from '~/utils/issueReportValidation';
import type { IssueReportSubmitResponse } from '~/types/issueReport';

export default defineEventHandler(async (event): Promise<IssueReportSubmitResponse> => {
  assertMethod(event, 'POST');

  const sessionConfig = getSessionConfig();
  const sessionCookie = getCookie(event, sessionConfig.name);

  if (!sessionCookie) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  let uid: string;
  let submitterEmail: string | null;
  let submitterDisplayName: string | null;

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    uid = decoded.uid;
    submitterEmail = typeof decoded.email === 'string' ? decoded.email : null;
    submitterDisplayName = typeof decoded.name === 'string' ? decoded.name : null;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Session invalid';
    logger.warn('[Reports] Session verification failed:', msg);
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }

  const rawBody = await readBody(event);

  let validated;
  try {
    validated = validateIssueReportInput(rawBody);
  } catch (err: unknown) {
    if (err instanceof IssueReportValidationError) {
      throw createError({ statusCode: 400, statusMessage: err.message });
    }
    throw err;
  }

  const userAgentHeader = getHeader(event, 'user-agent');
  const userAgent =
    typeof userAgentHeader === 'string' && userAgentHeader.length > 0
      ? userAgentHeader.length > 512
        ? userAgentHeader.slice(0, 512)
        : userAgentHeader
      : null;

  const db = getFirestore(getAdminApp());
  const col = db.collection('users').doc(uid).collection('reports');

  try {
    const docRef = await col.add({
      category: validated.category,
      message: validated.message,
      submitterEmail,
      submitterDisplayName,
      userAgent,
      source: 'web',
      createdAt: FieldValue.serverTimestamp(),
    });

    return { reportId: docRef.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Reports] Firestore write failed:', msg);
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not save your report. Please try again later.',
    });
  }
});
