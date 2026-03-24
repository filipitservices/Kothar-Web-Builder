/**
 * Order Update Composable
 *
 * Updates existing orders in Firestore. Only user-editable fields are written;
 * status and modificationLocked are admin-only and must not be sent by the client.
 * Maps OrderWithId to form data for edit UI and applies updates via updateDoc.
 */

import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseApp } from '~/plugins/firebase.client';
import type { OrderWithId } from '~/types/order';
import type {
  OrderAttachment,
  OrderBusinessInfo,
  OrderContactInfo,
  OrderProjectDetails,
  OrderLayout
} from '~/types/order';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import { sanitizeStorageFileName } from '~/utils/storage';

/**
 * Map an order document to form data for prefilling the edit form.
 * Existing attachments are reflected in brandAssets (names only); files array is empty.
 */
export function orderToFormData(order: OrderWithId): TemplateRequestFormData {
  const { businessInfo, contactInfo, projectDetails } = order;
  return {
    businessName: businessInfo.businessName ?? '',
    industry: businessInfo.industry ?? '',
    yearsInBusiness: businessInfo.yearsInBusiness ?? '',
    businessDescription: businessInfo.businessDescription ?? '',
    contactName: contactInfo.contactName ?? '',
    email: contactInfo.email ?? '',
    phone: contactInfo.phone ?? '',
    website: contactInfo.website ?? '',
    address: contactInfo.address ?? '',
    goals: [...(projectDetails.goals ?? [])],
    targetAudience: projectDetails.targetAudience ?? '',
    brandAssets: (order.attachments ?? []).map((a) => a.originalName),
    files: [],
    additionalNotes: projectDetails.additionalNotes ?? '',
    colorCustomization: { ...projectDetails.colorCustomization }
  };
}

/**
 * Build the updatable subset of an order from form data.
 * Does not include status, modificationLocked, createdAt, or id.
 */
function formDataToOrderUpdate(data: TemplateRequestFormData): {
  businessInfo: OrderBusinessInfo;
  contactInfo: OrderContactInfo;
  projectDetails: OrderProjectDetails;
} {
  return {
    businessInfo: {
      businessName: data.businessName.trim(),
      industry: data.industry.trim(),
      yearsInBusiness: data.yearsInBusiness.trim(),
      businessDescription: data.businessDescription.trim()
    },
    contactInfo: {
      contactName: data.contactName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      website: data.website.trim(),
      address: data.address.trim()
    },
    projectDetails: {
      goals: [...data.goals],
      targetAudience: data.targetAudience.trim(),
      additionalNotes: data.additionalNotes.trim(),
      colorCustomization: { ...data.colorCustomization }
    }
  };
}

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
  await uploadBytes(ref, file, { contentType: file.type || 'application/octet-stream' });
  const downloadURL = await getDownloadURL(ref);
  return {
    originalName: file.name,
    storagePath: path,
    downloadURL,
    size: file.size,
    contentType: file.type || 'application/octet-stream'
  };
}

export class OrderUpdateError extends Error {
  public override readonly cause?: unknown;

  constructor(
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'OrderUpdateError';
    this.cause = cause;
  }
}

export interface UseOrderUpdateReturn {
  orderToFormData: (order: OrderWithId) => TemplateRequestFormData;
  updateOrder: (params: OrderUpdateParams) => Promise<void>;
}

export interface OrderUpdateParams {
  userId: string;
  orderId: string;
  formData: TemplateRequestFormData;
  /** Existing attachments to preserve; new files will be appended. */
  existingAttachments: OrderAttachment[];
  /** New files to upload and append to attachments. */
  newFiles?: File[];
  /** Page layout configuration to persist with the order. */
  layout?: OrderLayout;
  /** Optional status transition (e.g. draft -> submitted). */
  status?: import('~/types/order').OrderStatus;
}

/**
 * Update an existing order. Writes businessInfo, contactInfo, projectDetails,
 * attachments, layout, updatedAt, and optionally status (e.g. draft → submitted).
 * Never writes modificationLocked (admin-only).
 */
export function useOrderUpdate(): UseOrderUpdateReturn {
  function updateOrder(params: OrderUpdateParams): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
      return Promise.reject(new OrderUpdateError('Firebase is not configured.'));
    }

    const { userId, orderId, formData, existingAttachments, newFiles = [], layout, status } = params;
    if (!userId.trim() || !orderId.trim()) {
      return Promise.reject(new OrderUpdateError('User ID and order ID are required.'));
    }

    const db = getFirestore(app) as Firestore;
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    return (async () => {
      let attachments: OrderAttachment[] = [...existingAttachments];

      if (newFiles.length > 0) {
        const storage = getStorage(app);
        const uploaded = await Promise.all(
          newFiles.map((file, index) =>
            uploadFileAndGetMetadata(storage, userId, orderId, file, existingAttachments.length + index)
          )
        );
        attachments = [...existingAttachments, ...uploaded];
      }

      const { businessInfo, contactInfo, projectDetails } = formDataToOrderUpdate(formData);

      const updatePayload: Record<string, unknown> = {
        businessInfo,
        contactInfo,
        projectDetails,
        attachments,
        updatedAt: serverTimestamp(),
      };

      if (layout) {
        updatePayload.layout = layout;
      }

      if (status) {
        updatePayload.status = status;
      }

      try {
        await updateDoc(orderRef, updatePayload);
      } catch (err) {
        throw new OrderUpdateError('Failed to update order. Please try again.', err);
      }
    })();
  }

  return {
    orderToFormData,
    updateOrder
  };
}
