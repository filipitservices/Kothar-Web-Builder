# Routing & Landing Page Architecture

**Complete routing structure, landing page design, and integration boundaries between pages.**

---

## Overview

Kothar follows a clear page separation pattern:
- **Landing Page** (`/`) - Marketing experience, product introduction, entry point
- **Dashboard** (`/dashboard`) - Central hub with templates showcase and request entry (protected)
- **Builder Pages** (`/gallery/request/[id]/builder`, `/orders/[id]/builder`) - Website layout editor in the context of a specific request/order (protected, requires authentication)
- **Login Page** (`/login`) - Authentication page (guest-only)
- **Reset Password** (`/reset-password`) - Password recovery (guest-only)
- **Template Request** (`/gallery/request/[id]`) - SMB template request form; `[id]` is a Firebase document ID (protected)
- Explicit Nuxt 4 file-based routing for clarity and predictability

---

## Routing Structure

### Route Map

| Route | Page File | Purpose | Layout | Auth |
|-------|-----------|---------|--------|------|
| `/` | `pages/index.vue` | Landing page with marketing messaging | Full-height, centered | Public |
| `/dashboard` | `pages/dashboard.vue` | Central hub with templates and request flow | Full-page, sections | **Protected** |
| `/builder` | `pages/builder.vue` | Legacy redirect; routes to ID-scoped builder pages | Default | **Protected** |
| `/sites` | `pages/sites/index.vue` | Dashboard: Live Sites + Orders tabs | Full-page, table dashboard | **Protected** |
| `/sites/[id]` | `pages/sites/[id].vue` | Site control panel — manage one live site | Full-page, sections | **Protected** |
| `/gallery/request/[id]` | `pages/gallery/request/[id].vue` | Template request form (`[id]` = Firebase document ID) | 2-column layout | **Protected** |
| `/gallery/request/[id]/builder` | `pages/gallery/request/[id]/builder.vue` | Builder for the layout of a specific request | Builder | **Protected** |
| `/orders/[id]/edit` | `pages/orders/[id]/edit.vue` | Order edit form (locked orders redirect to /sites) | Same as request form | **Protected** |
| `/orders/[id]/builder` | `pages/orders/[id]/builder.vue` | Builder for the layout of a specific order | Builder | **Protected** |
| `/login` | `pages/login.vue` | Authentication (sign-in/sign-up) | Full-page | Guest-only |
| `/reset-password` | `pages/reset-password.vue` | Password recovery | Full-page | Guest-only |

### Route Protection

Routes are protected using Nuxt 4 route middleware:

- **`auth` middleware**: Protects routes requiring authentication. Redirects unauthenticated users to `/login?redirect={path}`.
- **`guest` middleware**: Protects guest-only routes. Redirects authenticated users to `/dashboard`.

**Protected Routes:**
- `/dashboard` - Central hub (requires authentication via `auth` middleware)
- `/builder` - Legacy entry point that immediately redirects to an ID-scoped builder route or dashboard
- `/sites` - My Live Sites list (requires authentication via `auth` middleware)
- `/sites/[id]` - Site control panel (requires authentication via `auth` middleware)
- `/gallery/request/[id]` - Template request form (requires authentication via `auth` middleware)
- `/gallery/request/[id]/builder` - Builder for a specific request (requires auth; redirects away when context is invalid)
- `/orders/[id]/edit` - Order edit form (requires auth; locked orders redirect to /sites)
- `/orders/[id]/builder` - Builder for a specific order (requires auth; redirects away when context is invalid)

**Guest-Only Routes:**
- `/login` - Redirects authenticated users away via `guest` middleware
- `/reset-password` - Redirects authenticated users away via `guest` middleware

### SSR Safety

Route middleware runs on **both server and client**:
- On SSR: Uses `useRequestFetch` to forward session cookies for verification
- On client: Uses `$fetch` which automatically includes cookies
- **No protected UI leaks**: Middleware blocks rendering before any page content is served
- **No UI flicker**: Redirect happens before component mounts

### Routing Implementation

**File-Based Routing** (Nuxt 4 Auto-Routing)

