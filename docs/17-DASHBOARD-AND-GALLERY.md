# Gallery & Template System

> **Document Version:** 3.0
> **Last Updated:** March 2026
> **Status:** Production

## Overview

The Gallery serves as the authenticated central hub for Kothar, providing users with immediate access to both the website builder and a curated showcase of professional templates—all in one cohesive experience.

**Key Architecture Decision:** Templates are integrated directly into the Gallery rather than existing as a separate page. This creates a more focused, intentional user experience where users can discover templates naturally without navigating away from their central workspace.

### System Separation

| System | Purpose | Data Source | User Flow |
|--------|---------|-------------|-----------|
| **Builder Templates** | Starting points for DIY website building | `stores/templates.ts` | Gallery → Builder → Select template → Edit blocks |
| **Showcase Templates** | Professional designs for managed services | `stores/showcase.ts` | Gallery → Preview → Request form → Consultation |

---

## Architecture

### Navigation Flow

```
Landing (/) 
    │
    ├── Guest: "Get Started" / "Sign In" → /login
    │
    └── Authenticated: "Gallery" → /gallery
                                        │
                                        ├── /builder (DIY website builder)
                                        │
                                        ├── My Live Sites (UserMenu) → /sites (My Sites: Live Sites + Orders tabs)
                                        │       │
                                        │       ├── /sites/[id] (site control panel)
                                        │       └── Orders tab → Modify → /orders/[id]/edit (edit request)
                                        │
                                        └── Showcase Modal (preview in-page)
                                                │
                                                └── /gallery/request/[id] (request form)
```

### Route Protection

All authenticated routes use the `auth` middleware:

- `/gallery` - Central hub with builder access and templates showcase
- `/builder` - Website builder (existing)
- `/sites` - My Live Sites list; `/sites/[id]` - site control panel (manage delivered sites; not the builder)
- `/gallery/request/[id]` - Template request form
- `/orders/[id]/edit` - Order edit form (locked orders redirect to /sites)

**Note:** The route `/dashboard` has been replaced by `/gallery` (301 redirect). Templates are accessed directly from the Gallery.

---

## Gallery (`/gallery`)

**File:** `app/pages/gallery/index.vue`  
**CSS:** `app/assets/css/gallery.css`

The Gallery is the authenticated entry point, combining quick access to the builder with an integrated templates showcase.

### Layout Structure

The Gallery uses the **default** layout, which provides the global **AppNavbar** (logo, **UserMenu** with inline account label when authenticated—same display rule as on every other default-layout page; see `app/utils/accountIdentity.ts`, no CTA on this page).

The page is structured as a **PrimaryPageHero** (greeting + primary CTA to **My Sites**), a **templates showcase** block with distinct background contrast, and a minimal **footer**. All content is constrained by `--container-max`; spacing and typography use the global design tokens from `style.css`. The hero CTA uses the shared `ROUTES.sites` constant (`app/constants/routes.ts`) — label **Open My Sites**, headline **Manage your live sites**.

```
┌─────────────────────────────────────────────────────────────┐
│  AppNavbar (logo, UserMenu)                                  │
├─────────────────────────────────────────────────────────────┤
│ ▌ Primary hero                                               │
│   Welcome back, [Name]          [Open My Sites →]            │
│   Choose a path below to get started.                        │
├─────────────────────────────────────────────────────────────┤
│  Templates block (primary-tint background)                  │
│  Professional Templates    [All] [Local Services] [...]     │
│  Preview, customize, and request a design.                   │
│                                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  (compact cards)     │
│  │ Prev │ │ Prev │ │ Prev │ │ Prev │                        │
│  │ Name │ │ Name │ │ Name │ │ Name │                        │
│  └──────┘ └──────┘ └──────┘ └──────┘                        │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **PrimaryPageHero** — Shared hero (`PrimaryPageHero.vue`, `sites-hero.css`) with personalized greeting and primary CTA to **`/sites`** (My Sites). Single row on desktop; stacks on small screens.
2. **Templates showcase** (`dash-showcase`) — Contrast block (primary-tint background) containing section heading, category pills (tablist), and a responsive grid of compact template cards. Cards use a small browser mockup preview, industry label, name, description clamp, and "Preview" action.
3. **ShowcaseModal** — In-page preview modal: desktop/mobile toggle, optional loading state (spinner) while the request is created, "Choose This Design" → creates a draft request in Firestore → navigates to `/gallery/request/{docId}` (Firebase document ID).
4. **Footer** — Minimal copyright line; same container width as content.

### State Management

```typescript
// Template showcase state
const selectedCategory = ref<ShowcaseCategory | null>(null);
const showModal = ref(false);
const selectedTemplate = ref<ShowcaseTemplate | null>(null);
const isCreating = ref(false);
const errorBanner = ref<string | null>(null);

