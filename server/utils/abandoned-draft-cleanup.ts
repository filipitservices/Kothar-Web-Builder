/**
 * Identifies and removes template-request drafts that were never meaningfully edited
 * and are older than 24 hours. Runs with Firebase Admin (bypasses security rules).
 *
 * "Pristine" matches the initial Firestore payload from createDraftRequest: empty form
 * fields, no attachments, layout absent or layout.customized === false.
 */

import {
  getFirestore,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAdminApp } from './firebase-admin';
import { logger } from './logger';
import { ORDER_STATUS_DRAFT } from '~/types/order';

const ABANDONED_AFTER_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 100;

function trimStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Handles both old shape (yearsInBusiness, businessDescription) and new shape
 * (preferredUrl, location, customIndustry). All string fields must be empty.
 */
function isEmptyBusinessInfo(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (trimStr(o.businessName) !== '' || trimStr(o.industry) !== '') return false;
  // New fields
  if (trimStr(o.preferredUrl) !== '' || trimStr(o.customIndustry) !== '') return false;
  const loc = o.location;
  if (loc !== null && typeof loc === 'object' && trimStr((loc as Record<string, unknown>).displayName) !== '') return false;
  // Old fields (backward compat)
  if (trimStr(o.yearsInBusiness) !== '' || trimStr(o.businessDescription) !== '') return false;
  return true;
}

/**
 * Handles both old shape (targetAudience string) and new shape (audienceTags array, requestCategories array).
 */
function isEmptyProjectDetailsText(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  const goals = o.goals;
  if (!Array.isArray(goals) || goals.length !== 0) return false;
  if (trimStr(o.additionalNotes) !== '') return false;
  // Old field
  if (trimStr(o.targetAudience) !== '') return false;
  // New fields
  const audienceTags = o.audienceTags;
  if (Array.isArray(audienceTags) && audienceTags.length !== 0) return false;
  const requestCategories = o.requestCategories;
  if (Array.isArray(requestCategories) && requestCategories.length !== 0) return false;
  return true;
}

function layoutAllowsCleanup(layout: unknown): boolean {
  if (layout === undefined || layout === null) return true;
  if (typeof layout !== 'object') return false;
  const candidate = layout as {
    customized?: unknown;
    builderAnnotations?: {
      desktop?: { strokes?: unknown[]; textBoxes?: unknown[] };
      mobile?: { strokes?: unknown[]; textBoxes?: unknown[] };
    };
  };
  if (candidate.customized !== false) return false;
  const annotations = candidate.builderAnnotations;
  if (!annotations || typeof annotations !== 'object') return true;
  const desktopHasMarks =
    Array.isArray(annotations.desktop?.strokes) && annotations.desktop.strokes.length > 0;
  const mobileHasMarks =
    Array.isArray(annotations.mobile?.strokes) && annotations.mobile.strokes.length > 0;
  const desktopHasText =
    Array.isArray(annotations.desktop?.textBoxes) && annotations.desktop.textBoxes.length > 0;
  const mobileHasText =
    Array.isArray(annotations.mobile?.textBoxes) && annotations.mobile.textBoxes.length > 0;
  return !(desktopHasMarks || mobileHasMarks || desktopHasText || mobileHasText);
}

/**
 * True if the document still matches an untouched draft (no persisted form progress, no layout customization).
 */
export function isPristineAbandonedDraft(data: DocumentData): boolean {
  if (data.status !== ORDER_STATUS_DRAFT) return false;
  if (data.modificationLocked === true) return false;
  if (!Array.isArray(data.attachments) || data.attachments.length !== 0) return false;
  const logoAtt = data.logoAttachments;
  if (Array.isArray(logoAtt) && logoAtt.length !== 0) return false;
  if (!isEmptyBusinessInfo(data.businessInfo)) return false;
  // contactInfo is populated from Auth on draft create — not used for pristine detection.
  const chat = data.assistantChatMessages;
  if (Array.isArray(chat) && chat.length > 0) return false;
  if (!isEmptyProjectDetailsText(data.projectDetails)) return false;
  if (!layoutAllowsCleanup(data.layout)) return false;
  return true;
}

/** Parses `users/{userId}/orders/{orderId}` from a document path. */
export function userIdFromOrderDocumentPath(path: string): string | null {
  const parts = path.split('/');
  if (parts.length >= 4 && parts[0] === 'users' && parts[2] === 'orders') {
    const uid = parts[1];
    return typeof uid === 'string' && uid.length > 0 ? uid : null;
  }
  return null;
}

async function deleteOrderStoragePrefix(userId: string, orderId: string): Promise<void> {
  const bucket = getStorage(getAdminApp()).bucket();
  await bucket.deleteFiles({ prefix: `orders/${userId}/${orderId}/` });
}

export interface AbandonedDraftCleanupResult {
  scanned: number;
  deleted: number;
}

/**
 * Pages through draft orders with createdAt before the cutoff, deletes pristine abandoned docs
 * and their Storage prefix. Safe to run repeatedly (idempotent for already-deleted ids).
 */
export async function runAbandonedDraftCleanup(): Promise<AbandonedDraftCleanupResult> {
  const db = getFirestore(getAdminApp());
  const cutoff = Timestamp.fromMillis(Date.now() - ABANDONED_AFTER_MS);

  let scanned = 0;
  let deleted = 0;
  let lastDoc: QueryDocumentSnapshot | null = null;

  for (;;) {
    let q = db
      .collectionGroup('orders')
      .where('status', '==', ORDER_STATUS_DRAFT)
      .where('createdAt', '<', cutoff)
      .orderBy('createdAt', 'asc')
      .limit(PAGE_SIZE);

    if (lastDoc) {
      q = q.startAfter(lastDoc);
    }

    const snap = await q.get();
    if (snap.empty) {
      break;
    }

    lastDoc = snap.docs[snap.docs.length - 1] ?? null;

    for (const docSnap of snap.docs) {
      scanned++;
      const data = docSnap.data();
      if (!isPristineAbandonedDraft(data)) {
        continue;
      }

      const userId = userIdFromOrderDocumentPath(docSnap.ref.path);
      if (!userId) {
        logger.warn('[abandoned-draft-cleanup] skip: path not under users/*/orders', docSnap.ref.path);
        continue;
      }

      const orderId = docSnap.id;
      await docSnap.ref.delete();
      deleted++;

      try {
        await deleteOrderStoragePrefix(userId, orderId);
      } catch (err: unknown) {
        logger.warn('[abandoned-draft-cleanup] storage cleanup failed', orderId, err);
      }
    }
  }

  return { scanned, deleted };
}
