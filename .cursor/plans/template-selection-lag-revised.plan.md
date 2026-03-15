---
name: ""
overview: ""
todos: []
isProject: false
---

# Template Selection Lag and Loading UI — Revised Plan

## Overview

Eliminate perceived lag between choosing a template in the showcase modal and landing on the request editor by: (1) fixing root causes (modal closing before work completes, sequential Firestore round-trips); (2) ensuring the loading indicator paints before any async work; (3) treating navigation-state hydration as an optional fast-path only, with Firestore as the canonical source of truth; (4) preventing concurrent request creation; (5) implementing a minimal, accessible in-modal loading UI that does not cause layout shift or cross-page state leaks. No new libraries; strict architectural discipline.

---

## Design Principles (Non-Negotiable)

1. **Canonical source of truth** — The request page must always be able to reconstruct its state from the route identifier (Firestore). Navigation state is an optional performance optimization for initial paint only; it can be lost on reload, direct link, history restore, or SSR. The request page must remain fully functional without it.
2. **Loading UI before async work** — The loading state must be set and rendered before any asynchronous work runs. Use `nextTick` (or equivalent) so Vue paints the spinner, then start the Firestore transaction. This prevents the main thread from being blocked before the UI updates.
3. **No concurrent request creation** — While `isCreating` is true, modal actions (Choose This Design, Close) and dashboard template selection must be disabled or ignored so that multiple Firestore transactions cannot run concurrently.
4. **Single transaction semantics** — The counter read must happen inside `runTransaction` via `transaction.get(counterRef)`. Compute the next count and write both the order document and the counter atomically. IDs and layout are built outside the transaction (no Firestore read required for them); only the counter is shared state read inside the transaction.
5. **No layout shift or cross-page state leaks** — The spinner is inside the modal only; it must not resize the modal abruptly or shift the page. When navigating away, no modal-specific state (e.g. `document.body.style.overflow`) may persist on the request page. Cleanup must run on modal unmount.
6. **Architectural discipline** — No duplicate layout state, no temporary sync layers, no redundant store updates. Request layout is derived from the request document in Firestore and managed by the request layout store. Hydration from navigation state is for display/initial paint only; the canonical state is from Firestore.

---

## Phase 1 — Audit and Diagnosis (Document in Docs)

- **Reproduction:** Dashboard → click template card → modal opens → click "Choose This Design". Currently: modal closes immediately; no loading indicator; delay = getDoc(counter) + runTransaction + router.push + request page mount + fetchOrder.
- **Root causes to document:** (1) Modal closed before async work. (2) Two Firestore round-trips (getDoc then runTransaction). (3) Optional: redundant fetch on request page when coming from dashboard (mitigated by optional hydration).
- **Deliverable:** Update docs (e.g. `docs/17-DASHBOARD-AND-GALLERY.md`) with the sequence, root causes, and optimizations applied.

---

## Phase 2 — Optimize the Flow

### 2.1 Loading state first, then async work (guarantee spinner paints)

- **File:** `app/pages/dashboard.vue`
- **Flow:**
  1. User clicks "Choose This Design" → modal emits `choose` with `templateId`.
  2. Handler sets `isCreating = true` (and does nothing else yet).
  3. Use `await nextTick()` so Vue commits the update and renders the loading UI in the modal.
  4. Then run: get `uid`, resolve template, call `createDraftRequest(uid, template)`, then `router.push(...)`.
  5. On success: navigation unmounts dashboard and modal. On error: set `isCreating = false`, show toast; modal stays open for retry or close.
- **Do not** call `closeShowcase()` before the async work. The modal stays open and shows the loading state until navigation or error.

### 2.2 Prevent concurrent request creation

- **Dashboard:** While `isCreating` is true, ignore or disable any action that could start another request: do not open another template (e.g. in `openShowcase`, if `isCreating` is true, return early or do nothing). Optionally disable template card clicks via a wrapper or `aria-disabled` and pointer-events.
- **Modal:** Receive a `loading` prop (or `isCreating`). When `loading` is true: disable the "Choose This Design" button and the "Close Preview" button (or only "Choose This Design" and allow Close to cancel — if Close is allowed, document that closing during load does not cancel the in-flight request). Ensure the modal cannot be used to trigger a second request (e.g. double-click or rapid click).
- **Handler:** At the start of `handleChooseDesign`, if `isCreating.value` is already true, return immediately (guard).

### 2.3 Single Firestore transaction

