# Routing & Landing Page Architecture

**Complete routing structure, landing page design, and integration boundaries between pages.**

---

## Overview

Kothar follows a clear page separation pattern:
- **Landing Page** (`/`) - Marketing experience, product introduction, entry point
- **Dashboard** (`/dashboard`) - Central hub with showcase templates (protected)
- **Template Request** (`/gallery/request/[id]`) - SMB template request form (protected)
- **Request Builder** (`/gallery/request/[id]/builder`) - Layout editor within request flow (protected)
- **Order Edit** (`/orders/[id]/edit`) - Order modification form (protected)
- **Order Builder** (`/orders/[id]/builder`) - Layout editor within order flow (protected)
- **Login Page** (`/login`) - Authentication page (guest-only)
- **Reset Password** (`/reset-password`) - Password recovery (guest-only)
- Explicit Nuxt 4 file-based routing for clarity and predictability

**Important**: The builder does not exist as a standalone page. It is only accessible within the request or order editing flow, always bound to a specific request/order ID.

---

## Routing Structure

### Route Map

| Route | Page File | Purpose | Layout | Auth |
|-------|-----------|---------|--------|------|
| `/` | `pages/index.vue` | Landing page with marketing messaging | default | Public |
| `/dashboard` | `pages/dashboard.vue` | Central hub with templates showcase | default | **Protected** |
| `/gallery/request/:id` | `pages/gallery/request/[id]/index.vue` | Template request form | default | **Protected** |
| `/gallery/request/:id/builder` | `pages/gallery/request/[id]/builder.vue` | Builder within request flow | builder | **Protected** |
| `/orders/:id/edit` | `pages/orders/[id]/edit.vue` | Order edit form | default | **Protected** |
| `/orders/:id/builder` | `pages/orders/[id]/builder.vue` | Builder within order flow | builder | **Protected** |
| `/sites` | `pages/sites/index.vue` | Live Sites + Orders tabs | default | **Protected** |
| `/sites/:id` | `pages/sites/[id].vue` | Site control panel | default | **Protected** |
| `/login` | `pages/login.vue` | Authentication (sign-in/sign-up) | default | Guest-only |
| `/reset-password` | `pages/reset-password.vue` | Password recovery | default | Guest-only |

### Route Protection

- **`auth` middleware**: Protects routes requiring authentication. Redirects unauthenticated users to `/login?redirect={path}`.
- **`guest` middleware**: Protects guest-only routes. Redirects authenticated users to `/dashboard`.

### Builder Access Constraint

The builder is **not** a standalone page. It can only be accessed through:
1. `/gallery/request/:id/builder` — from the template request form ("Customize page layout" button)
2. `/orders/:id/builder` — from the order edit form ("Customize page layout" button)

Both builder routes require:
- Authentication (`auth` middleware)
- A valid request/order ID in the URL
- The `requestLayoutStore` to be initialized with layout data for that request/order

If no valid context exists (e.g., direct URL access without prior initialization), the builder page initializes the layout store from the template/order data, or redirects back to the parent form if the ID is invalid.

### File-Based Routing

```
app/pages/
├── index.vue                           # / (public landing)
├── dashboard.vue                       # /dashboard (protected)
├── gallery/
│   └── request/
│       └── [id]/
│           ├── index.vue               # /gallery/request/:id (request form)
│           └── builder.vue             # /gallery/request/:id/builder (layout editor)
├── orders/
│   └── [id]/
│       ├── edit.vue                    # /orders/:id/edit (order edit)
│       └── builder.vue                 # /orders/:id/builder (layout editor)
├── sites/
│   ├── index.vue                       # /sites (protected)
│   └── [id].vue                        # /sites/:id (protected)
├── login.vue                           # /login (guest-only)
└── reset-password.vue                  # /reset-password (guest-only)
```

---

## Builder Flow

### From Request Form to Builder

1. User selects a showcase template on the dashboard
2. User navigates to `/gallery/request/:id` (request form)
3. Request page initializes `requestLayoutStore` from the showcase template
4. User clicks "Customize page layout"
5. Navigation to `/gallery/request/:id/builder`
6. Builder reads blocks from `requestLayoutStore`
7. User edits layout (drag, reorder, apply builder templates)
8. User clicks "Back to request"
9. Navigation back to `/gallery/request/:id`
10. `requestLayoutStore` state persists — layout changes are preserved
11. User submits the request with the customized layout

### From Order Edit to Builder

1. User navigates to `/orders/:id/edit` (order edit form)
2. Order edit page loads order data and initializes `requestLayoutStore`
3. User clicks "Customize page layout"
4. Navigation to `/orders/:id/builder`
5. Builder reads blocks from `requestLayoutStore`
6. User edits layout
7. User clicks "Back to order"
8. Navigation back to `/orders/:id/edit`
9. Layout changes persisted in `requestLayoutStore`
10. User saves the order with updated layout

### Direct URL Access

If a user navigates directly to a builder URL:
- The builder page attempts to initialize `requestLayoutStore` from the route param
- For request builder: loads the showcase template by ID
- For order builder: loads the order and its template from the stores
- If the ID is invalid or data cannot be loaded: redirects to the parent form

---

## Navigation

- **Landing → Dashboard**: Call-to-action with `<NuxtLink to="/dashboard">`
- **Dashboard → Template Preview**: Click template card → ShowcaseModal opens
- **Template Preview → Request**: "Choose This Design" → `/gallery/request/:id`
- **Request → Builder**: "Customize page layout" → `/gallery/request/:id/builder`
- **Builder → Request**: "Back to request" button → `/gallery/request/:id`
- **Order Edit → Builder**: "Customize page layout" → `/orders/:id/builder`
- **Builder → Order Edit**: "Back to order" button → `/orders/:id/edit`
- **Request → Dashboard**: Back link or "Choose different design" link
- **UserMenu (authenticated)**: Dashboard, My Live Sites (`/sites`), Sign Out
- **Any page → Landing**: Logo link with `<NuxtLink to="/">`

**Product rule:** Live sites (managed at `/sites` and `/sites/:id`) are **not** rebuilt via the builder. The builder is part of the request/order flow only.

---

## Layouts

- **default** (`layouts/default.vue`): Renders `AppNavbar` and `<slot />`. Used by landing, dashboard, request form, order edit, sites, login, reset-password.
- **builder** (`layouts/builder.vue`): Renders only `<slot />` (no navbar). Used by builder pages for full viewport editing.

Pages set their layout via `definePageMeta({ layout: 'builder' })`. All other pages use the default layout.

---

## State Management

### Store Persistence

All stores persist across route changes:
- **requestLayout** — Layout state for the current request/order editing session
- **business** — Global business data
- **blocks** — Desktop/mobile block customizations
- **templates** — Builder template library
- **showcase** — Showcase template definitions

### Navigation Impact

Navigation between request form and builder does **not**:
- Reset stores or state
- Clear layout customizations
- Lose form data

Navigation **only** changes:
- Which page component is rendered
- Visual layout and UI context

---

## Removed Routes

- ~~`/builder`~~ — The standalone builder page has been removed. Builder is now only accessible via `/gallery/request/:id/builder` and `/orders/:id/builder`.
- ~~`/gallery`~~ — Templates are integrated directly into the dashboard.

**Last Updated**: March 8, 2026
