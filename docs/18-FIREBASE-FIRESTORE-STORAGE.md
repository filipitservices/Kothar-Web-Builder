# Firebase Firestore & Storage — Orders and Attachments

**Persistent order storage and file uploads for template requests.**

---

## Overview

Request orders follow a two-phase lifecycle in Firestore:

1. **Draft creation** — When a user selects a template on the Gallery, a draft order document is created in Firestore (status `draft`) with the initial layout from the template and empty business/contact fields. A daily-limit counter is updated atomically in the same batch.
2. **Form submission** — When the user fills out and submits the request form, the existing draft is updated to status `submitted` with all business info, contact info, project details, uploaded files, and layout.

Only the **modular Firebase SDK** is used (no legacy namespace API) for orders and attachments. Firestore and Storage logic for those domains live in dedicated composables; the UI layer stays thin. **Issue reports** are written only from the server via the Admin SDK (see **Issue reports** below). **Whop subscription access** is stored at `users/{userId}/access/billing` and is **server-written only** (webhooks + Admin SDK); the client may read it for UX, but **Firestore rules** enforce entitlement on order updates (see **Whop access and order writes** below).

**Orders snapshot lifecycle:** Real-time listeners use Firestore’s WebChannel `Listen` transport (browser DevTools may show `firestore.googleapis.com/.../Listen/channel`). Background tabs often tear those connections down, which produces `net::ERR_CONNECTION_CLOSED` lines that **cannot be fully suppressed from app code** (you may still see occasional lines when a listener is closed or reopened). Mitigation: `useOrdersSnapshotWhenFocused()` **detaches** `onSnapshot` while inactive and **re-subscribes** when active, preserving the in-memory list. When `document.visibilityState === 'hidden'`, the listener is removed immediately; when the tab stays visible but the window loses focus (e.g. minimize), detach is **delayed** briefly to avoid subscribe/detach churn. `detachSnapshotListener()` / `unsubscribeFromOrders()` live on `stores/orders.ts`. Do not clear the order list on transient snapshot errors.

---

## Data Model

### Firestore: User-Scoped Orders

Orders are stored under the authenticated user so that security rules can enforce ownership without client-side filtering.

**Collection path:** `users/{userId}/orders/{orderId}`

- `userId` — from the authenticated user (e.g. Firebase Auth UID). Never taken from form input.
- `orderId` — auto-generated (e.g. Firestore `doc(collection).id`) before uploads so the same ID can be used for the Storage path.

This structure makes it straightforward to enforce: *users can only read and write their own orders*.

### Firestore: Whop access snapshot (server-written)

**Collection path:** `users/{userId}/access/billing` (fixed document id `billing` under subcollection `access`; see `app/constants/access.ts`).

| Field | Type | Description |
|-------|------|-------------|
| `hasAccess` | boolean | When `true`, the user may submit a template request and update submitted orders (enforced by security rules). |
| `whopMembershipId` | string \| null | Whop membership id (for support / debugging). |
| `whopUserId` | string \| null | Whop user id when present on webhook payloads. |
| `validUntil` | string \| null | Optional ISO timestamp for membership boundary. |
| `source` | string | `webhook` or `reconcile`. |
| `updatedAt` | server timestamp | Set on each upsert. |

**Write path:** Firebase Admin only — `POST /api/webhooks/whop` (verified with `@whop/sdk` Standard Webhooks unwrap), **`server/utils/access-billing.ts`**, and **`server/utils/whop-access-reconcile.ts`** (reconcile may set `hasAccess` to `false` when Whop denies access). Clients **cannot** write this document (rules deny).