```
app/pages/
├── index.vue               # / route - landing page (public)
├── dashboard.vue           # /dashboard route - central hub (protected)
├── builder.vue             # /builder route - legacy redirect to ID-scoped builder
├── sites/
│   ├── index.vue           # /sites - My Live Sites list (protected)
│   └── [id].vue            # /sites/:id - site control panel (protected)
├── gallery/
│   └── request/
│       ├── [id].vue        # /gallery/request/:id - template request form (protected)
│       └── [id]/builder.vue # /gallery/request/:id/builder - builder for that request (protected)
├── orders/
│   └── [id]/
│       ├── edit.vue        # /orders/:id/edit - order edit (protected; locked redirect)
│       └── builder.vue     # /orders/:id/builder - builder for that order (protected)
├── login.vue               # /login route - authentication (guest-only)
└── reset-password.vue      # /reset-password route (guest-only)
```

**Route Definitions**

Routes are implicitly defined by file structure. No manual `vue-router` config required.

- `/` → renders `pages/index.vue`
- `/dashboard` → renders `pages/dashboard.vue` (requires auth)
- `/builder` → renders `pages/builder.vue` (requires auth)
- `/sites` → renders `pages/sites/index.vue` (requires auth)
- `/sites/:id` → renders `pages/sites/[id].vue` (requires auth)
- `/gallery/request/:id` → renders `pages/gallery/request/[id].vue` (requires auth; `:id` is a Firebase document ID)
- `/login` → renders `pages/login.vue` (guests only)
- `/reset-password` → renders `pages/reset-password.vue` (guests only)

**Navigation**

- **Landing → Dashboard**: Call-to-action with `<NuxtLink to="/dashboard">` (redirects to login if unauthenticated)
- **Dashboard → Builder**: Builder hero card with `<NuxtLink to="/builder">`
- **Dashboard → Template Preview**: Click template card → ShowcaseModal opens in-page
- **Template Preview → Request**: "Choose This Design" → creates a draft request in Firebase → navigates to `/gallery/request/:id` (Firebase doc ID)
- **Request → Builder**: "Customize page layout" → navigates to `/builder?orderId=:id` (enables layout rehydration after refresh)
- **Request → Dashboard**: Back link or "Choose different design" link
- **UserMenu (authenticated)**: Dashboard, **My Live Sites** (`/sites`), Sign Out
- **Sites list → Site control panel**: "Manage site" → `/sites/:id`
- **Site control panel → Sites list**: "Back to your sites" → `/sites`
- **Any page → Landing**: Logo link with `<NuxtLink to="/">`
- **Unauthenticated → Login**: Automatic redirect via `auth` middleware

**Product rule:** Live sites (managed at `/sites` and `/sites/:id`) are **not** rebuilt via the builder. The builder is for design selection and the request flow only. Delivered sites are managed in the Live Sites area.

---

## Landing Page (`/`)

### Purpose

The landing page serves as the public-facing entry point to Kothar. It communicates:
- Application identity and brand
- Core value proposition
- Primary features and benefits
- Clear call-to-action to enter the builder
- Visual alignment with the builder's design system

### Layout Design

```
┌─────────────────────────────────────────┐
│         Navigation Bar (Top)            │
│  Logo                            [CTA]  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Hero Section (Centered)        │
│                                         │
│    "Build Websites Visually"           │
│    "No coding required. Drag, customize │
│     block-by-block. Preview desktop &  │
│     mobile instantly."                  │
│                                         │
│         [Get Started] button            │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Features Grid (3 columns)        │
│                                         │
│  [Icon] Feature 1    [Icon] Feature 2  │
│         Description            Description
│                                         │
│  [Icon] Feature 3                       │
│         Description                     │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       Footer (with secondary CTA)       │
│  © 2026 Kothar | [Privacy] [Terms]     │
│              [Ready to build?]          │
└─────────────────────────────────────────┘
```

### Component Composition

**Landing Page** (`pages/index.vue`), under default layout:
- **AppNavbar** (from layout) – logo, UserMenu, CTA (Start Building / Dashboard)
- Hero section with main CTA
- Features grid
- CTA section
- Footer

### Styling Approach

