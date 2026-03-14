# Dashboard & Template System

> **Document Version:** 2.0
> **Last Updated:** February 2026
> **Status:** Production

## Overview

The dashboard serves as the authenticated central hub for Kothar, providing users with immediate access to both the website builder and a curated showcase of professional templates—all in one cohesive experience.

**Key Architecture Decision:** Templates are now integrated directly into the dashboard rather than existing as a separate page. This creates a more focused, intentional user experience where users can discover templates naturally without navigating away from their central workspace.

### System Separation

| System | Purpose | Data Source | User Flow |
|--------|---------|-------------|-----------|
| **Builder Templates** | Starting points for DIY website building | `stores/templates.ts` | Dashboard → Builder → Select template → Edit blocks |
| **Showcase Templates** | Professional designs for managed services | `stores/showcase.ts` | Dashboard → Preview → Request form → Consultation |

---

## Architecture

### Navigation Flow

```
Landing (/) 
    │
    ├── Guest: "Get Started" / "Sign In" → /login
    │
    └── Authenticated: "Dashboard" → /dashboard
                                        │
                                        ├── /builder (DIY website builder)
                                        │
                                        ├── My Live Sites (UserMenu) → /sites (dashboard: Live Sites + Orders tabs)
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

- `/dashboard` - Central hub with builder access and templates showcase
- `/builder` - Website builder (existing)
- `/sites` - My Live Sites list; `/sites/[id]` - site control panel (manage delivered sites; not the builder)
- `/gallery/request/[id]` - Template request form
- `/orders/[id]/edit` - Order edit form (locked orders redirect to /sites)

**Note:** The standalone `/gallery` route has been removed. Templates are now accessed directly from the dashboard.

---

## Dashboard (`/dashboard`)

**File:** `app/pages/dashboard.vue`  
**CSS:** `app/assets/css/dashboard.css`

The dashboard is the authenticated entry point, combining quick access to the builder with an integrated templates showcase.

### Layout Structure

The dashboard uses the **default** layout, which provides the global **AppNavbar** (logo, UserMenu with optional name, no CTA on this page).

The page is structured as a control surface: a compact **control strip** (greeting + primary CTA), a **templates showcase** block with distinct background contrast, and a minimal **footer**. All content is constrained by `--container-max`; spacing and typography use the global design tokens from `style.css`.

```
┌─────────────────────────────────────────────────────────────┐
│  AppNavbar (logo, UserMenu)                                  │
├─────────────────────────────────────────────────────────────┤
│ ▌ Control strip (white, left accent)                         │
│   Welcome back, [Name]          [Open Builder →]             │
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

1. **Control strip** (`dashboard-strip`) — Header with personalized greeting and primary "Open Builder" CTA. White background, subtle left border accent. Single row on desktop; stacks on small screens.
2. **Templates showcase** (`dashboard-showcase`) — Contrast block (primary-tint background) containing section heading, category pills (tablist), and a responsive grid of compact template cards. Cards use a small browser mockup preview, industry label, name, description clamp, and "Preview" action.
3. **ShowcaseModal** — In-page preview modal: desktop/mobile toggle, "Choose This Design" → creates a draft request in Firebase → navigates to `/gallery/request/{docId}` (Firebase document ID).
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

Modal overlay for previewing complete showcase templates with device simulation. Opens directly from the dashboard when a template card is clicked.

### Features

- Desktop/Mobile toggle (uses shared device frame styling)
- Full-height scrollable preview
- Template info in header
- "Close Preview" secondary action
- "Choose This Design" CTA → navigates to request form

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

SMB onboarding form for requesting a website based on a selected showcase template. The `[id]` route param is a **Firebase document ID**, not a template slug. When the user clicks "Choose This Design" on the dashboard, a draft request is created in Firestore first, and the user is navigated to `/gallery/request/{docId}`.

The form uses gamified, section-based interactions: industry selection via **IndustryCardGrid** (selectable cards), **GuidedBusinessDescription** (three optional blocks: what we do, who we serve, what sets us apart), **YearsInBusinessInput** (segmented options only; field is optional), and **GoalSelector** (multi-select goals; no order). All use design tokens and support a read-only state when the form is disabled.

### Architecture

The page consists of two main pieces:

1. **Page (`[id].vue`)** - Loads the request document from Firestore by doc ID, resolves the associated showcase template, handles preview rendering, progress display, and error states
2. **Form Component (`TemplateRequestForm.vue`)** - Contains all form logic, validation, color customization, and file uploads

### Request Lifecycle

1. **Draft creation** (dashboard): `useCreateRequest().createDraftRequest()` writes a draft order doc to `users/{uid}/orders/{newId}` with `status: 'draft'`, initial layout from the template, and empty business/contact fields.
2. **Form filling** (request page): The page loads the draft by doc ID, resolves the template, and renders the form. The user fills in details and optionally customizes the layout via the builder.
3. **Submission**: On form submit, the page calls `useOrderUpdate().updateOrder()` to transition the draft to `status: 'submitted'` with the full form data, attachments, and layout.

### Error Handling

If the route ID does not correspond to a valid request document (not found, inaccessible, or the user is not the owner), the page renders a styled error state with a link back to the dashboard. No crash, no raw error. All user-facing messages use inline styled feedback (no `alert()` calls).

### Data Flow

```
TemplateRequestForm
    │
    ├── @color-change ──────► [id].vue updates previewTemplate ──► ShowcaseRenderer re-renders
    │
    ├── @progress-update ───► [id].vue updates progress bar in left column
    │
    └── @submit ────────────► [id].vue calls updateOrder() to transition draft → submitted
```

**State:** Form draft in `useTemplateRequestForm`; page seeds once via `initialFormData` → `hydrateFormData`. Updates via `updateField`. Children are controlled (`modelValue` / `update:modelValue`).

### Navigation

- Back link: Returns to `/dashboard` (templates section)
- "Choose a different design" link: Returns to `/dashboard`
- "Build your own" link: Goes to the dashboard templates section (`/dashboard#templates`)
- "Customize page layout" button: Goes to `/gallery/request/{orderId}/builder` so layout edits persist across refresh and are always tied to the current request

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

Locked orders (`modificationLocked === true`) redirect to `/sites`; the edit page does not render the form in that case.

---

## CSS Files

| File | Purpose |
|------|---------|
| `dashboard.css` | Dashboard page: control strip, showcase block (contrast zone), compact template cards; uses design tokens only; page-scoped vars on `.dashboard-container` for section backgrounds |
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

After successful login, users are redirected to `/dashboard`:

```typescript
// app/pages/login.vue
const redirectUrl = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? redirect : '/dashboard';
});
```

### Landing Page CTAs

Landing page CTAs are auth-aware:
- **Guest:** "Get Started" / "Launch Builder" → `/login`
- **Authenticated:** "Dashboard" / "Go to Dashboard" → `/dashboard`

### UserMenu Dropdown

The UserMenu dropdown includes a "Dashboard" link for quick navigation from any authenticated page.

---

## Removed Routes

The following route has been removed in favor of dashboard integration:

- ~~`/gallery`~~ - Templates are now accessed directly from the dashboard

The request form route remains at `/gallery/request/[id]` for URL stability.

---

## Order Persistence (Firestore & Storage)

Request orders follow a two-phase lifecycle:

1. **Draft creation** (on dashboard): When the user clicks "Choose This Design," a draft order document is created in Firestore at `users/{userId}/orders/{orderId}` with `status: 'draft'`, the initial layout from the template, and default empty fields. This is handled by `useCreateRequest().createDraftRequest()`.

2. **Form submission** (on request page): When the user fills out the form and submits, the existing draft is updated to `status: 'submitted'` with all form data, uploaded attachments, and the current layout. This is handled by `useOrderUpdate().updateOrder()` with a `status` parameter.

**Layout persistence:** The builder's Save button writes the current layout to the draft document in Firebase via `useCreateRequest().saveLayout()`. This ensures layout changes survive page refresh, navigation, and browser close. The request page loads the persisted layout from the document on mount. When opening the builder from the request page, the app navigates to `/builder?orderId={orderId}` so the builder can rehydrate from Firebase after a refresh.

**Daily limit:** Each user can create at most 3 requests per day. This is enforced by Firestore security rules using a counter document at `users/{userId}/requestLimits/daily`, written atomically with the draft via a batch write.

See **[18-FIREBASE-FIRESTORE-STORAGE.md](18-FIREBASE-FIRESTORE-STORAGE.md)** for the full Firestore/Storage data model, document shape, and security considerations.

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

The integrated dashboard experience provides:

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
