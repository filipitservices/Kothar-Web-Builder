# Unified Request–Builder Flow

This document describes the integrated flow that connects template selection, the request editor, and the website builder into a single coherent product path.

---

## Overview

Prior to this change, the template selection / request flow and the builder were independent experiences. Now they operate as a unified pipeline:

1. **User selects a showcase template** on the dashboard.
2. **User is taken to the request editor** (`/gallery/request/[id]`), which becomes the central configuration page.
3. **From the request editor, the user can open the builder** (`/builder`) to rearrange the page layout visually.
4. **The builder loads with the template's sections already arranged** as builder blocks.
5. **Layout changes in the builder persist** and are visible when the user returns to the request editor.
6. **On submission**, the layout configuration is included in the order payload sent to Firestore.

The builder can no longer be accessed as a standalone tool. It requires an active request context.

---

## Data Model

### Request State Store (`stores/requestState.ts`)

Single source of truth for an in-progress request that spans the request editor and builder pages. A Pinia store that holds:

| Field | Type | Description |
|-------|------|-------------|
| `templateId` | `string \| null` | Showcase template ID |
| `templateName` | `string \| null` | Human-readable template name |
| `layout` | `RequestLayout` | Desktop and mobile block arrays |
| `savedFormData` | `Partial<TemplateRequestFormData> \| null` | Snapshot of form data for navigation persistence |
| `isInitialized` | `boolean` | Whether the store has been initialized for a request |

```typescript
interface RequestLayout {
  desktop: BlockItem[];
  mobile: BlockItem[];
}
```

### Order Layout (`types/order.ts`)

The `OrderRequest` Firestore document now includes an optional `layout` field:

```typescript
interface OrderLayout {
  desktop: OrderLayoutSection[];
  mobile: OrderLayoutSection[];
}

interface OrderLayoutSection {
  id: string;
  type: string;
  label: string;
}
```

This is a serializable representation of the builder layout. It is set at order creation time and represents the page structure the user configured.

---

## How Templates Initialize Layout

When a user selects a showcase template and arrives at the request editor, the `requestState` store is initialized via `initializeFromTemplate(template)`. This calls `deriveLayoutFromTemplate()` in `utils/templateLayoutMapper.ts`.

The mapper converts showcase section types to builder block types:

| Showcase Section | Builder Block |
|-----------------|---------------|
| `hero` | `hero` |
| `trust` | `credentials` |
| `services` | `services` |
| `process` | `process` |
| `testimonials` | `testimonial` |
| `stats` | `stats` |
| `team` | `team` |
| `gallery` | `gallery` |
| `pricing` | `pricing` |
| `cta` | `cta` |
| `about` | `text` |
| `features` | `features` |
| `contact` | `location` |
| `location` | `location` |
| `faq` | `faq` |

A `navbar` block is prepended and a `footer` block is appended. Each block gets a unique ID in the format `{type}-{timestamp}-{uuid}`. Desktop and mobile each get their own set of block instances.

---

## How the Builder Modifies Layout

When the user opens the builder from the request editor:

1. The request editor saves current form data to the store (`requestState.saveFormData`).
2. Navigation goes to `/builder`.
3. The builder's `onMounted` hook checks `requestState.hasActiveRequest`. If false, it redirects to `/dashboard`.
4. If true, the builder hydrates its local `desktopList` and `mobileList` refs from the store's layout.
5. Any list change (drag, reorder, add, remove, template apply) updates both the local refs and the store via `requestState.updateDesktopLayout` / `requestState.updateMobileLayout`.
6. A context bar at the top of the builder shows the template name and a "Back to Request" button.

When the user clicks "Back to Request":

1. Layout is already persisted in the store (via the update handlers that fire on every change).
2. Navigation goes to `/gallery/request/{templateId}`.
3. The request editor mounts, detects the store has active state for this template, and restores form data via `initialFormData`.
4. The layout summary in the sidebar reflects any changes made in the builder.

---

## Request Payload

When the user submits the request, the order payload includes:

```typescript
{
  templateId: string;
  templateName: string;
  businessInfo: OrderBusinessInfo;
  contactInfo: OrderContactInfo;
  projectDetails: OrderProjectDetails;
  layout: OrderLayout;          // ← NEW
  attachments: OrderAttachment[];
  status: 'submitted';
  createdAt: serverTimestamp();
  updatedAt: serverTimestamp();
}
```

The `layout` field is built from the store's current layout state at submission time. After successful submission, the store is reset via `requestState.$reset()`.

---

## Navigation and Route Guards

| Route | Behavior |
|-------|----------|
| `/dashboard` | Shows showcase templates. "Choose a Template" CTA scrolls to the template grid. No direct builder link. |
| `/gallery/request/[id]` | Request editor. Initializes request state store on first visit for a template. Shows layout summary with "Customize Layout in Builder" button. |
| `/builder` | Builder page. Requires `requestState.hasActiveRequest` to be true; otherwise redirects to `/dashboard`. Shows context bar with "Back to Request" and template name. |

The builder cannot be accessed directly without an active request. Navigating to `/builder` via URL without prior template selection results in a redirect to `/dashboard`.

---

## File Reference

| File | Role |
|------|------|
| `app/stores/requestState.ts` | Request state store (layout, form data, template reference) |
| `app/utils/templateLayoutMapper.ts` | Derives builder layout from showcase template sections |
| `app/types/order.ts` | `OrderLayout`, `OrderLayoutSection` types |
| `app/pages/gallery/request/[id].vue` | Request editor with layout summary and builder navigation |
| `app/pages/builder.vue` | Builder with request context guard, store integration, back navigation |
| `app/pages/dashboard.vue` | Template-first CTA (no standalone builder link) |
| `app/composables/useOrderSubmission.ts` | Accepts layout in submission params |
| `app/components/TemplateRequestForm.vue` | Exposes `formData` for parent to snapshot before navigation |

---

## Architectural Principles

- **Single source of truth**: The `requestState` store owns layout state. The builder reads from and writes to it. No parallel copies or sync logic.
- **Explicit state transitions**: Form data is saved to the store explicitly before navigation (not via watchers). Layout updates are written to the store in the same event handlers that update local refs.
- **Immutable updates**: Store actions create new arrays/objects rather than mutating in place. Local refs are replaced, not mutated via index assignment.
- **No standalone builder**: The builder is a specialized layout editor for the request, not an independent tool. It must have a request context to operate.