Landing page uses the same design system as the rest of the app:
- **Tokens**: Global tokens from `style.css` (`:root`); landing extends with `--landing-*` on `.landing-container` for section accents (violet, emerald, amber).
- **Colors**: `--color-primary`, `--color-bg`, `--color-border`, etc.; section-specific tints from `--landing-*`.
- **Typography**: Base from `style.css` (system fonts, 16px, 1.6 line-height).
- **Spacing**: `--space-*` and `--landing-spacing-*` scales.
- **Radius**: `--radius-md`, `--radius-lg` and `--landing-radius-*`.
- **Layout**: Full-height viewport; content constrained by `--container-max` (1200px). Breakpoints: 768px, 480px.

Landing CSS is loaded as scoped page styles (`landing.css`). No builder-specific CSS (`.main-container`, `.sidebar`, `.screens-inner`) applies to the landing page.

---

## Builder Page (`/builder`)

### Purpose

The builder page is the full-featured website editor interface. It includes:
- Drag-and-drop block system
- Dual-screen (desktop/mobile) canvas
- Business information editor (InfoBar)
- Block customization with inline editing
- Drawing annotation tools
- Template library
- AI chat panel

### Authentication Requirement

**The builder page requires authentication.** It is protected by the `auth` middleware and uses the **builder** layout (no global navbar):

```typescript
definePageMeta({
  middleware: 'auth',
  layout: 'builder'
});
```

**Access Flow:**
1. User navigates to `/builder` (via link or direct URL)
2. `auth` middleware intercepts and checks session via `/api/auth/me`
3. If authenticated → page renders normally
4. If not authenticated → redirect to `/login?redirect=/builder`
5. After successful login → user is redirected back to `/builder`

**SSR Behavior:**
- Middleware runs server-side during SSR
- Session cookie is forwarded via `useRequestFetch`
- Protected UI is never sent to unauthenticated users
- No client-side flash or partial render

### Layout Design

```
┌────────────────────────────────────────────────────────┐
│              Home / Back to Landing                    │
└────────────────────────────────────────────────────────┘

┌────────┬────────────────────────────┬────────┐
│        │    Screens & Controls      │        │
│ Blocks │  ┌──────────────┐           │Template│
│ Sidebar│  │ Desktop      │           │ Sidebar│
│        │  │ Mobile       │           │        │
│        │  │ Drawing      │           │        │
│        │  │ AI Chat      │           │        │
└────────┴────────────────────────────┴────────┘
```

### Component Composition

**Builder Page** (`pages/builder.vue`), under **builder** layout (no global navbar):
- Left sidebar (blocks), center screens panel, right sidebar (templates)
- Full editor interface; no top navbar so layout and overflow behave as designed

### Layout Constraints

Builder-specific CSS preserved exactly:
- `.main-container` - 3-column flex layout
- `.sidebar` - Fixed-width columns with overflow
- `.screens-inner` - Scaled screen rendering
- `.screens-panel` - Drawing, AI chat, controls

**Critical**: No layout changes to builder. Simply relocated from `/` to `/builder`.

### Builder screens display (layout recovery)

**Root cause (three issues):**

1. **Screen centering lost:** `ScreensPanel` applies an inline `transform: scale(...)` on each `ScreenCard`. Scoped CSS had `.screen-scale-wrapper > .screen { transform: translateX(-50%); }` to center the screen in the wrapper. Inline style overrides the stylesheet, so the horizontal centering was lost and screens could appear off-center or misaligned.

2. **Responsive collapse:** In `editor.css`, at `max-width: 1200px`, `.main-container` was set to `height: auto`. With `height: auto`, the flex container no longer has a definite height, so the flex chain (`.screens-container` → `.screens-panel` → `.screens-inner`) could not allocate space correctly. The screens area could collapse or get minimal height on smaller viewports.

3. **Canvas dimension mismatch:** `CANVAS_DIMENSIONS` in `constants/builder.ts` (650×380, 306×520) did not match `ScreenCard` CSS (700×550, 330×600) or `useScreenScaling` natural dimensions. That could cause wrong initial layout or drawing overlay mismatch.

**Changes made:**