**Read path:** Owner can read for UI; **`GET /api/access/me`** returns `{ hasAccess, pending }` for **`useWhopAccess`**. When **`NUXT_WHOP_API_KEY`** is set and **either** **`NUXT_WHOP_PRODUCT_ID`** **or** **`NUXT_WHOP_PLAN_ID`** is set, every request runs **`syncBillingAccessFromWhop`**: it resolves the **product id** from `NUXT_WHOP_PRODUCT_ID` or, if omitted, from Whop **`plans.retrieve(plan_id)`** (same plan as checkout). It then resolves candidate Whop user ids from the billing doc’s `whopUserId` and—when **`NUXT_WHOP_COMPANY_ID`** is set—from **`members.list({ company_id, product_ids, query: email })`**, then **`users.checkAccess(productId, { id })`** per candidate. Responses use **snake_case and camelCase** (`has_access` / `hasAccess`, `access_level` / `accessLevel`). If any candidate indicates access, Firestore is upserted `hasAccess: true`; if any definitively denies and none grant, **`hasAccess: false`**. If **no candidates** while the doc still has `hasAccess: true`, or if the live check is **inconclusive** (API errors, unknown payloads, missing product on plan) while the doc still says true, the handler **upserts `hasAccess: false`** so Firestore rules stay aligned (fail closed). Without a Whop API key, **`GET /api/access/me`** falls back to the Firestore snapshot only (webhook-only; unreliable if webhooks miss).

**User mapping:** Checkout sessions are created with `metadata.firebase_uid` set to the Firebase uid (`WHOP_METADATA_FIREBASE_UID`). Whop copies checkout metadata onto **payments** and **memberships**; webhooks resolve `firebase_uid` from **`data.metadata`** first, then **`data.membership?.metadata`**, so payment-only payloads still map to the correct Firestore user.

### Order Document Shape

Each order document matches the **OrderRequest** type (see `app/types/order.ts`). Do not store raw form objects or unvalidated payloads; map validated form data into this shape before writing.

| Field | Type | Description |
|-------|------|-------------|
| `templateId` | string | Showcase template ID (e.g. `elite-plumbing`). |
| `templateName` | string | Human-readable template name. |
| `businessInfo` | object | `businessName`, `preferredUrl`, `location` (`LocationData` with `displayName`, `city?`, `state?`, `country?`, `postcode?`, `lat?`, `lon?`, `verified`), `industry`, `customIndustry`. |
| `contactInfo` | object | `contactName`, `email`, `phone`, `website`. |
| `projectDetails` | object | `goals` (string[]), `audienceTags` (string[]), `additionalNotes`, `requestCategories` (string[]), `colorCustomization`. |
| `attachments` | array | Metadata for brand material files (see below). |
| `logoAttachments` | array | Metadata for logo files (same shape as attachments). |
| `layout` | object? | Page layout configuration: `{ blocks: OrderLayoutBlock[], customized: boolean }`. Set on draft creation from the template sections; updated when user saves from the builder. |
| `status` | string | Lifecycle stage: `draft` (initial creation, form not yet submitted), `submitted`, `under_review`, `in_production`, `awaiting_feedback`, `finalizing`, `completed`, `cancelled`. `draft` → `submitted` transition happens on form submission; other transitions are admin-only. Legacy values `in_review`, `in_progress`, `delivered` are supported for display. |
| `modificationLocked` | boolean | Optional. When `true`, order is locked (e.g. being processed). Admin-assignable only; client must not write. Edit UI is disabled when true. |
| `createdAt` | server timestamp | Set via `serverTimestamp()` on create. |
| `updatedAt` | server timestamp | Set via `serverTimestamp()` on create and on later updates. |

No redundant or client-only fields. No `File` objects or base64 blobs in Firestore.

**`businessInfo.location`:** Optional subfields (`city`, `state`, `country`, `postcode`, `lat`, `lon`) are stored only when they have valid values (non-empty normalized strings or finite coordinates). The Firestore **modular Web SDK** rejects `undefined` anywhere in the write payload, so the app never sends explicit `undefined` for nested keys. **`normalizeLocationData()`** (via **`normalizeTemplateRequestFormData()`** in `app/utils/requestInputNormalization.ts`) runs on form data before **`useOrderUpdate`** / **`useOrderSubmission`** call **`updateDoc`** or **`setDoc`**.

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

### Discarding a draft (before submission)

Only **`status: 'draft'`** orders may be deleted by the owner (`modificationLocked` must not be true). The client calls **`deleteDraftRequest()`** (`app/composables/useDeleteDraftRequest.ts`):

1. **Firestore transaction:** Re-read the order; verify draft + not locked; **`delete`** the order document. The daily **`requestLimits/daily`** counter is **not** updated — creation counts toward the limit even after the draft is removed.
2. **Storage:** After the transaction succeeds, **`listAll`** on **`orders/{userId}/{orderId}/`** and **`deleteObject`** each item so attachment blobs are not left behind. Failures are handled per composable (logged / surfaced); the Firestore document is already gone.

