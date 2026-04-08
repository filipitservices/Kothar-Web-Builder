/**
 * Order and Template Request Types
 *
 * Type definitions for persisted template request orders in Firestore.
 * These types represent the exact document shape stored; do not store raw form objects.
 */

import type { ColorCustomization, LocationData } from '~/types/templateRequest';
import type { BlockItem } from '~/types/builder';

/**
 * A single block in the page layout.
 *
 * Canonical layout representation shared between the builder and persistence:
 * this is intentionally aliasing the builder's `BlockItem` so the same shape is
 * used end‑to‑end (builder UI ↔ layout store ↔ Firestore payloads).
 */
export type OrderLayoutBlock = BlockItem;

export type BuilderTextEmphasis = 'normal' | 'bold' | 'italic';

export interface BuilderTextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  emphasis: BuilderTextEmphasis;
}

export interface BuilderScreenAnnotations {
  strokes: unknown[];
  textBoxes: BuilderTextBox[];
}

export interface BuilderAnnotations {
  version: 1;
  desktop: BuilderScreenAnnotations;
  mobile: BuilderScreenAnnotations;
}

/** Page layout configuration stored with the order. */
export interface OrderLayout {
  blocks: OrderLayoutBlock[];
  /** True when the user has modified the layout from the original template arrangement. */
  customized: boolean;
  /** Persisted drawing/text annotations for builder overlays. */
  builderAnnotations?: BuilderAnnotations;
}

/**
 * Order lifecycle status. Strict union.
 * 'draft' is set on initial creation (before user submits the form).
 * 'submitted' is set when the user completes and submits the request form.
 * Other statuses are admin-assignable only; clients must not mutate them.
 */
export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'in_production'
  | 'awaiting_feedback'
  | 'finalizing'
  | 'completed'
  | 'cancelled';

/** Status for newly created draft requests (before form submission). */
export const ORDER_STATUS_DRAFT: OrderStatus = 'draft';

/** Status after the user completes and submits the request form. */
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
  preferredUrl: string;
  location: LocationData;
  industry: string;
  customIndustry: string;
}

/** Contact information section of an order. */
export interface OrderContactInfo {
  contactName: string;
  email: string;
  phone: string;
  website: string;
}

/** Project details: goals, audience, notes, categories, and color customization. */
export interface OrderProjectDetails {
  goals: string[];
  audienceTags: string[];
  additionalNotes: string;
  requestCategories: string[];
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
  /** Page layout configuration (template sections + any builder modifications). */
  layout?: OrderLayout;
  /** Metadata for brand material files uploaded to Storage. */
  attachments: OrderAttachment[];
  /** Metadata for logo files uploaded to Storage (separate from brand material). */
  logoAttachments: OrderAttachment[];
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