// Methods
const openShowcase = (template) => { ... };
const closeShowcase = () => { ... };
// handleChooseDesign creates a draft in Firebase, then navigates to /gallery/request/{docId}
const handleChooseDesign = async (templateId) => { ... };
```

### Daily Request Limit

Users are limited to 3 request creations per day. This is enforced by Firestore security rules via a counter document at `users/{userId}/requestLimits/daily`. When the limit is exceeded, a toast notification is displayed (no `alert()`).

### Category Filtering

```typescript
type ShowcaseCategory = 
  | 'local-services'   // Plumbers, electricians, etc.
  | 'professional'     // Law firms, consultants
  | 'creative'         // Photographers, designers
  | 'healthcare'       // Clinics, therapists
  | 'hospitality'      // Restaurants, cafes
  | 'retail';          // Shops, boutiques
```

---

## Showcase Store (`stores/showcase.ts`)

**IMPORTANT:** This is completely separate from `stores/templates.ts`. The showcase store contains full professional website designs, not builder blocks.

### Interface

```typescript
interface ShowcaseSection {
  type: 'hero' | 'services' | 'about' | 'features' | 'testimonials' | 
        'team' | 'pricing' | 'gallery' | 'contact' | 'cta' | 'faq' | 
        'stats' | 'process' | 'trust' | 'location';
  data: Record<string, any>;
}