- **ScreensPanel.vue:** Combined transform so centering is preserved: inline style now uses `transform: translateX(-50%) scale(...)` for both desktop and mobile. Kept `.screen-scale-wrapper > :deep(.screen)` with `position: absolute; top: 0; left: 50%;` so the wrapper still positions the screen; centering is done in the inline transform.
- **editor.css:** In the `@media (max-width: 1200px)` block, set `.main-container` to `height: 100vh` and `min-height: 100vh`, and `overflow: auto`, so the flex chain has a definite height. Set `.screens-container` to `flex: 1 1 0` so it receives a share of the viewport.
- **constants/builder.ts:** Set `CANVAS_DIMENSIONS` to `desktop: { width: 700, height: 550 }`, `mobile: { width: 330, height: 600 }` to match `ScreenCard` and `useScreenScaling`.

**Verification:** Open the builder from a request (`/gallery/request/[id]/builder`) or order (`/orders/[id]/builder`). Confirm: (1) Desktop and mobile screens are centered in the center column. (2) At viewport width ≤1200px, the screens area has usable height and scrolls if needed; no collapsed center column. (3) Layout from request/order state loads correctly; no clipping of screens. (4) Resize the window and toggle mobile/desktop; scaling and centering remain correct.

**Revert:** To revert: restore `.main-container { height: auto }` in the 1200px media block; restore previous `CANVAS_DIMENSIONS`; in ScreensPanel remove `translateX(-50%)` from the inline transforms and restore the original `.screen-scale-wrapper > .screen` rule with `transform: translateX(-50%)` only in CSS (centering will again be overridden by inline scale; for full revert, also remove the scale from inline and apply scale via a wrapper or separate element if needed).

**Code summary:**

| File | Change |
|------|--------|
| `app/components/ScreensPanel.vue` | Inline transform now includes `translateX(-50%)` with scale so centering is not overridden; use `:deep(.screen)` for positioning. |
| `app/assets/css/editor.css` | At 1200px breakpoint: `height: 100vh`, `min-height: 100vh`, `overflow: auto` on `.main-container`; `flex: 1 1 0` on `.screens-container`. |
| `app/constants/builder.ts` | `CANVAS_DIMENSIONS` set to 700×550 (desktop) and 330×600 (mobile) to match ScreenCard and useScreenScaling. |

### Builder UI Restructure (Drawing dashboard, headers, SidebarBranding)

**Changes:**
- **DrawingControlsPanel** moved from bottom to top of ScreensPanel, under the "Editing page layout" bar.
- **Dashboard gradient** removed; panel uses `var(--color-bg-muted)`.
- **Right sidebar header** now identical to left (`.sidebar-header` with "Templates").
- **SidebarBranding.vue** removed. Account/help actions available via UserMenu in AppNavbar (dashboard, sites, etc.); builder layout has no navbar.

**Verification:** Builder from request page, My Sites, or `/orders/:id/edit`; drawing dashboard at top; no gradient; left and right headers match; no SidebarBranding; `.screens-inner` not clipped; keyboard tab order logical.

**Rollback:** Revert commits in reverse order: (1) docs/tests, (2) SidebarBranding removal, (3) gradient, (4) dashboard move, (5) right header.

---

## App Root and Layouts

### app.vue

```vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

**Purpose**: Root entry. Renders the active layout (default or builder), which wraps the current page.

### Layouts

- **default** (`layouts/default.vue`): Renders the global **AppNavbar** and `<slot />` for the page. Used by `/`, `/dashboard`, `/gallery/request/[id]`, `/login`, `/reset-password`.
- **builder** (`layouts/builder.vue`): Renders only `<slot />` (no navbar). Used by `/builder` so the editor has the full viewport and no top bar.

**Page assignment**:
- Pages that need the shared navbar use the default layout (Nuxt’s default when no `layout` is set in `definePageMeta`).
- Builder sets `definePageMeta({ layout: 'builder' })` so it does not show the global navbar.

### Global Navbar (AppNavbar)

- **Single component**: `components/AppNavbar.vue`; styles in `assets/css/navbar.css`.
- **Content**: Logo (Kothar → `/`), optional "Back to Dashboard" on request page, **UserMenu**, and on landing only an auth-aware CTA (Start Building / Dashboard).
- **Auth**: Uses `useAuth()`; CTA is wrapped in `<ClientOnly>` with a placeholder to avoid hydration mismatch.

---

## State Management & Data Persistence

### Store Scope

All stores remain global and persist across route changes:
- **business** - Global business data (persists across routes)
- **blocks** - Desktop/mobile block customizations (persists across routes)
- **quiz** - Quiz completion status (persists across routes)
- **templates** - Template library (persists across routes)
- **aiChat** - AI chat history (persists across routes)

### Navigation Impact

Navigation between `/` and `/builder` does **not**:
- Reset stores or state
- Clear block customizations
- Reset business information
- Clear drawing annotations

Navigation **only** changes:
- Which page component is rendered
- Visual layout and UI context
- Navigation state (current route)

---

## Integration Boundaries

### Landing Page Boundaries

**What the landing page includes**:
- Hero section with messaging
- Feature highlights
- Call-to-action buttons
- Navigation to builder
- Footer with secondary CTAs
- Responsive design

**What the landing page excludes**:
- No builder UI (screens, blocks, sidebar)
- No editor tools (drawing, inline editing)
- No business information editor
- No template library
- No AI chat

**Layout Independence**:
- Landing page has its own layout (full-width, centered sections)
- Builder-specific CSS does not apply
- No `.main-container`, `.sidebar`, `.screens-inner` classes

### Builder Page Boundaries

**What the builder page includes**:
- Exact existing implementation from current index.vue
- Left sidebar (available blocks)
- Center screens panel (desktop/mobile canvas)
- Right sidebar (templates)
- InfoBar (business information editor)
- Drawing controls and AI chat
- All editor interactions

**What the builder page excludes**:
- Landing marketing messaging
- Public-facing hero section
- Feature highlights

**Layout Safety**:
- Builder layout unchanged from current implementation
- All CSS, sizing, scrolling behavior preserved
- `.screens-inner` behavior and constraints intact
- Sidebar widths (280px) and spacing maintained

---

## Navigation Patterns

### From Landing to Builder

**Scenario 1: User clicks "Get Started"**
```vue
<template>
  <button @click="goToBuilder">Get Started</button>
</template>

<script setup>
const router = useRouter();
const goToBuilder = () => router.push('/builder');
</script>
```

**Scenario 2: User clicks navigation link**
```vue
<NuxtLink to="/builder" class="nav-link">Start Building</NuxtLink>
```

**Result**:
- App stays mounted, only `<NuxtPage />` changes
- Business store state preserved (if quiz completed)
- User lands on builder with pre-filled data

### From Builder to Landing

**Scenario 1: User clicks home/logo**
```vue
<template>
  <div class="nav-header">
    <NuxtLink to="/" class="logo">Kothar</NuxtLink>
  </div>
