/**
 * Deletes a draft order: Firestore transaction (optional daily counter −1) + Storage prefix cleanup.
 */

import { FirebaseError } from 'firebase/app';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  listAll,
  deleteObject,
  type FirebaseStorage
} from 'firebase/storage';
import { getFirebaseApp } from '~/plugins/firebase.client';
import { ORDER_STATUS_DRAFT } from '~/types/order';
import { formatLocalDateKey } from '~/utils/requestLimitDate';
import { logger } from '~/utils/logger';

export class DeleteDraftRequestError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DeleteDraftRequestError';
  }
}

function firestoreTimeToDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const d = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

async function deleteStoragePrefix(
  storage: FirebaseStorage,
  userId: string,
  orderId: string
): Promise<void> {
  let listed;
  try {
    listed = await listAll(storageRef(storage, `orders/${userId}/${orderId}`));
  } catch {
    return;
  }
  await Promise.all(
    listed.items.map((item) =>
      deleteObject(item).catch((err: unknown) => {
        if (err instanceof FirebaseError && err.code === 'storage/object-not-found') return;
        throw err;
      })
    )
  );
}

export async function deleteDraftRequest(userId: string, orderId: string): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new DeleteDraftRequestError('Firebase is not configured.');
  if (!userId.trim() || !orderId.trim()) {
    throw new DeleteDraftRequestError('User ID and order ID are required.');
  }

  const db = getFirestore(app);
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  const counterRef = doc(db, 'users', userId, 'requestLimits', 'daily');

  try {
    await runTransaction(db, async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) throw new DeleteDraftRequestError('This request no longer exists.');
      const data = orderSnap.data();
      if (data.status !== ORDER_STATUS_DRAFT) {
        throw new DeleteDraftRequestError('Only drafts that have not been submitted can be removed.');
      }
      if (data.modificationLocked === true) {
        throw new DeleteDraftRequestError('This request cannot be deleted while it is locked.');
      }

      const counterSnap = await tx.get(counterRef);
      if (counterSnap.exists()) {
        const c = counterSnap.data();
        const orderDate = firestoreTimeToDate(data.createdAt);
        const dateStr = typeof c.date === 'string' ? c.date : '';
        const count = typeof c.count === 'number' ? c.count : 0;
        if (orderDate && dateStr && count > 0 && formatLocalDateKey(orderDate) === dateStr) {
          tx.update(counterRef, { date: dateStr, count: count - 1 });
        }
      }
      tx.delete(orderRef);
    });
  } catch (err) {
    if (err instanceof DeleteDraftRequestError) throw err;
    throw new DeleteDraftRequestError('Could not delete this request. Please try again.', { cause: err });
  }

  try {
    await deleteStoragePrefix(getStorage(app), userId, orderId);
  } catch (err) {
    logger.warn('[deleteDraftRequest] storage cleanup failed after Firestore delete:', err);
  }
}
