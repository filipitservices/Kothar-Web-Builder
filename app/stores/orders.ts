/**
 * Orders Store
 *
 * Holds state for template request orders (Firestore: users/{userId}/orders).
 * Subscribes to the user's orders collection when userId is set; exposes list and getById.
 * Single source of truth for order list; no duplicate state elsewhere.
 *
 * Snapshot lifecycle: pages should use `useOrdersSnapshotWhenFocused` so the listener is
 * detached while the tab/window is inactive, avoiding idle WebChannel teardown noise.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  FirestoreError,
  type Unsubscribe,
  type Firestore
} from 'firebase/firestore';
import { getFirebaseApp } from '~/plugins/firebase.client';
import type { OrderWithId } from '~/types/order';
import { parseOrderDocument } from '~/utils/orderValidation';
import { logger } from '~/utils/logger';

/** Recoverable listener errors: SDK retries; keep last successful snapshot. */
function isRecoverableSnapshotError(err: unknown): boolean {
  if (err instanceof FirestoreError) {
    return (
      err.code === 'unavailable' ||
      err.code === 'deadline-exceeded' ||
      err.code === 'resource-exhausted' ||
      err.code === 'aborted' ||
      err.code === 'cancelled'
    );
  }
  return true;
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<OrderWithId[]>([]);
  let unsubscribe: Unsubscribe | null = null;

  const ordersList = computed<OrderWithId[]>(() => [...orders.value]);

  function subscribe(userId: string): void {
    if (!userId.trim()) return;

    const app = getFirebaseApp();
    if (!app) return;

    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    const db = getFirestore(app) as Firestore;
    const ordersColl = collection(db, 'users', userId, 'orders');
    const q = query(ordersColl, orderBy('createdAt', 'desc'));

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: OrderWithId[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const order = parseOrderDocument(data, docSnap.id);
          if (order) list.push(order);
        });
        orders.value = list;
      },
      (err) => {
        if (err instanceof FirestoreError && err.code === 'permission-denied') {
          logger.error('[orders store] snapshot permission denied:', err);
          orders.value = [];
          return;
        }
        if (isRecoverableSnapshotError(err)) {
          if (import.meta.dev) {
            const code = err instanceof FirestoreError ? err.code : 'unknown';
            logger.debug('[orders store] snapshot recoverable error (keeping list):', code);
          }
          return;
        }
        logger.warn('[orders store] snapshot error:', err);
      }
    );
  }

  /** Stop the listener only; keep cached orders (e.g. tab/window inactive). */
  function detachSnapshotListener(): void {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function unsubscribeFromOrders(): void {
    detachSnapshotListener();
    orders.value = [];
  }

  function getOrderById(id: string): OrderWithId | undefined {
    return orders.value.find((o) => o.id === id);
  }

  /**
   * Fetch a single order by id (e.g. for edit page when opening by direct URL).
   * Returns null if not found or Firebase unavailable.
   */
  async function fetchOrder(userId: string, orderId: string): Promise<OrderWithId | null> {
    const app = getFirebaseApp();
    if (!app || !userId.trim() || !orderId.trim()) return null;

    const db = getFirestore(app) as Firestore;
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return parseOrderDocument(data, snap.id);
  }

  /** Whether the user has at least one order. */
  const hasOrders = computed<boolean>(() => orders.value.length > 0);

  /** User-facing label for order status. Includes legacy Firestore values. */
  function getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under review',
      in_production: 'In production',
      awaiting_feedback: 'Awaiting feedback',
      finalizing: 'Finalizing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_review: 'Under review',
      in_progress: 'In production',
      delivered: 'Completed'
    };
    return labels[status] ?? status;
  }

  /** Semantic class suffix for status badge. Includes legacy status values. */
  function getOrderStatusClass(status: string): string {
    const map: Record<string, string> = {
      draft: 'neutral',
      submitted: 'neutral',
      under_review: 'info',
      in_production: 'info',
      awaiting_feedback: 'warning',
      finalizing: 'warning',
      completed: 'success',
      cancelled: 'neutral',
      in_review: 'info',
      in_progress: 'info',
      delivered: 'success'
    };
    return map[status] ?? 'neutral';
  }

  /** Format order createdAt for display; handles Firestore Timestamp. */
  function formatOrderDate(createdAt: unknown): string {
    let date: Date | null = null;
    if (createdAt != null && typeof (createdAt as { toDate?: () => Date }).toDate === 'function') {
      date = (createdAt as { toDate: () => Date }).toDate();
    } else if (createdAt instanceof Date) {
      date = createdAt;
    } else if (typeof createdAt === 'string') {
      date = new Date(createdAt);
    }
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return {
    orders: ordersList,
    hasOrders,
    subscribe,
    detachSnapshotListener,
    unsubscribeFromOrders,
    getOrderById,
    fetchOrder,
    getOrderStatusLabel,
    getOrderStatusClass,
    formatOrderDate
  };
});
