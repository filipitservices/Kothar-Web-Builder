/**
 * Create Request Composable
 *
 * Creates a draft request document in Firestore and enforces the daily
 * creation limit (3 per user per day) via an atomic transaction that
 * pairs the order document with a counter document.
 *
 * The counter lives at users/{userId}/requestLimits/daily and is
 * validated by Firestore security rules so the limit cannot be bypassed.
 */

import {
  getFirestore,
  collection,
  doc,
  runTransaction,
  updateDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import { getFirebaseApp } from '~/plugins/firebase.client';
import type { ShowcaseTemplate } from '~/stores/showcase';
import type { OrderLayout, OrderLayoutBlock, OrderWithId } from '~/types/order';
import { ORDER_STATUS_DRAFT } from '~/types/order';
import { showcaseSectionsToBlocks } from '~/stores/requestLayout';
import { todayLocalDateKey } from '~/utils/requestLimitDate';

export class CreateRequestError extends Error {
  public readonly limitExceeded: boolean;

  constructor(message: string, options?: { limitExceeded?: boolean; cause?: unknown }) {
    super(message);
    this.name = 'CreateRequestError';
    this.limitExceeded = options?.limitExceeded ?? false;
    if (options?.cause) this.cause = options.cause;
  }
}

export interface CreateRequestResult {
  orderId: string;
  /** Optional hydration object for the request page fast-path; not the canonical source of truth. */
  orderForHydration?: OrderWithId;
}

function buildInitialLayout(template: ShowcaseTemplate): OrderLayout {
  const blocks = showcaseSectionsToBlocks(template.sections);
  return {
    blocks: blocks.map((b): OrderLayoutBlock => ({
      id: b.id,
      type: b.type,
      label: b.label,
    })),
    customized: false,
  };
}

export interface UseCreateRequestReturn {
  createDraftRequest: (userId: string, template: ShowcaseTemplate) => Promise<CreateRequestResult>;
  saveLayout: (userId: string, orderId: string, layout: OrderLayout) => Promise<void>;
}

/** Build OrderWithId-compatible object for request page hydration (createdAt/updatedAt left null). */
function buildOrderForHydration(
  orderId: string,
  template: ShowcaseTemplate,
  layout: OrderLayout
): OrderWithId {
  const defaultColorCustomization = {
    primary: template.colorScheme.primary,
    secondary: template.colorScheme.secondary,
    accent: template.colorScheme.accent,
    background: template.colorScheme.background,
    text: template.colorScheme.text,
  };
  return {
    id: orderId,
    templateId: template.id,
    templateName: template.name,
    status: ORDER_STATUS_DRAFT,
    layout,
    businessInfo: {
      businessName: '',
      preferredUrl: '',
      location: { displayName: '', verified: false },
      industry: '',
      customIndustry: '',
    },
    contactInfo: {
      contactName: '',
      email: '',
      phone: '',
      website: '',
    },
    projectDetails: {
      goals: [],
      audienceTags: [],
      additionalNotes: '',
      requestCategories: [],
      colorCustomization: defaultColorCustomization,
    },
    attachments: [],
    logoAttachments: [],
    modificationLocked: false,
    createdAt: null,
    updatedAt: null,
  };
}

export function useCreateRequest(): UseCreateRequestReturn {
  /**
   * Create a draft request document paired with a daily-limit counter update.
   * Both writes happen in a single transaction so Firestore rules can validate
   * the counter atomically via getAfter().
   */
  async function createDraftRequest(
    userId: string,
    template: ShowcaseTemplate
  ): Promise<CreateRequestResult> {
    const app = getFirebaseApp();
    if (!app) {
      throw new CreateRequestError('Firebase is not configured.');
    }
    if (!userId.trim()) {
      throw new CreateRequestError('User ID is required.');
    }

    const db = getFirestore(app) as Firestore;
    const today = todayLocalDateKey();

    const orderRef = doc(collection(db, 'users', userId, 'orders'));
    const orderId = orderRef.id;
    const counterRef = doc(db, 'users', userId, 'requestLimits', 'daily');

    const layout = buildInitialLayout(template);
    const defaultColorCustomization = {
      primary: template.colorScheme.primary,
      secondary: template.colorScheme.secondary,
      accent: template.colorScheme.accent,
      background: template.colorScheme.background,
      text: template.colorScheme.text,
    };

    const orderPayload = {
      templateId: template.id,
      templateName: template.name,
      status: ORDER_STATUS_DRAFT,
      layout,
      businessInfo: {
        businessName: '',
        preferredUrl: '',
        location: { displayName: '', verified: false },
        industry: '',
        customIndustry: '',
      },
      contactInfo: {
        contactName: '',
        email: '',
        phone: '',
        website: '',
      },
      projectDetails: {
        goals: [] as string[],
        audienceTags: [] as string[],
        additionalNotes: '',
        requestCategories: [] as string[],
        colorCustomization: defaultColorCustomization,
      },
      attachments: [],
      logoAttachments: [],
      modificationLocked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let newCount = 1;
        if (counterSnap.exists()) {
          const data = counterSnap.data();
          if (data.date === today) {
            newCount = (typeof data.count === 'number' ? data.count : 0) + 1;
          }
        }
        if (newCount > 3) {
          throw new CreateRequestError(
            "You've reached the daily limit of 3 requests. Please try again tomorrow.",
            { limitExceeded: true }
          );
        }
        transaction.set(orderRef, orderPayload);
        transaction.set(counterRef, { date: today, count: newCount });
      });
    } catch (err: unknown) {
      if (err instanceof CreateRequestError) {
        throw err;
      }
      const code = (err as { code?: string }).code;
      if (code === 'permission-denied') {
        throw new CreateRequestError(
          "You've reached the daily limit of 3 requests. Please try again tomorrow.",
          { limitExceeded: true, cause: err }
        );
      }
      throw new CreateRequestError(
        'Failed to create request. Please try again.',
        { cause: err }
      );
    }

    const orderForHydration = buildOrderForHydration(orderId, template, layout);
    return { orderId, orderForHydration };
  }

  /**
   * Persist the current layout to an existing request document.
   */
  async function saveLayout(
    userId: string,
    orderId: string,
    layout: OrderLayout
  ): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
      throw new CreateRequestError('Firebase is not configured.');
    }

    const db = getFirestore(app) as Firestore;
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    try {
      await updateDoc(orderRef, { layout, updatedAt: serverTimestamp() });
    } catch (err) {
      throw new CreateRequestError('Failed to save layout. Please try again.', { cause: err });
    }
  }

  return { createDraftRequest, saveLayout };
}