**UI:** **`DeleteDraftRequestModal`** on **`/sites`** (My Sites → Orders). **`SitesOrdersPanel`** shows a compact **trash** control (draft-only, not locked) in a fixed-width **Actions** slot; the panel emits **`delete-draft`** and the page runs the composable. Confirmation uses the same modal shell as **`SubmissionAccessModal`** (no `window.confirm`).

### Phase 2: Form Submission

1. **Page** (`pages/gallery/request/[id]/index.vue`): Loads the draft document from Firestore by doc ID; resolves the showcase template for preview; renders the form.
2. On form submit (after validation), **`useDraftRequestSubmitFlow()`** runs: **`updateOrder`** keeps **`status` as `draft`** with full form, attachments, and layout, then **`POST /api/orders/finalize-draft`** (session cookie, `{ orderId }`). The server verifies the order is **draft**, runs live access + membership policy, and only then **Admin-updates** **`status` to `submitted`**. If access is denied, response is **`{ ok: false, reason: 'subscription_required' }`** (HTTP 200); the UI shows the **access modal** — order stays **draft**. On **`{ ok: true }`**, **`requestLayoutStore.reset()`** and navigate to **`/sites?tab=orders`**. **`/orders/[id]/edit`** uses the same composable for **draft**; **non-draft** updates still use **`fetchAccessFromServer()`** + client `updateOrder` + rules.
3. **Composable** (`composables/useOrderUpdate.ts`): Uploads files to Storage, then calls `updateDoc` for **draft** saves only; **`draft → submitted`** for the request flow is **not** done via client `updateDoc` (see finalize-draft above).
4. **Resume after payment:** The user continues from **My Sites → Orders → Modify** (`/orders/{id}/edit`); data is read from Firestore, not from in-memory form state.
5. **Page**: On error, shows inline error message (no `alert()`).

The **builder** and **layout save** (`saveLayout`) do not require Whop access. **Submitting** a template request uses **server** finalization (`finalize-draft`); **updating a non-draft** order still uses client writes gated by **`hasAccess`** in Firestore rules and **`fetchAccessFromServer()`** on the page.

### Layout Persistence

The builder's Save button is handled by **`useBuilderSave`** (`app/composables/useBuilderSave.ts`). It reads the canonical layout from the request layout store via `getLayoutForSubmission()`, then calls `saveLayout(userId, orderId, layout)` from `useCreateRequest()`, which writes the layout to the draft's `layout` field via `updateDoc`. **BuilderEditor** does not perform persistence inline; it only wires the composable. This ensures layout changes persist across page refresh, navigation, and browser close.

**Builder URL and rehydration:** When the user clicks "Customize page layout" on the request page, the app navigates to `/gallery/request/{orderId}/builder`. The route param `orderId` allows the builder to rehydrate layout state after a page refresh or direct navigation while remaining structurally tied to that specific request. On mount, the builder pages use the route `:id` to fetch the order from Firestore and initialize from `order.layout` (or from the template if no layout is saved). If the store is already initialized (e.g. user navigated from the request page), the existing state is preserved to avoid overwriting unsaved changes.

## Daily Request Limit

**Collection path:** `users/{userId}/requestLimits/daily`

A single counter document per user tracks daily request creation:

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date string in `YYYY-MM-DD` format. |
| `count` | number | Number of **draft creations** on that local calendar date (max 3). Does not decrease when a draft is deleted. |

The counter is written atomically with the order creation in a Firestore transaction. Security rules validate:
- Counter can only be created with `count == 1`.
- Counter can only be incremented by 1 on the same day, or reset to 1 on a new day (first creation of a new local date).
- Counter can never exceed 3.
- Order creation requires the counter (via `getAfter()`) to show `count <= 3` after the transaction, or allows when the counter document does not yet exist (first request).

This ensures the limit cannot be bypassed by manipulating frontend code.

---

## Abandoned template drafts (server cleanup)

Choosing a design creates a **draft** order immediately. If the user leaves before saving meaningful data, the document can sit in Firestore unchanged from its initial shape.

**Eligible for removal** (all must hold):

