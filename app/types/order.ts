/**
 * Order and Template Request Types
 *
 * Type definitions for persisted template request orders in Firestore.
 * These types represent the exact document shape stored; do not store raw form objects.
 */

import type { ColorCustomization } from '~/types/templateRequest';

/**
 * Order lifecycle status. Strict union — admin-assignable only; clients must not mutate.
 * Default on creation: 'submitted'.
 */
export type OrderStatus =
  | 'submitted'
  | 'under_review'
  | 'in_production'
  | 'awaiting_feedback'
  | 'finalizing'
  | 'completed'
  | 'cancelled';

/** First status in workflow; used as default when creating orders. */
export const ORDER_STATUS_DEFAULT: OrderStatus = 'submitted';

/** Metadata for a single file attachment stored in Firebase Storage. */
export interface OrderAttachment {
  /** Original filename as provided by the user. */
  originalName: string;
  /** Full storage path (e.g. orders/{userId}/{orderId}/filename). */
  storagePath: string;
  /** Download URL from Storage (if available). */
  downloadURL: string;
  /** File size in bytes. */
  size: number;
  /** MIME type (e.g. image/png, application/pdf). */
  contentType: string;
}

/** Business information section of an order. */
export interface OrderBusinessInfo {
  businessName: string;
  industry: string;
  yearsInBusiness: string;
  businessDescription: string;
}

/** Contact information section of an order. */
export interface OrderContactInfo {
  contactName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

/** Project details: goals, audience, notes, and color customization. */
export interface OrderProjectDetails {
  goals: string[];
  targetAudience: string;
  additionalNotes: string;
  colorCustomization: ColorCustomization;
}

/** A single section in the persisted layout. Mirrors BlockItem but uses plain string for type. */
export interface OrderLayoutSection {
  id: string;
  type: string;
  label: string;
}

/** Layout configuration produced by the builder, attached to an order. */
export interface OrderLayout {
  desktop: OrderLayoutSection[];
  mobile: OrderLayoutSection[];
}

/**
 * Firestore document shape for a template request order.
 * Stored at users/{userId}/orders/{orderId}.
 * All fields are persisted; no client-only or transient state.
 */
export interface OrderRequest {
  /** Showcase template identifier. */
  templateId: string;
  /** Human-readable template name. */
  templateName: string;
  businessInfo: OrderBusinessInfo;
  contactInfo: OrderContactInfo;
  projectDetails: OrderProjectDetails;
  /** Layout configuration from the builder (section arrangement). */
  layout?: OrderLayout;
  /** Metadata for files uploaded to Storage; no raw File or base64. */
  attachments: OrderAttachment[];
  status: OrderStatus;
  /**
   * When true, order is locked (e.g. being processed). Admin-assignable only.
   * Client must not write this field; edit UI must be disabled when true.
   */
  modificationLocked?: boolean;
  /** Set via serverTimestamp() on create. */
  createdAt: unknown;
  /** Set via serverTimestamp() on create and update. */
  updatedAt: unknown;
}

/**
 * Order document as returned from Firestore with document id attached.
 * Used by orders store and dashboard.
 */
export interface OrderWithId extends OrderRequest {
  id: string;
}

/**
 * When writing to Firestore, createdAt and updatedAt are set via serverTimestamp()
 * in code; they are not literal values in the payload.
 */