- **File:** `app/composables/useCreateRequest.ts`
- **Change:** Move the counter read inside the transaction. Inside `runTransaction(db, async (transaction) => { ... })`:
  - Call `transaction.get(counterRef)` to read the counter.
  - From the snapshot, compute `newCount` (same logic as today: if doc exists and `data.date === today`, increment; else 1).
  - If `newCount > 3`, throw (or exit and throw after transaction) with limit-exceeded error.
  - Build `orderPayload` (orderId and layout can be built outside the transaction — they do not depend on Firestore state; only the counter does).
  - `transaction.set(orderRef, orderPayload)` and `transaction.set(counterRef, { date: today, count: newCount })`.
- Remove the standalone `getDoc(counterRef)` that currently runs before the transaction. This reduces two round-trips to one.
- **Race conditions:** Generating `orderId` via `doc(collection(...)).id` and building `layout` from the template are pure client-side; no Firestore read. Safe to do outside the transaction.

### 2.4 Optional hydration from navigation state (fast-path only)

- **Composable:** `useCreateRequest.createDraftRequest` may return an optional hydration object (e.g. the order payload with `id: orderId`) for the request page to use for immediate paint. Type it explicitly (e.g. `OrderWithId`-compatible or a dedicated hydration type). This is strictly optional; the request page must not depend on it.
- **Dashboard:** After successful `createDraftRequest`, when calling `router.push`, pass the hydration object in Vue Router state (e.g. `state: { orderFromCreate: hydrationOrder }`) so the request page can use it if present.
- **Request page:** In `loadRequestFromFirebase()`:
  - **Canonical path:** Always be able to load from Firestore using `requestId` (route param). When navigation state is absent (direct URL, reload, history restore), fetch via `ordersStore.fetchOrder(uid, requestId)` and proceed as today.
  - **Fast-path:** If navigation state contains an order object that matches `requestId`, use it to set `orderDoc`, resolve template, init request layout store, and render immediately. Optionally still call `fetchOrder` in the background to sync with Firestore (and update `orderDoc` when it arrives) so the UI stays consistent; or skip fetch when hydration is used to avoid duplicate load. Either way, the page must behave correctly when hydration is absent.
- **No duplicate source of truth:** The request layout store is initialized from the order (either from the hydrated object or from the fetched document). There is no second copy of “current order” that is kept in sync via watchers; one source (Firestore / hydration as a one-time seed) feeds the store.

### 2.5 Cleanup on modal unmount (avoid cross-page UI bugs)

- **Problem:** Dashboard sets `document.body.style.overflow = 'hidden'` when opening the modal. If we no longer call `closeShowcase()` before navigation, the modal unmounts when the user navigates away; we must ensure `overflow` is restored so the request page is not left unscrollable.
- **Fix:** In `ShowcaseModal.vue`, in `onUnmounted`, set `document.body.style.overflow = ''`. Thus whenever the modal is removed (either by close or by navigation), the body is restored. Alternatively, the dashboard can restore overflow in its own `onUnmounted`. Prefer modal cleanup so one place is responsible.
- **Verify:** After "Choose This Design" → loading → navigate to request page, the request page scrolls normally. After opening the modal and then navigating away by another means (e.g. clicking "Back to Dashboard" in navbar), body is still scrollable. No leftover modal state on the request page.

---

## Phase 3 — Loading UI Inside the Modal

- **Component:** `app/components/ShowcaseModal.vue`
- **Props:** Add `loading: boolean`. When `loading` is true:
  - Show a loading state **inside** the existing modal (overlay on the body area or a compact strip in the footer area), not a new full-screen or page-level structure. Use existing design tokens (`--color-primary`, `--color-text-muted`, `--space-`*, `--radius-`*) and no new animation libraries.
  - Spinner: CSS-only or inline SVG + CSS (e.g. rotating circle or stroke-dashoffset). No heavy animation; 60fps-friendly. Add `@media (prefers-reduced-motion: reduce)` to disable or simplify the animation.
  - Copy: one short line, e.g. "Preparing your request…".
  - **Layout:** The loading UI must not change the modal’s size or cause reflow that shifts the rest of the page. It should sit within the current modal container (e.g. overlay on `.modal-body` or a bar above the footer) so the modal does not jump or resize.
