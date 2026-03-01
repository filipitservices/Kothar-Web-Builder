/**
 * Order and Template Request Types
 *
 * Type definitions for persisted template request orders in Firestore.
 * These types represent the exact document shape stored; do not store raw form objects.
 */

import type { ColorCustomization } from '~/types/templateRequest';

/** Order lifecycle status. */
export type OrderStatus = 'submitted' | 'in_review' | 'in_progress' | 'delivered' | 'cancelled';

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
  /** Metadata for files uploaded to Storage; no raw File or base64. */
  attachments: OrderAttachment[];
  status: OrderStatus;
  /** Set via serverTimestamp() on create. */
  createdAt: unknown;
  /** Set via serverTimestamp() on create and update. */
  updatedAt: unknown;
}

/**
 * When writing to Firestore, createdAt and updatedAt are set via serverTimestamp()
 * in code; they are not literal values in the payload.
 */