- `status` is **`draft`**, `modificationLocked` is not **`true`**
- `createdAt` is older than **24 hours** (server time)
- **No persisted progress:** `attachments` and `logoAttachments` are empty arrays; all `businessInfo` and `contactInfo` strings are empty after trim; `projectDetails.goals` is empty and `audienceTags` / `additionalNotes` / `requestCategories` are empty after trim
- **`layout` is missing or `layout.customized === false`** (builder save sets `customized: true`; those drafts are kept)

**Implementation:** [`server/utils/abandoned-draft-cleanup.ts`](../server/utils/abandoned-draft-cleanup.ts) runs a paginated **`collectionGroup('orders')`** query (`status == 'draft'`, `createdAt` before cutoff, `orderBy('createdAt')`), applies the predicate above, deletes each matching document with the Admin SDK, then deletes Storage objects under **`orders/{userId}/{orderId}/`**. This does **not** change **`requestLimits/daily`** (creation counts remain as under [Daily Request Limit](#daily-request-limit)).

**HTTP entrypoint:** **`POST /api/cron/cleanup-abandoned-drafts`** ([`server/api/cron/cleanup-abandoned-drafts.post.ts`](../server/api/cron/cleanup-abandoned-drafts.post.ts)). Requires server config **`NUXT_ABANDONED_DRAFT_CRON_SECRET`**: send the same value in header **`x-cron-secret`** or **`Authorization: Bearer <secret>`**. Returns **`{ ok: true, scanned, deleted }`**. Responds **401** if the secret is wrong or missing, **503** if the secret or Firebase Admin is not configured.

**Scheduling:** Firebase App Hosting does not run cron jobs. Use **Google Cloud Scheduler** (or another scheduler) to POST to your deployed URL on an interval (e.g. hourly).

**Index:** Deploy [`firebase/firestore.indexes.json`](../firebase/firestore.indexes.json) — composite **collection group** on **`orders`**: `status` ASC, `createdAt` ASC (`firebase deploy --only firestore:indexes`).

---

## Reading Orders

Orders for the logged-in user can be read from:

```text
users/{userId}/orders
```

where `userId` is the authenticated user’s UID. The **orders store** (`stores/orders.ts`) subscribes to this collection with `onSnapshot` and `orderBy('createdAt', 'desc')`, exposing a reactive list and `getOrderById` / `fetchOrder` for single-document access. The sites index and order edit page consume this store. The document’s shape is **OrderRequest** (with Firestore timestamps for `createdAt`/`updatedAt`).

**Runtime validation:** All order document reads (snapshot callbacks and `fetchOrder`) must use **`parseOrderDocument(data, documentId)`** from `app/utils/orderValidation.ts` before treating data as typed. Invalid payloads return `null` and are not pushed into store state; only valid `OrderWithId` shapes enter the app.

---

## Issue reports (support / feedback)

Reports are stored per user at:

**Collection path:** `users/{userId}/reports/{reportId}`

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | One of: `bug`, `ux_confusion`, `account`, `performance`, `feature_request`, `other` (see `app/types/issueReport.ts`). |
| `message` | string | Sanitized user description (length validated server-side). |
| `submitterEmail` | string \| null | From verified session claims (not from raw client input). |
| `submitterDisplayName` | string \| null | From verified session claims. |
| `userAgent` | string \| null | Truncated `User-Agent` header from the HTTP request (max 512 chars). |
| `source` | string | `web` — origin of the submission. |
| `createdAt` | server timestamp | `FieldValue.serverTimestamp()` on write (Admin SDK). |

**Write path:** `POST /api/reports/issue` (`server/api/reports/issue.post.ts`). The handler verifies the **session cookie** (same model as `GET /api/user/landing-destination`), validates the JSON body with **`validateIssueReportInput`** from `app/utils/issueReportValidation.ts`, then **`collection('users').doc(uid).collection('reports').add(...)`** using **Firebase Admin**. The authenticated user id comes only from the verified session, never from the request body.

**Client:** Pages use **`useIssueReport()`** (`app/composables/useIssueReport.ts`), which calls the API only — no Firestore calls in Vue components for this feature.

**Security rules:** Client SDK access to `users/{userId}/reports/{reportId}` is **denied** (`allow read, write: if false`). The Admin SDK bypasses security rules for trusted server writes; this prevents browsers from reading others’ reports or writing arbitrary documents while keeping rules explicit for defense in depth.

---

## Whop access and order writes

Security rules require `users/{userId}/access/billing` to exist with `hasAccess == true` when:

- The order transitions **draft → submitted**, or  
- The order is **not** in `draft` (e.g. the user updates a submitted request on `/orders/[id]/edit`).

While **status stays `draft`**, the owner may update the order without Whop access (this covers **`saveLayout`** — typically `layout` and `updatedAt` only). The owner may also **delete** a draft order (rules: draft only, not locked) without Whop access. The builder and request editor remain usable without a subscription; gating applies only to submission and to updates on non-draft orders.

## Whop webhooks

Configure a company (or app) webhook in the Whop dashboard pointing to **`POST /api/webhooks/whop`** on your deployed origin. Subscribe to **`membership.activated`**, **`membership.deactivated`**, and **`payment.succeeded`** so entitlement updates when metadata appears on the payment object before or without a full membership payload. The handler verifies the payload with the official **`@whop/sdk`** (Standard Webhooks) using **`NUXT_WHOP_WEBHOOK_SECRET`**. Never expose that secret to the client.

**Metadata resolution:** For each event, the server resolves `firebase_uid` from **`data.metadata`**, then **`data.membership?.metadata`**. **`payment.succeeded`** grants access when a uid is found and upserts `users/{uid}/access/billing` with **`merge: true`** (idempotent). Membership activate/deactivate use the same helper first.

**`membership.deactivated` without metadata:** If checkout metadata is missing, the handler tries **Admin `collectionGroup` queries** on the `access` subcollection: match **`whopUserId`** to `data.user.id`, then **`whopMembershipId`** to `data.id` (membership id). Deploy **`firebase/firestore.indexes.json`** (`firebase deploy --only firestore:indexes`) so those queries are indexed.

---

## Security Rules (in Repo)

Firestore and Storage rules are kept in the project under **`firebase/`** and are the source of truth for access control. The root **`firebase.json`** points the Firebase CLI at these files; do not put rule content in project root.

### Rules Location

| File | Purpose |
|------|---------|
| `firebase/firestore.rules` | Firestore security rules. `users/{userId}/orders/{orderId}` (owner-only; **create/update** require valid order content shape and bounded field sizes in addition to lifecycle checks; **create** still requires daily counter and either `status == draft` or (`submitted` and `hasWhopAccess`); **delete** only if `status == draft` and `modificationLocked != true`; submit and non-draft updates require Whop access per **Whop access and order writes** above), `users/{userId}/access/{docId}` (owner read; client write denied), `users/{userId}/requestLimits/{limitId}` (owner-only; increment or new-day reset only — **no decrement** on draft delete), `users/{userId}/reports/{reportId}` (client denied; server writes via Admin only); all other paths explicitly denied. |
| `firebase/firestore.indexes.json` | Collection group indexes on `access` (`whopMembershipId`, `whopUserId`) for webhook billing lookup; collection group on **`orders`** (`status`, `createdAt`) for abandoned-draft cleanup. Deploy with `firebase deploy --only firestore:indexes`. |
| `firebase/storage.rules` | Storage security rules. Only `orders/{userId}/{orderId}/{fileName}` is allowed (owner-only). |
| `firebase.json` (root) | Firebase CLI config; references `firebase/firestore.rules`, `firebase/firestore.indexes.json`, and `firebase/storage.rules` for deployment. |

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
| `app/utils/requestLimitDate.ts` | `formatLocalDateKey(date)`, `todayLocalDateKey()` — shared local `YYYY-MM-DD` for daily limit counter `date` on create. |
| `app/composables/useCreateRequest.ts` | `createDraftRequest()`: transaction of draft order + daily counter. `saveLayout()`: persist layout to an existing order. |
| `app/composables/useDeleteDraftRequest.ts` | `deleteDraftRequest()`: transaction deletes draft order only; then Storage prefix cleanup under `orders/{userId}/{orderId}/`. |
| `app/composables/useOrderSubmission.ts` | `submitOrder()`: upload files to Storage, then write order to Firestore (used for standalone submissions). |
| `app/composables/useOrderUpdate.ts` | `updateOrder()`, `orderToFormData()`: update existing order (now supports `status` field for draft→submitted transition). |
| `app/plugins/firebase.client.ts` | Initializes Firebase app and Auth; composables use `getFirebaseApp()` for Firestore and Storage. |
| `firebase/firestore.rules` | Firestore security rules; deploy with `firebase deploy --only firestore`. |
| `firebase/storage.rules` | Storage security rules; deploy with `firebase deploy --only storage`. |
| `firebase.json` | CLI config; references rules in `firebase/`. |
| `app/types/issueReport.ts` | Categories, `IssueReportCreateInput`, `IssueReportSubmitResponse`, `IssueReportDocument`. |
| `app/utils/issueReportValidation.ts` | `validateIssueReportInput()`, `issueReportCategoryLabel()` — shared by API and client. |
| `app/composables/useIssueReport.ts` | `submitReport()` — `$fetch` to `POST /api/reports/issue` only. |
| `server/api/reports/issue.post.ts` | Session verification + Admin Firestore `add()` for reports. |
| `app/stores/whopAccess.ts` | Cached result of `GET /api/access/me`; reset on sign-out. |
| `app/composables/useWhopAccess.ts` | `ensureLoaded`, `openCheckout`, `refresh` — single client entry for entitlement UX. |
| `server/api/access/me.get.ts` | Session + Admin read; live Whop sync when API key + product/plan are set. |
| `server/api/orders/finalize-draft.post.ts` | Session + Admin draft order + **`assertWhopProductAccess`** + Admin `status: submitted`. |
| `server/utils/abandoned-draft-cleanup.ts` | **`isPristineAbandonedDraft()`**, **`runAbandonedDraftCleanup()`** — Admin `collectionGroup('orders')` + Storage prefix delete for stale empty drafts. |
| `server/api/cron/cleanup-abandoned-drafts.post.ts` | **`NUXT_ABANDONED_DRAFT_CRON_SECRET`** (`x-cron-secret` or Bearer); invokes cleanup runner. |
| `server/utils/whop-assert-access.ts` | **`evaluateWhopProductAccess`** / **`assertWhopProductAccess`** — shared live `checkAccess` (no Firestore writes). |
| `server/api/billing/checkout-session.post.ts` | Session + Whop `checkoutConfigurations.create` with `metadata.firebase_uid`. |
| `server/api/webhooks/whop.post.ts` | Raw body + SDK unwrap + Admin `upsertAccessBilling`. |
| `server/utils/whop-client.ts` | Constructs Whop SDK clients for API vs webhook verification. |
| `server/utils/access-billing.ts` | Admin upsert for `access/billing`. |
| `server/utils/whop-access-reconcile.ts` | Wraps **`evaluateWhopProductAccess`** + billing upserts for **`GET /api/access/me`**. |
| `server/utils/access-billing-lookup.ts` | `collectionGroup` resolve Firebase uid for webhooks when metadata is missing. |

---

## Error Handling

- **OrderSubmissionError** is thrown when Firebase is not configured, user id is missing, an upload fails, or the Firestore write fails. The message is suitable to show in the UI.
- If uploads fail, no order document is created. If the Firestore write fails after uploads succeed, the files remain in Storage; the user can retry (duplicate uploads can be handled by idempotent paths or cleanup logic if needed later).

---

**Last Updated:** March 2026

---

## Summary

- Orders: Firestore `users/{userId}/orders/{orderId}` (status lifecycle: `draft` → `submitted` → admin stages; submit/non-draft updates gated by `users/{userId}/access/billing` in rules); Storage `orders/{userId}/{orderId}/{fileName}`.
- Whop: `users/{userId}/access/billing` (server-only writes; live `checkAccess` on `GET /api/access/me` when API + product id configured); `POST /api/billing/checkout-session`, `POST /api/webhooks/whop`.
- Daily limit: Firestore `users/{userId}/requestLimits/daily` (counter with date; max 3 **creations** per local calendar day; deleting a draft does not reduce the count).
- Issue reports: Firestore `users/{userId}/reports/{reportId}` via **Admin SDK** from `POST /api/reports/issue`; client Firestore rules deny this path.
- Rules: `firebase/firestore.rules` and `firebase/storage.rules`; update them and docs when usage changes (see Cursor rule 15-firebase-rules).
