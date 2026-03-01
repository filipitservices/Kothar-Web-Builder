# Firebase Firestore & Storage — Orders and Attachments

**Persistent order storage and file uploads for template requests.**

---

## Overview

When a user submits the template request form (`/gallery/request/[id]`), the application:

1. Validates the form (via `useTemplateRequestValidation`).
2. Uploads all selected files to **Firebase Storage** under a user- and order-scoped path.
3. Writes a structured **Firestore** order document that references those files and the rest of the request data.

Only the **modular Firebase SDK** is used (no legacy namespace API). Firestore and Storage logic live in a dedicated composable; the UI layer stays thin.

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
| `status` | string | One of: `submitted`, `in_review`, `in_progress`, `delivered`, `cancelled`. |
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

## Submission Flow

1. **Page** (`pages/gallery/request/[id].vue`): On form submit, ensures user is authenticated and template exists; sets `isSubmitting`; calls `useOrderSubmission().submitOrder(...)` with `userId`, `templateId`, `templateName`, validated `formData`, and `files`.
2. **Composable** (`composables/useOrderSubmission.ts`):
   - Resolves Firebase app (client plugin); gets Firestore and Storage.
   - Creates a new order document reference to obtain `orderId`.
   - Uploads each file to `orders/{userId}/{orderId}/{sanitizedFilename}`; collects `OrderAttachment` metadata (including `getDownloadURL`). On any upload failure, throws and does **not** write Firestore.
   - Maps form data into `OrderRequest` (businessInfo, contactInfo, projectDetails, attachments, status, `serverTimestamp()` for `createdAt`/`updatedAt`).
   - Writes the order with `setDoc` to `users/{userId}/orders/{orderId}`.
3. **Page**: On success, shows confirmation and navigates (e.g. to dashboard). On error, shows message and clears `isSubmitting`.

Validation is done in the form/composable layer before submission; the order layer does not re-validate, but only maps and persists.

---

## Reading Orders

Orders for the logged-in user can be read from:

```text
users/{userId}/orders
```

where `userId` is the authenticated user’s UID. Query this collection (e.g. with `collection()`, `query()`, `orderBy('createdAt', 'desc')`) to list or paginate a user’s orders. The document shape is **OrderRequest** (with Firestore timestamps for `createdAt`/`updatedAt`).

---

## Security Rules (in Repo)

Firestore and Storage rules are kept in the project under **`firebase/`** and are the source of truth for access control. The root **`firebase.json`** points the Firebase CLI at these files; do not put rule content in project root.

### Rules Location

| File | Purpose |
|------|---------|
| `firebase/firestore.rules` | Firestore security rules. Only `users/{userId}/orders/{orderId}` is allowed (owner-only); all other paths explicitly denied. |
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
| `app/types/order.ts` | `OrderRequest`, `OrderAttachment`, `OrderStatus`, `OrderBusinessInfo`, `OrderContactInfo`, `OrderProjectDetails`. |
| `app/composables/useOrderSubmission.ts` | `submitOrder()`: upload files to Storage, then write order to Firestore. Uses modular Firebase only. |
| `app/plugins/firebase.client.ts` | Initializes Firebase app (and Auth); composable uses `getFirebaseApp()` for Firestore and Storage. |
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

- Orders: Firestore `users/{userId}/orders/{orderId}`; Storage `orders/{userId}/{orderId}/{fileName}`.
- Rules: `firebase/firestore.rules` and `firebase/storage.rules`; update them and docs when usage changes (see Cursor rule 15-firebase-rules).
