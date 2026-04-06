/**
 * Runtime validation for order documents read from Firestore.
 * Used at the boundary (orders store, fetchOrder) so invalid payloads never enter app state.
 */

import type {
  OrderRequest,
  OrderWithId,
  OrderLayout,
  OrderLayoutBlock,
  OrderBusinessInfo,
  OrderContactInfo,
  OrderProjectDetails,
  OrderAttachment,
  OrderStatus
} from '~/types/order';
import type { ColorCustomization } from '~/types/templateRequest';

const ORDER_STATUSES: Set<string> = new Set([
  'draft', 'submitted', 'under_review', 'in_production', 'awaiting_feedback',
  'finalizing', 'completed', 'cancelled'
]);

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function asString(v: unknown): string {
  return isString(v) ? v : '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => isString(x));
}

function validateColorCustomization(v: unknown): v is ColorCustomization {
  if (!isObject(v)) return false;
  const keys: (keyof ColorCustomization)[] = ['primary', 'secondary', 'accent', 'background', 'text'];
  return keys.every((k) => isString(v[k]));
}

function validateOrderLayoutBlock(v: unknown): v is OrderLayoutBlock {
  if (!isObject(v)) return false;
  return isString(v.id) && isString(v.type) && isString(v.label);
}

function validateOrderLayout(v: unknown): v is OrderLayout {
  if (!isObject(v)) return false;
  if (typeof v.customized !== 'boolean') return false;
  if (!Array.isArray(v.blocks)) return false;
  return v.blocks.every((b: unknown) => validateOrderLayoutBlock(b));
}

/**
 * Validates businessInfo — accepts both old shape (yearsInBusiness, businessDescription)
 * and new shape (preferredUrl, location, customIndustry). Requires businessName and industry.
 */
function validateOrderBusinessInfo(v: unknown): v is OrderBusinessInfo {
  if (!isObject(v)) return false;
  return isString(v.businessName) && isString(v.industry);
}

/**
 * Validates contactInfo — accepts old shape (with address) and new shape (without address).
 * Requires contactName, email, phone, website.
 */
function validateOrderContactInfo(v: unknown): v is OrderContactInfo {
  if (!isObject(v)) return false;
  return (
    isString(v.contactName) &&
    isString(v.email) &&
    isString(v.phone) &&
    isString(v.website)
  );
}

/**
 * Validates projectDetails — accepts old shape (targetAudience string)
 * and new shape (audienceTags array, requestCategories array).
 */
function validateOrderProjectDetails(v: unknown): v is OrderProjectDetails {
  if (!isObject(v)) return false;
  if (!Array.isArray(v.goals) || !v.goals.every((g: unknown) => isString(g))) return false;
  if (!isString(v.additionalNotes)) return false;
  return validateColorCustomization(v.colorCustomization);
}

function validateOrderAttachment(v: unknown): v is OrderAttachment {
  if (!isObject(v)) return false;
  return (
    isString(v.originalName) &&
    isString(v.storagePath) &&
    isString(v.downloadURL) &&
    isNumber(v.size) &&
    isString(v.contentType)
  );
}

/**
 * Type guard: true if data is a valid OrderRequest shape from Firestore.
 * Validates nested businessInfo, contactInfo, projectDetails, layout, attachments.
 */
export function validateOrderRequest(data: unknown): data is OrderRequest {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const d = data as Record<string, unknown>;

  if (!isString(d.templateId) || !isString(d.templateName)) return false;
  if (!validateOrderBusinessInfo(d.businessInfo)) return false;
  if (!validateOrderContactInfo(d.contactInfo)) return false;
  if (!validateOrderProjectDetails(d.projectDetails)) return false;
  if (!Array.isArray(d.attachments) || !d.attachments.every((a: unknown) => validateOrderAttachment(a))) return false;
  if (d.logoAttachments !== undefined && d.logoAttachments !== null) {
    if (!Array.isArray(d.logoAttachments) || !d.logoAttachments.every((a: unknown) => validateOrderAttachment(a))) return false;
  }
  if (!isString(d.status) || !ORDER_STATUSES.has(d.status)) return false;

  if (d.layout !== undefined && d.layout !== null && !validateOrderLayout(d.layout)) return false;
  if (d.modificationLocked !== undefined && typeof d.modificationLocked !== 'boolean') return false;

  return true;
}

/**
 * Parse a Firestore document into OrderWithId, or null if invalid.
 * Use at the boundary when reading doc.data() so invalid payloads are rejected.
 */
export function parseOrderDocument(data: unknown, documentId: string): OrderWithId | null {
  if (!validateOrderRequest(data)) return null;
  const d = data as OrderRequest;
  return {
    ...d,
    id: documentId,
    modificationLocked: d.modificationLocked === true
  };
}