- **Accessibility:** When `loading` is true: `aria-busy="true"` on the modal container; `aria-live="polite"` on the message; disable the relevant buttons so the user cannot trigger a second request; keep focus management safe (no focus lost to nowhere). If the close button remains enabled during loading, document behavior (e.g. closing only hides the modal; the request creation continues).
- **Concurrency:** Buttons disabled (and/or dashboard template selection guarded) so only one creation can run at a time.

---

## Phase 4 — State Flow and Correctness

- **Request creation:** One transaction writes the order document (with layout and template info) and the counter. No change to atomicity.
- **Request page:** Always derives order and layout from (a) navigation state (optional, for fast first paint) or (b) Firestore via `fetchOrder`. The request layout store is initialized from that order. No duplicate layout state; no watcher-based syncing between “hydration state” and “Firestore state” as two sources of truth — hydration is a one-time seed when present.
- **Dashboard and modal:** Dashboard owns `isCreating` and passes it to the modal. Modal only displays loading and emits `choose`; it does not own creation state. No redundant flags.

---

## Phase 5 — Validation and Testing

- **Immediate spinner:** On "Choose This Design", the loading indicator appears before any visible delay. Verified on a throttled (e.g. Slow 3G) connection; the spinner is visible while the request is created.
- **Modal remains visible:** Modal stays open (with loading state) until navigation or error. No early close.
- **No concurrent creation:** With loading visible, attempting to click another template or "Choose This Design" again does not start a second request.
- **Navigation and request page:** After transaction completes, navigation to `/gallery/request/:id` occurs. If hydration was passed, request page renders immediately from it; if not (e.g. direct URL or reload), request page loads from Firestore and renders. Reloading the request page always loads from Firestore and shows the correct request.
- **No UI bugs:** Request page is scrollable; no `overflow: hidden` left on body. No layout shift on the dashboard when the spinner appears. No modal-specific state affecting the request page.
- **Errors:** Network or server error during create: toast shown, `isCreating = false`, modal still open for retry or close.
- **Transaction:** Only one Firestore transaction runs; counter is read and written inside the same transaction.

---

## Phase 6 — Accessibility and Performance

- **Spinner:** Keyboard and screen reader: modal has `aria-busy`, message has `aria-live`; buttons disabled. No heavy JS animation; CSS only; respect `prefers-reduced-motion`. No new dependencies.

---

## Phase 7 — Documentation and Deliverables

- **Docs:** Update the chosen doc (e.g. `docs/17-DASHBOARD-AND-GALLERY.md`) with: reproduction steps for the lag, root causes, optimizations (loading-before-async, single transaction, optional hydration), loading UI and accessibility, cleanup and no cross-page state leaks, and the validation checklist above.
- **Code summary:** Short list of modified files and the purpose of each change.

---

## Files to Touch (Summary)


| File                                           | Purpose                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/pages/dashboard.vue`                      | Set `isCreating = true`, then `await nextTick()`, then run create + push; do not call `closeShowcase()` before async work. Guard against concurrent creation (e.g. ignore openShowcase when `isCreating`). Pass `loading` (or `isCreating`) to modal; optionally pass hydration state on push. |
| `app/composables/useCreateRequest.ts`          | Single transaction: read counter with `transaction.get(counterRef)` inside transaction; compute newCount; write order + counter. Return optional hydration object for request page.                                                                                                            |
| `app/components/ShowcaseModal.vue`             | Add `loading` prop; show in-modal loading UI (spinner + message) using tokens; disable actions when loading; `aria-busy`, `aria-live`; no layout shift. In `onUnmounted`, set `document.body.style.overflow = ''` so request page is not left unscrollable.                                    |
| `app/pages/gallery/request/[id]/index.vue`     | In `loadRequestFromFirebase`: if navigation state has order for this `requestId`, use it for immediate render and init request layout store; otherwise (or always in background, per design choice) load from Firestore. Ensure page works when state is absent (direct URL, reload).          |
| Docs (e.g. `docs/17-DASHBOARD-AND-GALLERY.md`) | Document lag, causes, optimizations, loading UI, cleanup, and validation checklist.                                                                                                                                                                                                            |


---

## Constraints (Unchanged)

- No prop mutation; no nested reactive mutation; immutable updates; single source of truth for request data (Firestore).
- Type-safe hydration type; no silencing TypeScript.
- No new heavy libs; no animation frameworks for the spinner.
- Nuxt 4 and Vue Composition API; no CLI in code; optional manual steps in docs only.
- Hydration is an optional fast-path; the request page must always be able to load from Firestore using the route id alone.

