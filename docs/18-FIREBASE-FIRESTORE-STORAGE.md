# Firebase Firestore & Storage — Orders and Attachments

**Persistent order storage and file uploads for template requests.**

---

## Overview

Request orders follow a two-phase lifecycle in Firestore:

1. **Draft creation** — When a user selects a template on the Gallery, a draft order document is created in Firestore (status `draft`) with the initial layout from the template and empty business/contact fields. A daily-limit counter is updated atomically in the same batch.
2. **Form submission** — When the user fills out and submits the request form, the existing draft is updated to status `submitted` with all business info, contact info, project details, uploaded files, and layout.

Only the **modular Firebase SDK** is used (no legacy namespace API). Firestore and Storage logic live in dedicated composables; the UI layer stays thin.

**Orders snapshot lifecycle:** Real-time listeners use Firestore’s WebChannel `Listen` transport (browser DevTools may show `firestore.googleapis.com/.../Listen/channel`). Background tabs often tear those connections down, which produces `net::ERR_CONNECTION_CLOSED` lines that **cannot be fully suppressed from app code** (you may still see occasional lines when a listener is closed or reopened). Mitigation: `useOrdersSnapshotWhenFocused()` **detaches** `onSnapshot` while inactive and **re-subscribes** when active, preserving the in-memory list. When `document.visibilityState === 'hidden'`, the listener is removed immediately; when the tab stays visible but the window loses focus (e.g. minimize), detach is **delayed** briefly to avoid subscribe/detach churn. `detachSnapshotListener()` / `unsubscribeFromOrders()` live on `stores/orders.ts`. Do not clear the order list on transient snapshot errors.

---

## Data Model

### Firestore: User-Scoped Orders

Orders are stored under the authenticated user so that security rules can enforce ownership without client-side filtering.

**Collection path:** `users/{userId}/orders/{orderId}`

- `userId` — from the authenticated user (e.g. Firebase Auth UID). Never taken from form input.
- `orderId` — auto-generated (e.g. Firestore `doc(collection).id`) before uploads so the same ID can be used for the Storage path.

This structure makes it straightforward to enforce: *users can only read and write their own orders*.

### Order Document Shape

Each order document matches the **OrderRequest** type (see `app/types/order.ts`). Do not store raw form objects or unvalidated payloads; map validated form data into this shape before writing.

| Field | Type | Description |
|-------|------|-------------|
| `templateId` | string | Showcase template ID (e.g. `elite-plumbing`). |
| `templateName` | string | Human-readable template name. |
| `businessInfo` | object | `businessName`, `industry`, `yearsInBusiness`, `businessDescription`. |
| `contactInfo` | object | `contactName`, `email`, `phone`, `website`, `address`. |
| `projectDetails` | object | `goals` (string[]), `targetAudience`, `additionalNotes`, `colorCustomization`. |
| `attachments` | array | Metadata for each uploaded file (see below). |
| `layout` | object? | Page layout configuration: `{ blocks: OrderLayoutBlock[], customized: boolean }`. Set on draft creation from the template sections; updated when user saves from the builder. |
| `status` | string | Lifecycle stage: `draft` (initial creation, form not yet submitted), `submitted`, `under_review`, `in_production`, `awaiting_feedback`, `finalizing`, `completed`, `cancelled`. `draft` → `submitted` transition happens on form submission; other transitions are admin-only. Legacy values `in_review`, `in_progress`, `delivered` are supported for display. |
| `modificationLocked` | boolean | Optional. When `true`, order is locked (e.g. being processed). Admin-assignable only; client must not write. Edit UI is disabled when true. |
| `createdAt` | server timestamp | Set via `serverTimestamp()` on create. |
| `updatedAt` | server timestamp | Set via `serverTimestamp()` on create and on later updates. |

No redundant or client-only fields. No `File` objects or base64 blobs in Firestore.

### Attachment Metadata (in Order Document)

Each element of `attachments` has the shape **OrderAttachment**:

| Field | Type | Description |
|-------|------|-------------|
| `originalName` | string | Filename as provided by the user. |
| `storagePath` | string | Full Storage path (e.g. `orders/{userId}/{orderId}/0_logo.png`). |
| `downloadURL` | string | URL from `getDownloadURL()` after upload. |
| `size` | number | File size in bytes. |
| `contentType` | string | MIME type (e.g. `image/png`, `application/pdf`). |

---

## Storage: File Layout

Files are stored under a path that reflects ownership and order:

**Path pattern:** `orders/{userId}/{orderId}/{sanitizedFilename}`

- Prevents collisions and keeps each order’s files in one namespace.
- Filenames are sanitized (no path separators or unsafe characters); a numeric prefix avoids duplicate names (e.g. `0_brand.pdf`, `1_logo.png`).

Files are uploaded **before** the Firestore write. If any upload fails, the order document is **not** written, so the database does not reference missing files.

---

## Request Lifecycle

### Phase 1: Draft Creation