interface ShowcaseTemplate {
  id: string;
  name: string;
  industry: string;
  category: ShowcaseCategory;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  sections: ShowcaseSection[];
  thumbnail?: string;
}
```

### Available Templates

1. **Elite Plumbing & Heating** - Local services (plumbing)
2. **Premier Electrical Services** - Local services (electrical)
3. **Smith & Associates Law Firm** - Professional (legal)
4. **ClearPath Accounting** - Professional (accounting)
5. **Apex Business Consulting** - Professional (consulting)
6. **Lens & Light Photography** - Creative (photography)
7. **Pixel Perfect Agency** - Creative (design/marketing)
8. **Bright Smile Dental** - Healthcare (dental)
9. **Harvest Table Bistro** - Hospitality (restaurant)
10. **Artisan Home Boutique** - Retail (home goods)

---

## ShowcaseModal Component

**File:** `app/components/ShowcaseModal.vue`

Modal overlay for previewing complete showcase templates with device simulation. Opens directly from the Gallery when a template card is clicked.

### Features

- Desktop/Mobile toggle (uses shared device frame styling)
- Full-height scrollable preview
- Template info in header
- "Close Preview" secondary action
- "Choose This Design" CTA → creates draft then navigates to request form
- **Loading state:** When `loading` is true (request creation in progress), an in-modal overlay shows a spinner and "Preparing your request…"; all actions (Choose This Design, Close, overlay click, Escape) are disabled so only one request can be created at a time. The modal restores `document.body.style.overflow` on unmount so the next page (e.g. request form) is not left unscrollable.

### Accessibility

- When loading: `aria-busy="true"` on the modal container, `aria-live="polite"` and `role="status"` on the loading message. Buttons are disabled. Animation respects `prefers-reduced-motion: reduce` (spinner becomes static).

### Device Frames

Desktop frame dimensions: `700px × 550px`  
Mobile frame dimensions: `330px × 600px`

Frame styling matches existing ScreenCard component for visual consistency.

---

## ShowcaseRenderer Component

**File:** `app/components/showcase/ShowcaseRenderer.vue`

Renders all sections of a showcase template. Used in both the preview modal and the request form preview.

### Supported Section Types

| Type | Description |
|------|-------------|
| `hero` | Full-width hero with headline, subheadline, CTA |
| `services` | Grid of service cards with icons |
| `about` | About section with content text |
| `testimonials` | Customer testimonials cards |
| `gallery` | Photo gallery placeholder |
| `contact` | Contact information section |
| `cta` | Call-to-action banner |
| `faq` | FAQ accordion items |
| `pricing` | Pricing tier cards |
| `team` | Team member profiles |
| `process` | Step-by-step process flow |
| `trust` | Trust badges and certifications |
| `stats` | Key statistics display |
| `features` | Feature highlights |

### Props

```typescript
interface Props {
  template: ShowcaseTemplate;
  viewMode?: 'desktop' | 'mobile';
}
```

---

## Template Request Form (`/gallery/request/[id]`)

**Page:** `app/pages/gallery/request/[id].vue`
**Form Component:** `app/components/TemplateRequestForm.vue`
**CSS:** `app/assets/css/request-form.css`

SMB onboarding form for requesting a website based on a selected showcase template. The `[id]` route param is a **Firebase document ID**, not a template slug. When the user clicks "Choose This Design" on the Gallery, a draft request is created in Firestore first, and the user is navigated to `/gallery/request/{docId}`.

The form uses gamified, section-based interactions: industry selection via **IndustryCardGrid** (selectable cards), **GuidedBusinessDescription** (three optional blocks: what we do, who we serve, what sets us apart), **YearsInBusinessInput** (segmented options only; field is optional), and **GoalSelector** (multi-select goals; no order). All use design tokens and support a read-only state when the form is disabled.

### Architecture

The page consists of two main pieces:

1. **Page (`[id].vue`)** - Loads the request document from Firestore by doc ID, resolves the associated showcase template, handles preview rendering, progress display, and error states
2. **Form Component (`TemplateRequestForm.vue`)** - Contains all form logic, validation, color customization, and file uploads

### Request Lifecycle

1. **Draft creation** (dashboard): `useCreateRequest().createDraftRequest()` runs a single Firestore transaction that writes the draft order doc to `users/{uid}/orders/{newId}` (with `status: 'draft'`, initial layout from the template, empty business/contact fields) and updates the daily-limit counter. The modal shows a loading state until navigation completes. See **Template selection flow and performance** below.
2. **Form filling** (request page): The page loads the draft by doc ID (or, when coming from the dashboard, may use navigation state for immediate paint; Firestore remains the canonical source). It resolves the template, initializes the request layout store, and renders the form. The user fills in details and optionally customizes the layout via the builder.
3. **Discarding a draft** (optional): While `status` is still **`draft`** and the order is not locked, the user may use the **trash** control in the **Actions** column on **My Sites → Orders** (**SitesOrdersPanel**). The parent **`/sites`** page opens **`DeleteDraftRequestModal`** (no `window.confirm`). **`deleteDraftRequest()`** removes the Firestore document, decrements the daily-limit counter when the draft was created on the same local calendar day as the counter’s `date`, and deletes Storage objects under `orders/{uid}/{orderId}/`. On success, the list updates via the existing orders snapshot; **`requestLayoutStore`** is reset so no stale builder state remains.
4. **Submission**: On form submit, the page **saves the draft to Firestore first** (full form, attachments, layout; `status` remains `draft`), then checks Whop access. Without access: checkout opens in a new tab with **`redirect_url`** to **`/sites?tab=orders`**, and the current tab navigates there so data is never held only in memory. With access: a follow-up update sets `status: 'submitted'` and navigates to **`/sites?tab=orders`**. After payment, the user resumes via **Orders → Modify** (`/orders/{id}/edit`).

### Error Handling

If the route ID does not correspond to a valid request document (not found, inaccessible, or the user is not the owner), the page renders a styled error state with a link back to the Gallery. No crash, no raw error. All user-facing messages use inline styled feedback (no `alert()` calls).

### Data Flow

```
TemplateRequestForm
    │
    ├── @color-change ──────► [id].vue updates previewTemplate ──► ShowcaseRenderer re-renders
    │
    ├── @progress-update ───► [id].vue updates progress bar in left column
    │
    └── @submit ────────────► [id].vue persists draft (updateOrder), then access check → submit or checkout + /sites
```

**State:** Form draft in `useTemplateRequestForm`; page seeds once via `initialFormData` → `hydrateFormData`. Updates via `updateField`. Children are controlled (`modelValue` / `update:modelValue`).

### Navigation

- Back link: Returns to `/gallery` (templates section)
- "Choose a different design" link: Returns to `/gallery`
- "Build your own" link: Goes to the Gallery templates section (`/gallery#templates`)
- "Customize page layout" button: Goes to `/gallery/request/{orderId}/builder` so layout edits persist across refresh and are always tied to the current request. On smaller screens, the control is shown as unavailable with inline guidance (the builder is intentionally disabled there).

### Layout

Two-column layout on desktop:
- **Left (420px)**: Welcome message, live preview card (sticky), progress bar
- **Right (flexible)**: Form sections

Responsive collapse to single column on mobile.

### Form validation

