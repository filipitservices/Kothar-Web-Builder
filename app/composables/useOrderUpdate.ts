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
import type { TemplateRequestFormData, LocationData } from '~/types/templateRequest';
import { sanitizeStorageFileName } from '~/utils/storage';

/**
 * Map an order document to form data for prefilling the edit form.
 * Backward-compatible: handles old order shapes that may have yearsInBusiness,
 * businessDescription, address, or targetAudience.
 */
export function orderToFormData(order: OrderWithId): TemplateRequestFormData {
  const { businessInfo, contactInfo, projectDetails } = order;

  // Backward compat: old orders may have contactInfo.address instead of businessInfo.location
  const oldAddress = (contactInfo as Record<string, unknown>).address as string | undefined;
  const location: LocationData = businessInfo.location
    ? { ...businessInfo.location }
    : oldAddress
      ? { displayName: oldAddress, verified: false }
      : { displayName: '', verified: false };

  // Backward compat: old orders may have targetAudience string instead of audienceTags array
  const oldTargetAudience = (projectDetails as Record<string, unknown>).targetAudience as string | undefined;
  const audienceTags: string[] = Array.isArray(projectDetails.audienceTags)
    ? [...projectDetails.audienceTags]
    : oldTargetAudience?.trim()
      ? [oldTargetAudience.trim()]
      : [];

  return {
    colorCustomization: { ...projectDetails.colorCustomization },
    logoAssets: (order.logoAttachments ?? []).map((a) => a.originalName),
    logoFiles: [],
    brandAssets: (order.attachments ?? []).map((a) => a.originalName),
    files: [],
    businessName: businessInfo.businessName ?? '',
    preferredUrl: businessInfo.preferredUrl ?? '',
    location,
    industry: businessInfo.industry ?? '',
    customIndustry: businessInfo.customIndustry ?? '',
    contactName: contactInfo.contactName ?? '',
    email: contactInfo.email ?? '',
    phone: contactInfo.phone ?? '',
    website: contactInfo.website ?? '',
    goals: [...(projectDetails.goals ?? [])],
    audienceTags,
    additionalNotes: projectDetails.additionalNotes ?? '',
    requestCategories: [...(projectDetails.requestCategories ?? [])]
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
      preferredUrl: data.preferredUrl.trim(),
      location: { ...data.location },
      industry: data.industry.trim(),
      customIndustry: data.industry === 'other' ? data.customIndustry.trim() : ''
    },
    contactInfo: {
      contactName: data.contactName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      website: data.website.trim()
    },
    projectDetails: {
      goals: [...data.goals],
      audienceTags: [...data.audienceTags],
      additionalNotes: data.additionalNotes.trim(),
      requestCategories: [...data.requestCategories],
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
  /** Existing brand material attachments to preserve; new files will be appended. */
  existingAttachments: OrderAttachment[];
  /** New brand material files to upload and append. */
  newFiles?: File[];
  /** Existing logo attachments to preserve. */
  existingLogoAttachments?: OrderAttachment[];
  /** New logo files to upload and append. */
  newLogoFiles?: File[];
  /** Page layout configuration to persist with the order. */
  layout?: OrderLayout;
  /** Optional status transition (e.g. draft -> submitted). */
  status?: import('~/types/order').OrderStatus;
}

/**
 * Update an existing order. Writes businessInfo, contactInfo, projectDetails,
 * attachments, logoAttachments, layout, updatedAt, and optionally status.
 * Never writes modificationLocked (admin-only).
 */
export function useOrderUpdate(): UseOrderUpdateReturn {
  function updateOrder(params: OrderUpdateParams): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
      return Promise.reject(new OrderUpdateError('Firebase is not configured.'));
    }

    const {
      userId, orderId, formData,
      existingAttachments, newFiles = [],
      existingLogoAttachments = [], newLogoFiles = [],
      layout, status
    } = params;
    if (!userId.trim() || !orderId.trim()) {
      return Promise.reject(new OrderUpdateError('User ID and order ID are required.'));
    }

    const db = getFirestore(app) as Firestore;
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    return (async () => {
      const storage = getStorage(app);

      let attachments: OrderAttachment[] = [...existingAttachments];
      if (newFiles.length > 0) {
        const uploaded = await Promise.all(
          newFiles.map((file, index) =>
            uploadFileAndGetMetadata(storage, userId, orderId, file, existingAttachments.length + index)
          )
        );
        attachments = [...existingAttachments, ...uploaded];
      }

      let logoAttachments: OrderAttachment[] = [...existingLogoAttachments];
      if (newLogoFiles.length > 0) {
        const uploaded = await Promise.all(
          newLogoFiles.map((file, index) =>
            uploadFileAndGetMetadata(storage, userId, orderId, file, existingLogoAttachments.length + index)
          )
        );
        logoAttachments = [...existingLogoAttachments, ...uploaded];
      }

      const { businessInfo, contactInfo, projectDetails } = formDataToOrderUpdate(formData);

      const updatePayload: Record<string, unknown> = {
        businessInfo,
        contactInfo,
        projectDetails,
        attachments,
        logoAttachments,
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