1. **Gallery** (`pages/gallery/index.vue`): User clicks "Choose This Design" on a showcase template.
2. **Composable** (`composables/useCreateRequest.ts`): `createDraftRequest()` executes a Firestore batch write containing:
   - A new order document at `users/{userId}/orders/{newId}` with `status: 'draft'`, initial layout from the template, and empty business/contact fields.
   - A counter update at `users/{userId}/requestLimits/daily` with today's date and incremented count (max 3 per day).
3. **Gallery**: On success, navigates to `/gallery/request/{docId}`. On failure (limit exceeded or other), shows an inline error banner.

### Phase 2: Form Submission

1. **Page** (`pages/gallery/request/[id].vue`): Loads the draft document from Firestore by doc ID; resolves the showcase template for preview; renders the form.
2. On form submit, calls `useOrderUpdate().updateOrder()` with `status: 'submitted'`, validated form data, uploaded files, and layout.
3. **Composable** (`composables/useOrderUpdate.ts`): Uploads files to Storage, then calls `updateDoc` to transition the draft to submitted with all fields populated.
4. **Page**: On success, shows inline confirmation and navigates to gallery. On error, shows inline error message (no `alert()`).

### Layout Persistence

The builder's Save button is handled by **`useBuilderSave`** (`app/composables/useBuilderSave.ts`). It reads the canonical layout from the request layout store via `getLayoutForSubmission()`, then calls `saveLayout(userId, orderId, layout)` from `useCreateRequest()`, which writes the layout to the draft's `layout` field via `updateDoc`. **BuilderEditor** does not perform persistence inline; it only wires the composable. This ensures layout changes persist across page refresh, navigation, and browser close.

**Builder URL and rehydration:** When the user clicks "Customize page layout" on the request page, the app navigates to `/gallery/request/{orderId}/builder`. The route param `orderId` allows the builder to rehydrate layout state after a page refresh or direct navigation while remaining structurally tied to that specific request. On mount, the builder pages use the route `:id` to fetch the order from Firestore and initialize from `order.layout` (or from the template if no layout is saved). If the store is already initialized (e.g. user navigated from the request page), the existing state is preserved to avoid overwriting unsaved changes.

## Daily Request Limit

**Collection path:** `users/{userId}/requestLimits/daily`

A single counter document per user tracks daily request creation:

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date string in `YYYY-MM-DD` format. |
| `count` | number | Number of requests created on that date (max 3). |

The counter is written atomically with the order creation in a Firestore transaction. Security rules validate:
- Counter can only be created with `count == 1`.
- Counter can only be incremented by 1 on the same day, or reset to 1 on a new day.
- Counter can never exceed 3.
- Order creation requires the counter (via `getAfter()`) to show `count <= 3` after the transaction, or allows when the counter document does not yet exist (first request).

This ensures the limit cannot be bypassed by manipulating frontend code.

---

## Reading Orders

Orders for the logged-in user can be read from:

```text
users/{userId}/orders
```

where `userId` is the authenticated user’s UID. The **orders store** (`stores/orders.ts`) subscribes to this collection with `onSnapshot` and `orderBy('createdAt', 'desc')`, exposing a reactive list and `getOrderById` / `fetchOrder` for single-document access. The sites index and order edit page consume this store. The document’s shape is **OrderRequest** (with Firestore timestamps for `createdAt`/`updatedAt`).

**Runtime validation:** All order document reads (snapshot callbacks and `fetchOrder`) must use **`parseOrderDocument(data, documentId)`** from `app/utils/orderValidation.ts` before treating data as typed. Invalid payloads return `null` and are not pushed into store state; only valid `OrderWithId` shapes enter the app.

---

## Issue reports (user feedback)

**Collection path:** `users/{userId}/reports/{reportId}`

Authenticated users can submit **create-only** documents from the client (`addDoc` via **`useIssueReport`** in `app/composables/useIssueReport.ts`). There is no client **read**, **update**, or **delete** — rules deny those operations so reports cannot be listed or tampered with from the app (review happens in Firebase Console or future admin tooling).

**Write path:** Same pattern as orders: user-scoped subcollection under `users/{userId}`. Validation and sanitization run in the composable before write; TypeScript types live in `app/types/issueReport.ts`.

### Report document shape

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Trimmed description; max length enforced in composable and rules. |
| `category` | string | One of: `bug`, `ui`, `account`, `billing`, `other`. |
| `locale` | string | Browser language tag (e.g. `en-US`) or `und` if unavailable. |
| `routePath` | string | App route path when the user submitted (e.g. `/gallery`). |
| `userEmail` | string \| null | Snapshot from auth at submit time. |
| `userDisplayName` | string \| null | Snapshot from auth at submit time. |
| `createdAt` | server timestamp | Set with `serverTimestamp()` on create. |

**Security rules** enforce field allowlists, string lengths, category values, `createdAt == request.time`, and `request.auth.uid == userId` on create. Deploy updated rules when changing this model: `firebase deploy --only firestore` (or paste from `firebase/firestore.rules` in the Console).

