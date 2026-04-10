/**
 * Order Submission Composable
 *
 * Handles persisting template request orders to Firestore and file uploads to Firebase Storage.
 * Single responsibility: validate inputs, upload files to Storage, write order document to Firestore.
 * Uses modular Firebase SDK only. No legacy namespace API.
 */

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from '~/plugins/firebase.client';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import type {
  OrderAttachment,
  OrderBusinessInfo,
  OrderContactInfo,
  OrderProjectDetails,
  OrderRequest,
  OrderLayout
} from '~/types/order';
import { ORDER_STATUS_DEFAULT } from '~/types/order';
import { sanitizeStorageFileName } from '~/utils/storage';
import { normalizeTemplateRequestFormData } from '~/utils/requestInputNormalization';
import { buildContactInfoFromAuth } from '~/utils/contactInfoFromAuth';

/** Result of a successful order submission. */
export interface OrderSubmissionResult {
  orderId: string;
}

/** Thrown when Firebase is not configured or submission fails. */
export class OrderSubmissionError extends Error {
  public override readonly cause?: unknown;

  constructor(
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'OrderSubmissionError';
    this.cause = cause;
  }
}

/**
 * Map validated form data to order document segments.
 * Does not include attachments (built from upload results).
 */
function formDataToOrderPayload(
  data: TemplateRequestFormData,
  layout: OrderLayout | undefined,
  contactInfo: OrderContactInfo,
  templateId: string,
  templateName: string
): Omit<OrderRequest, 'createdAt' | 'updatedAt'> {
  const normalizedData = normalizeTemplateRequestFormData(data);
  const businessInfo: OrderBusinessInfo = {
    businessName: normalizedData.businessName,
    preferredUrl: normalizedData.preferredUrl,
    location: normalizedData.location,
    industry: normalizedData.industry,
    customIndustry: normalizedData.industry === 'other' ? normalizedData.customIndustry : ''
  };

  const projectDetails: OrderProjectDetails = {
    goals: [...normalizedData.goals],
    audienceTags: [...normalizedData.audienceTags],
    additionalNotes: normalizedData.additionalNotes,
    requestCategories: [...normalizedData.requestCategories],
    colorCustomization: { ...normalizedData.colorCustomization }
  };

  return {
    templateId,
    templateName,
    businessInfo,
    contactInfo,
    projectDetails,
    layout,
    attachments: [],
    logoAttachments: [],
    status: ORDER_STATUS_DEFAULT,
    modificationLocked: false
  };
}

/**
 * Upload a single file to Storage and return attachment metadata.
 * Path: orders/{userId}/{orderId}/{sanitizedFilename}
 */
async function uploadFileAndGetMetadata(
  storage: FirebaseStorage,
  userId: string,
  orderId: string,
  file: File,
  index: number
): Promise<OrderAttachment> {
  const fileName = sanitizeStorageFileName(file.name, index);
  const path = `orders/${userId}/${orderId}/${fileName}`;
  const ref = storageRef(storage, path);

  await uploadBytes(ref, file, {
    contentType: file.type || 'application/octet-stream'
  });

  const downloadURL = await getDownloadURL(ref);

  return {
    originalName: file.name,
    storagePath: path,
    downloadURL,
    size: file.size,
    contentType: file.type || 'application/octet-stream'
  };
}

/**
 * Upload all files; if any fails, throw and do not write Firestore.
 */
async function uploadAllAttachments(
  storage: FirebaseStorage,
  userId: string,
  orderId: string,
  files: File[]
): Promise<OrderAttachment[]> {
  const results = await Promise.all(
    files.map((file, index) =>
      uploadFileAndGetMetadata(storage, userId, orderId, file, index)
    )
  );
  return results;
}

/**
 * Composable return type: submitOrder only (no reactive state).
 */
export interface UseOrderSubmissionReturn {
  submitOrder: (params: OrderSubmissionParams) => Promise<OrderSubmissionResult>;
}

export interface OrderSubmissionParams {
  userId: string;
  templateId: string;
  templateName: string;
  formData: TemplateRequestFormData;
  files: File[];
  layout?: OrderLayout;
}

/**
 * Submit a template request order: upload files to Storage, then write order to Firestore.
 * Uses user-scoped path: users/{userId}/orders/{orderId}.
 * Files are stored at orders/{userId}/{orderId}/{filename}.
 * If any upload fails, Firestore write is not performed.
 */
export function useOrderSubmission(): UseOrderSubmissionReturn {
  function submitOrder(params: OrderSubmissionParams): Promise<OrderSubmissionResult> {
    const app = getFirebaseApp();
    if (!app) {
      return Promise.reject(
        new OrderSubmissionError('Firebase is not configured.')
      );
    }

    const { userId, templateId, templateName, formData, files, layout } = params;

    if (!userId.trim()) {
      return Promise.reject(new OrderSubmissionError('User ID is required.'));
    }

    const authUser = getAuth(app).currentUser;
    if (!authUser || authUser.uid !== userId) {
      return Promise.reject(new OrderSubmissionError('You must be signed in to submit your request.'));
    }
    const contactInfo = buildContactInfoFromAuth(authUser);

    const db = getFirestore(app) as Firestore;
    const storage = getStorage(app);
    const ordersColl = collection(db, 'users', userId, 'orders');
    const orderRef = doc(ordersColl);
    const orderId = orderRef.id;

    const basePayload = formDataToOrderPayload(formData, layout, contactInfo, templateId, templateName);

    return (async () => {
      let attachments: OrderAttachment[] = [];
      if (files.length > 0) {
        try {
          attachments = await uploadAllAttachments(storage, userId, orderId, files);
        } catch (err) {
          throw new OrderSubmissionError(
            'One or more file uploads failed. Order was not saved.',
            err
          );
        }
      }

      const payload: Omit<OrderRequest, 'createdAt' | 'updatedAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        updatedAt: ReturnType<typeof serverTimestamp>;
      } = {
        ...basePayload,
        attachments,
        status: ORDER_STATUS_DEFAULT,
        modificationLocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      try {
        await setDoc(orderRef, payload);
      } catch (err) {
        throw new OrderSubmissionError(
          'Failed to save order. Your files were uploaded; please try again.',
          err
        );
      }

      return { orderId };
    })();
  }

  return { submitOrder };
}