Validation is centralized in `useTemplateRequestValidation` (see `app/composables/useTemplateRequestValidation.ts`). The form does not submit until all validations pass.

**When validation runs:**
- **On blur:** Text, email, phone, website, and textarea fields validate when the user leaves the field. The error for that field is updated (or cleared if valid).
- **On input:** Typing in a field clears that field’s error so the user gets immediate feedback while correcting.
- **On submit:** All fields are validated. If any fail, errors are shown and submission is blocked. String fields are trimmed before the payload is emitted.

**Rules (summary):**
- **Business name / Contact name:** Required; 2–200 characters after trim; not purely numeric; at least two letters; only letters, numbers, spaces, hyphens, apostrophes, periods.
- **Industry:** Required; must be one of the predefined options.
- **Years in business:** Optional; if provided, must be a whole number between 0 and 200.
- **Email:** Required; valid email format; max 254 characters.
- **Phone:** Optional; if provided, 10–15 digits (spaces, dashes, parentheses allowed).
- **Website:** Optional; if provided, must be a valid URL (protocol or domain with TLD).
- **Address:** Optional; if provided, max 500 characters.
- **Goals:** At least one goal required; values must be from the predefined list.
- **Long text (description, target audience, additional notes):** Optional; if provided, max 2000 characters.

**UI:** Error messages use the design token `--color-error`. Invalid inputs use the `.form-input--invalid` / `.form-select--invalid` / `.form-textarea--invalid` classes (and IconInput receives invalid styling via `.form-group--error`). Error text appears below the field; layout uses the shared `.form-error` class from `components.css`.

### Order edit (`/orders/[id]/edit`)

The same **TemplateRequestForm** is used on the order edit page (`app/pages/orders/[id]/edit.vue`) with:

- **initialFormData** — Form prefilled from the order (via `orderToFormData` from `useOrderUpdate`).
- **existingAttachments** — Order attachments already stored in Firestore/Storage. When present, the form shows a read-only "Current attachments" list (filename, size, and a Download link when `downloadURL` is available) above the file upload area. New files added via the upload area are appended on save.
- **Submit section overrides** — The bottom section uses different copy for editing: title "Save your changes", description about updates being saved, button "Update request", and loading text "Saving...". The request form page keeps the default "Ready to get started?" / "Submit Request" copy.

Locked orders (`modificationLocked === true`) redirect to `/sites`; the edit page does not render the form in that case. To discard a draft, use **My Sites → Orders** and the trash action in the table (see **Discarding a draft** above).

---

## CSS Files

| File | Purpose |
|------|---------|
| `gallery.css` | Gallery page: control strip, showcase block (contrast zone), compact template cards; uses design tokens only; page-scoped vars on `.dash` for section backgrounds |
| `request-form.css` | Request form page styles |
| `components.css` | Shared UI components (buttons, forms, modals, device frames) |
| `showcase.css` | ShowcaseRenderer section styles |