</template>
```

**Scenario 2: Programmatic navigation**
```vue
<script setup>
const router = useRouter();
const goHome = () => router.push('/');
</script>
```

**Result**:
- User returns to landing page
- All builder state preserved
- User can navigate back to `/builder` and resume editing

### Quiz Flow Integration

**Quiz Placement**: `app.vue` (global level)

**Flow**:
1. App mounts, checks `quizStore.quizCompleted`
2. If not completed, shows QuizModal (overlays current page)
3. User completes quiz
4. Business data transferred to `businessStore`
5. Quiz modal hidden, page becomes interactive
6. User can navigate to builder or stay on landing

**No Impact**: Landing page and builder page both work with or without quiz completion.

---

## Extensibility Considerations

### Adding New Routes

To add new pages in the future:

1. **Create page file**: `pages/new-page.vue`
2. **Route automatically created**: `/new-page`
3. **Navigation**: Use `<NuxtLink to="/new-page">` or `router.push('/new-page')`
4. **State access**: All Pinia stores available on new page

### Sharing Layout Components

Navigation is centralized:
- **AppNavbar** is used only inside **layouts/default.vue**. Pages that use the default layout (landing, dashboard, gallery request, login, reset-password) automatically get the same navbar.
- The builder does not use the global navbar; it uses **layout: 'builder'**, which has no header.
- Do not add per-page navbars; extend or configure AppNavbar if behaviour must differ by route.

### Styling New Pages

- **Global styles**: `app/assets/css/style.css` (base typography, utilities)
- **Page-specific styles**: Create `assets/css/{page}.css` and import in page component
- **Scoped styles**: `<style scoped>` for component-specific overrides
- **Design system**: Reuse spacing, colors, typography from existing constants

### Store Extensions

To extend state management:
1. Create new Pinia store in `stores/{name}.ts`
2. Use composable pattern (optional): `composables/use{Name}.ts`
3. Import store into pages/components: `const store = use{Name}Store()`
4. State persists across all routes automatically

---

## Testing & Verification Checklist

### Landing Page Verification
- [ ] Landing page renders at `/`
- [ ] Hero section visible with messaging
- [ ] Call-to-action button present and clickable
- [ ] Navigation to `/builder` redirects to login if not authenticated
- [ ] Navigation to `/builder` works if authenticated
- [ ] Responsive layout on mobile
- [ ] Styling consistent with design system
- [ ] No builder UI or editor controls visible

### Builder Page Verification
- [ ] Builder renders at `/builder` when authenticated
- [ ] Unauthenticated direct URL access redirects to `/login?redirect=/builder`
- [ ] No UI flicker or partial render before redirect
- [ ] All sidebars visible (left, right) when authenticated
- [ ] Screens panel with desktop/mobile canvas
- [ ] Drag-and-drop block functionality works
- [ ] Inline editing functional
- [ ] Drawing tools accessible
- [ ] AI chat panel present
- [ ] Layout constraints preserved (sizing, scrolling)
- [ ] Navigation back to landing works

### Authentication Verification
- [ ] Direct URL `/builder` while logged out → redirects to `/login`
- [ ] Client navigation to `/builder` while logged out → redirects to `/login`
- [ ] Refresh on `/builder` while logged in → stays on builder
- [ ] Refresh on `/builder` while logged out → redirects to `/login`
- [ ] `/login` while logged in → redirects to `/builder`
- [ ] `/reset-password` while logged in → redirects to `/builder`
- [ ] Login with redirect query → returns to original destination
- [ ] No SSR leak of protected content

### Route Navigation Verification
- [ ] Landing → Builder navigation works (when authenticated)
- [ ] Builder → Landing navigation works
- [ ] Back button (browser) works correctly
- [ ] Query parameters preserved (redirect URL on login)
- [ ] State persists across route changes
- [ ] No layout breaks or visual glitches

### State Persistence Verification
- [ ] Quiz completion state persists across routes
- [ ] Business data survives landing → builder navigation
- [ ] Block customizations saved across navigation
- [ ] Stores remain mounted across routes

---

## Summary

Kothar has a proper multi-page architecture with authentication:

1. **Landing Page** (`/`) - Public-facing entry point with marketing messaging
2. **Dashboard** (`/dashboard`) - Central hub with builder access and integrated templates showcase
3. **Builder Page** (`/builder`) - Protected editor interface (requires authentication)
4. **Template Request** (`/gallery/request/[id]`) - SMB onboarding form for template requests
5. **Login Page** (`/login`) - Authentication page (guest-only, redirects auth users)
6. **Reset Password** (`/reset-password`) - Password recovery (guest-only)
7. **Route Protection** - SSR-safe middleware blocks unauthorized access before render
8. **Shared State** - All stores persist and are accessible from authenticated pages
9. **Clean Navigation** - Router-based with automatic auth redirects
10. **Layout Separation** - No style bleeding between pages
11. **Extensibility** - Easy to add new routes with `auth` or `guest` middleware

**Authentication Flow:**
- Unauthenticated users clicking "Start Building" → redirected to `/login`
- After login → redirected to `/dashboard` (or original destination if specified)
- Authenticated users visiting `/login` → redirected to `/dashboard`
- Direct URL access to `/dashboard` while logged out → redirected to `/login`
- No UI flicker, no SSR leak, no race conditions

**Removed Routes:**
- ~~`/gallery`~~ - Templates are now integrated directly into the dashboard

**Last Updated**: March 9, 2026

````