---

## Security Rules (in Repo)

Firestore and Storage rules are kept in the project under **`firebase/`** and are the source of truth for access control. The root **`firebase.json`** points the Firebase CLI at these files; do not put rule content in project root.

### Rules Location

| File | Purpose |
|------|---------|
| `firebase/firestore.rules` | Firestore security rules. `users/{userId}/orders/{orderId}` (owner-only; creation requires valid daily counter via `getAfter()`), `users/{userId}/requestLimits/{limitId}` (owner-only; count validation), `users/{userId}/reports/{reportId}` (create-only for owner; validated fields); all other paths explicitly denied. |
| `firebase/storage.rules` | Storage security rules. Only `orders/{userId}/{orderId}/{fileName}` is allowed (owner-only). |
| `firebase.json` (root) | Firebase CLI config; references `firebase/firestore.rules` and `firebase/storage.rules` for deployment. |

### When Usage Changes

When you **add or change** Firestore or Storage usage (new collections, paths, or access patterns), you must:

1. Update the corresponding file: `firebase/firestore.rules` or `firebase/storage.rules`. Add or adjust `match` blocks so only intended callers have access; keep an explicit deny for all other paths in Firestore.
2. Update this doc and any other docs that describe Firebase paths or security (per documentation-integrity).

The Cursor rule **15-firebase-rules.mdc** enforces this: when editing rules or Firestore/Storage usage, the AI should update rules and docs accordingly.

### Deploying Rules

- **CLI (from project root):** `firebase deploy --only firestore`, `firebase deploy --only storage`, or both.
- **Console:** Firebase Console → Firestore or Storage → Rules tab → paste from `firebase/firestore.rules` or `firebase/storage.rules` → Publish.

---

## Types and Files

| File | Purpose |
|------|---------|
| `app/types/order.ts` | `OrderRequest`, `OrderWithId`, `OrderLayout`, `OrderLayoutBlock` (alias of `BlockItem`), `OrderAttachment`, `OrderStatus`, `OrderBusinessInfo`, `OrderContactInfo`, `OrderProjectDetails`. |
| `app/utils/orderValidation.ts` | `validateOrderRequest()`, `parseOrderDocument()` — runtime guards at Firestore boundary; use before accepting order data into store. |
| `app/stores/orders.ts` | Subscribes to user orders; uses `parseOrderDocument()` in snapshot and `fetchOrder`; exposes list, `getOrderById`, `fetchOrder`, `detachSnapshotListener`, status/date helpers. |
| `app/composables/useOrdersSnapshotWhenFocused.ts` | Subscribes while the tab is visible and the window has focus; detaches the listener when inactive to avoid idle WebChannel teardown noise. |
| `app/composables/useCreateRequest.ts` | `createDraftRequest()`: batch write of draft order + daily counter. `saveLayout()`: persist layout to an existing order. |
| `app/composables/useOrderSubmission.ts` | `submitOrder()`: upload files to Storage, then write order to Firestore (used for standalone submissions). |
| `app/composables/useOrderUpdate.ts` | `updateOrder()`, `orderToFormData()`: update existing order (now supports `status` field for draft→submitted transition). |
| `app/types/issueReport.ts` | `IssueReportCategory`, `IssueReportFormInput`, `IssueReportDocument` — issue report shapes for Firestore. |
| `app/composables/useIssueReport.ts` | `submitReport()`: validated `addDoc` to `users/{userId}/reports/{reportId}`. |
| `app/plugins/firebase.client.ts` | Initializes Firebase app and Auth; composables use `getFirebaseApp()` for Firestore and Storage. |
| `firebase/firestore.rules` | Firestore security rules; deploy with `firebase deploy --only firestore`. |
| `firebase/storage.rules` | Storage security rules; deploy with `firebase deploy --only storage`. |
| `firebase.json` | CLI config; references rules in `firebase/`. |

---

## Error Handling

- **OrderSubmissionError** is thrown when Firebase is not configured, user id is missing, an upload fails, or the Firestore write fails. The message is suitable to show in the UI.
- If uploads fail, no order document is created. If the Firestore write fails after uploads succeed, the files remain in Storage; the user can retry (duplicate uploads can be handled by idempotent paths or cleanup logic if needed later).

---

**Last Updated:** March 2026

---

## Summary

- Orders: Firestore `users/{userId}/orders/{orderId}` (status lifecycle: `draft` → `submitted` → admin stages); Storage `orders/{userId}/{orderId}/{fileName}`.
- Daily limit: Firestore `users/{userId}/requestLimits/daily` (counter with date; max 3 per day).
- Issue reports: Firestore `users/{userId}/reports/{reportId}` (create-only from client; no client read/update/delete).
- Rules: `firebase/firestore.rules` and `firebase/storage.rules`; update them and docs when usage changes (see Cursor rule 15-firebase-rules).