All CSS files follow the existing design system:
- Primary color: `#1e3a8a`
- Border radius: `12px` (cards), `8px` (inputs)
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.04)` (subtle)
- System fonts (Inter stack)

---

## Navigation Updates

### Login Redirect

After successful login, users are redirected based on account state via `GET /api/user/landing-destination`:
- If user has orders → `/sites`
- Else → `/gallery`
- Or to `?redirect` if explicitly specified

### Landing Page CTAs

Landing page CTAs are auth-aware:
- **Guest:** "Get Started" / "Launch Builder" → `/login`
- **Authenticated:** "Gallery" / "Open Gallery" → `/gallery`

### UserMenu Dropdown

The trigger shows an **inline account label** whenever the user is signed in (same algorithm as the dropdown title: `getAccountDisplayLabel` in `app/utils/accountIdentity.ts`). The dropdown includes **Gallery**, **My Live Sites** (`/sites`), **Report a problem** (`/report-issue`), and **Sign Out**. The report page is not linked from global nav elsewhere.

### My Sites Page (`/sites`)

**File:** `app/pages/sites/index.vue`  
**CSS:** `app/assets/css/sites.css`

The My Sites page is the authenticated hub for managing delivered websites and template request orders. It uses the **default** layout (AppNavbar) and is protected by the `auth` middleware.

**Layout structure:**
- **PrimaryPageHero** — Page title, subtitle, and "Discover layout templates" CTA (links to `/gallery` via `ROUTES.gallery`)
- **SitesTabList** — Tab list (role="tablist") with Live Sites and Orders; keyboard navigable (arrow keys)
- **SitesLiveSitesPanel** — Table of delivered sites (business, domain, last update, status, Manage action)
- **SitesOrdersPanel** — Table of template request orders (template, submitted date, status, editable/locked, **Actions**: **Modify** + trash icon for deletable drafts, fixed slot for alignment). Emits **`delete-draft`** to the parent; **`/sites`** owns **`DeleteDraftRequestModal`** and **`deleteDraftRequest()`**.
- **SitesEmptyState** — Context-aware empty state; Orders empty state includes "Browse templates" CTA to Gallery

**Data sources:** `stores/sites.ts` (live sites, in-memory demo data) and `stores/orders.ts` (Firestore `onSnapshot` via **`useOrdersSnapshotWhenFocused`**). The orders list is the **canonical** view of requests; route unmount detaches the listener but keeps the last snapshot in memory until sign-out clears the store. No direct store mutation from components; all data flows via props.

**Accessibility:** Tab list uses `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`; panels use `role="tabpanel"`, `aria-labelledby`, `aria-hidden`. Focus rings use `--color-primary`. `prefers-reduced-motion` disables hover transforms and entrance animations.

**Responsive:** Table horizontal scroll on viewports ≤768px; welcome section stacks vertically. Breakpoints follow design system (480, 640, 768, 900, 1024, 1200).

### CTA on /sites

The My Sites page includes a "Discover layout templates" CTA that links to `/gallery`, placed in the header area (SitesWelcomeHeader). The Orders empty state also includes a "Browse templates" CTA.

---

## Removed Routes

The following route has been replaced:

- ~~`/dashboard`~~ - Replaced by `/gallery`; 301 redirect in place

The request form route remains at `/gallery/request/[id]` for URL stability.

---

## Order Persistence (Firestore & Storage)

Request orders follow a two-phase lifecycle:

1. **Draft creation** (on Gallery): When the user clicks "Choose This Design," a draft order document is created in Firestore at `users/{userId}/orders/{orderId}` with `status: 'draft'`, the initial layout from the template, and default empty fields. This is handled by `useCreateRequest().createDraftRequest()`.

2. **Form submission** (on request page): When the user fills out the form and submits, the existing draft is updated to `status: 'submitted'` with all form data, uploaded attachments, and the current layout. This is handled by `useOrderUpdate().updateOrder()` with a `status` parameter.

**Layout persistence:** The builder's Save button writes the current layout to the draft document in Firebase via `useCreateRequest().saveLayout()`. This ensures layout changes survive page refresh, navigation, and browser close. The request page loads the persisted layout from the document on mount. When opening the builder from the request page, the app navigates to `/builder?orderId={orderId}` so the builder can rehydrate from Firebase after a refresh.

**Daily limit:** Each user can create at most 3 requests per day. This is enforced by Firestore security rules using a counter document at `users/{userId}/requestLimits/daily`. The counter is read and written inside the same transaction as the order document (single round-trip).

See **[18-FIREBASE-FIRESTORE-STORAGE.md](18-FIREBASE-FIRESTORE-STORAGE.md)** for the full Firestore/Storage data model, document shape, and security considerations.

---

## Template selection flow and performance

This section describes the sequence from "Choose This Design" to the request page, the causes of perceived lag that were addressed, and the optimizations and loading UI applied.

### Reproduction (lag before fix)

1. User is on the Gallery and clicks a template card → ShowcaseModal opens.
2. User clicks "Choose This Design".
3. **Before the fix:** The modal closed immediately; the Gallery was visible with no loading indicator. The user then waited while: a separate Firestore read for the daily counter, then a transaction writing the order and counter, then client-side navigation, then the request page mounting and fetching the same order again. On slow connections this produced a noticeable delay with no feedback.

### Root causes

1. **Modal closed before async work** — The Gallery called `closeShowcase()` at the start of the handler, so the modal disappeared before the Firestore transaction and navigation. The user had no indication that request creation was in progress.
2. **Two Firestore round-trips** — The composable first called `getDoc(counterRef)` to read the daily counter, then ran `runTransaction` to write the order and counter. That was two sequential round-trips; the counter read was moved inside the transaction so a single transaction performs read + write.
3. **Redundant fetch** — After navigation, the request page always called `fetchOrder()` to load the document that had just been created. Navigation state hydration was added as an optional fast-path so the page can render immediately when the order is passed in state; the page still loads from Firestore when state is absent (reload, direct URL, history restore).

### Optimizations applied

1. **Loading UI before async work** — The handler sets `isCreating = true`, then `await nextTick()`, so Vue paints the modal’s loading state (spinner + "Preparing your request…") before the Firestore transaction runs. The modal is not closed until navigation occurs or an error is shown.
2. **Single Firestore transaction** — In `useCreateRequest.createDraftRequest()`, the counter is read with `transaction.get(counterRef)` inside `runTransaction`; the new count is computed and both the order document and the counter are written in the same transaction. One round-trip instead of two.
3. **Optional hydration from navigation state** — After a successful create, the Gallery passes the created order (as an `OrderWithId`-compatible object) in `router.push(..., state: { orderFromCreate } )`. The request page checks `history.state?.orderFromCreate`; if present and the id matches the route param, it uses that for immediate render and initializes the request layout store. Hydration is a performance optimization only; the canonical source of truth is Firestore. The request page always supports loading purely from the route id (e.g. direct URL or reload).
4. **No concurrent request creation** — While `isCreating` is true, the Gallery does not open another template (`openShowcase` returns early), and the modal’s actions (Choose This Design, Close, overlay click, Escape) are disabled or no-op. Only one creation runs at a time.
5. **Cleanup on modal unmount** — ShowcaseModal’s `onUnmounted` sets `document.body.style.overflow = ''` so that when the user navigates to the request page (or closes the modal), the body is not left with `overflow: hidden`, which would make the request page unscrollable.

### Loading UI

- The loading indicator is an overlay inside the modal body (no new layout structure). It uses a CSS-only spinner and the copy "Preparing your request…", with design tokens (`--color-primary`, `--color-text-muted`, `--space-*`, `--radius-*`). It does not resize the modal or cause layout shift.
- Accessibility: `aria-busy="true"` on the modal, `aria-live="polite"` and `role="status"` on the message; buttons disabled; animation reduced or disabled when `prefers-reduced-motion: reduce`.

### Validation checklist

- **Immediate spinner:** On "Choose This Design", the loading indicator appears before any visible delay (verified with throttled network).
- **Modal remains visible:** Modal stays open with loading state until navigation or error.
- **No concurrent creation:** With loading visible, clicking another template or "Choose This Design" again does not start a second request.
- **Navigation and request page:** After the transaction, navigation to `/gallery/request/:id` occurs. If hydration was passed, the request page can render immediately; if not (direct URL or reload), it loads from Firestore. Reloading the request page always loads from Firestore.
- **No UI bugs:** Request page is scrollable; no `overflow: hidden` left on body. No layout shift when the spinner appears. No modal-specific state affecting the request page.
- **Errors:** On network or server error during create, a toast is shown, `isCreating` is set to false, and the modal stays open for retry or close.

### Code summary (modified files)

| File | Purpose |
|------|--------|
| `app/pages/gallery/index.vue` | Set `isCreating = true`, `await nextTick()`, then run create + push; do not close modal before async work. Guard `openShowcase` and `closeShowcase` when `isCreating`. Pass `loading` to modal and optional `state.orderFromCreate` on push. |
| `app/composables/useCreateRequest.ts` | Single transaction with `transaction.get(counterRef)`; return `orderForHydration` for the request page fast-path. |
| `app/components/ShowcaseModal.vue` | `loading` prop; in-modal loading overlay (spinner + message); disable actions when loading; `aria-busy`, `aria-live`; restore `document.body.style.overflow` in `onUnmounted`. |
| `app/pages/gallery/request/[id]/index.vue` | In `loadRequestFromFirebase`, use `history.state?.orderFromCreate` when present and id matches for immediate render; otherwise load from Firestore. Page remains fully functional without hydration. |

---

## Future Considerations

### Planned Enhancements

1. **Template Search** - Search by name or description
2. **Favorites** - Save templates to user's favorites
3. **Request Status** - Track submitted requests (orders already stored in Firestore)
4. **More Templates** - Expand template library
5. **Template Thumbnails** - Visual preview images

---

## Summary

The integrated Gallery experience provides:

1. **Unified entry point** - Single destination after login
2. **Discoverability** - Templates surface naturally alongside builder access
3. **Visual hierarchy** - Builder is primary action, templates are secondary exploration
4. **Maintained functionality** - Same modal preview, same request flow
5. **Simplified navigation** - Fewer pages, clearer user journey
6. **Design consistency** - Follows existing design system

The architecture maintains separation of concerns:
- Showcase templates remain distinct from builder templates
- ShowcaseModal and ShowcaseRenderer components are reused
- Request form flow is preserved with updated navigation
