# Architecture Deep Dive

**Complete system design, data flow, and architectural patterns.**

---

## System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                 │
│  Vue Components (Blocks, Screens, UI Controls)     │
│  - Render UI                                        │
│  - Handle user interactions                         │
│  - Call composables for data                        │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                   LOGIC LAYER                       │
│  Composables (useBlockData, useBusinessData, etc.)│
│  - Business logic                                   │
│  - Data transformation                              │
│  - Store abstraction                                │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│                   DATA LAYER                        │
│  Pinia Stores (blocks, business, sites)            │
│  - State management                                 │
│  - Data persistence (in-memory)                     │
│  - Single source of truth                           │
└─────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Dual Store Pattern

The application uses two separate data stores with distinct responsibilities:

#### 1. Business Store (Global, Read-Only in Blocks)

**Purpose**: Single source of truth for company information

**Data Structure**:
```typescript
{
  companyName: string,
  email: string,
  telephone: string,
  address: string,
  city: string,
  postalCode: string,
  website: string,
  businessHours: string,
  taxId: string
}
```

**Edited By**: InfoBar component (top of page)  
**Read By**: All blocks via `useBusinessData()` composable  
**Persistence**: In-memory only (resets on refresh)

#### 2. Blocks Store (Local, Per-Instance)

**Purpose**: Store customizations unique to each block instance

**Data Structure**:
```typescript
{
  screens: {
    desktop: {
      'el-hero-123': {
        blockId: 'el-hero-123',
        blockType: 'hero',
        customData: {
          title: 'Custom Hero Title',
          subtitle: 'Custom subtitle',
          buttonText: 'Click Me'
        }
      },
      'el-footer-456': { ... }
    },
    mobile: {
      'el-hero-789': { ... }
    }
  }
}
```

**Key Points**:
- Separate storage per screen (desktop/mobile) via `screens` object
- Each block instance has unique `blockId`
- `customData` holds all editable fields per instance
- Desktop and mobile can have different customizations for the same block
- Store functions take `screenId` as first parameter for clarity

#### 3. Sites Store (Live Sites)

**Purpose**: State for delivered ("live") websites. Used by `/sites` (list) and `/sites/:id` (control panel). Live sites are **not** edited in the builder; the builder is for design selection and request flow only.

**Data**: `SiteSummary` (list view) and `SiteDetails` (full content for one site: hero, services, contact, business hours, seasonal announcement). Setup-style store with getters (`siteSummaries`, `getSiteById`), actions (`updateSiteHero`, `updateSiteBusinessHours`, etc.), and helpers (`getStatusLabel`, `formatLastUpdated`).

**Persistence**: In-memory only (no backend yet). One hardcoded site for demo.

---

## Block Lifecycle

### 1. Block Creation

```
User drags block from sidebar
          ↓
ItemsList.vue cloneItem() generates unique blockId
          ↓
Block added to desktopList/mobileList array
          ↓
Block component receives blockId prop
          ↓
useBlockData(blockId) initializes storage
```

### 2. Block Rendering

```
ItemsList.vue iterates over list
          ↓
For each item, renders <component :is="getComponent(type)">
          ↓
Passes :block-id and :screen-type as props
          ↓
Block component calls useBlockData(blockId)
          ↓
Retrieves customData or falls back to defaults
```

### 3. Block Editing

```
User clicks contenteditable field
          ↓
Field becomes editable (focus state)
          ↓
User types new content
          ↓
@blur event fires when user clicks away
          ↓
Update handler calls setField(fieldName, newValue)
          ↓
useBlockData saves to blocks store
          ↓
Component re-renders with new data
```

### 4. Block Deletion

```
User clicks × button on block
          ↓
ItemsList emits 'remove' event with blockId
          ↓
Parent removes item from list array
          ↓
Block component unmounts
          ↓
(Data remains in store - no cleanup)
```

---

## Composable Pattern

### Why Composables?

Composables provide **abstraction between components and stores**, offering:

1. **Decoupling**: Components don't import stores directly
2. **Reusability**: Same logic used across multiple components
3. **Testability**: Easy to mock composables for testing
4. **Type Safety**: TypeScript interfaces for all returns
5. **Computed Properties**: Reactive data with minimal boilerplate

### Composable Architecture

```typescript
// Component (Presentation)
const { getField, setField, isLocalValue, mergedData } = useBlockData(blockId);

// Composable (Logic)
function useBlockData(blockId) {
  const blocksStore = useBlocksStore();
  const businessData = useBusinessData();
  
  const getField = (name) => blocksStore.getBlockData(...);
  const setField = (name, val) => blocksStore.updateBlockCustomField(...);
  
  return { getField, setField, ... };
}

// Store (Data)
export const useBlocksStore = defineStore('blocks', () => {
  const screens = ref({...});
  return { screens, getBlockData, updateBlockCustomField };
});
```

---

## Layouts and Navigation

The app uses Nuxt 4 layouts for global structure:

- **app.vue**: Root entry; wraps content in `<NuxtLayout><NuxtPage /></NuxtLayout>`.
- **layouts/default.vue**: Used by landing, gallery, gallery request, login, and reset-password. Renders the shared **AppNavbar** and a slot for the page.
- **layouts/builder.vue**: Used only by the builder page. Renders only the slot (no navbar), so the editor has full viewport for the 3-column layout.

**Request layout and builder save:** The page layout being edited for a request/order lives in the request layout store; a single canonical type (`OrderLayoutBlock` is an alias of `BlockItem`) is used from builder UI through to Firestore. Save is performed only via the **`useBuilderSave`** composable; the BuilderEditor component wires it and does not persist directly. Order documents read from Firestore are validated at the boundary with **`parseOrderDocument`** before entering store state (see `docs/18-FIREBASE-FIRESTORE-STORAGE.md`).

**AppNavbar** (`components/AppNavbar.vue`) is the single source of global navigation:
- Logo (Kothar) links to `/`.
- On `/gallery/request/*`, a "Back to Gallery" link is shown.
- **UserMenu** is always shown (Sign In when guest; avatar and dropdown when authenticated). When authenticated: Gallery, **My Live Sites** (`/sites`), Sign Out.
- On the landing page (`/`), an auth-aware CTA is shown: "Start Building" → `/login` when guest, "Gallery" → `/gallery` when authenticated.
- Navbar styles live in `assets/css/navbar.css` and use global design tokens from `style.css`.

---

## Domain Models and Layering

Canonical domain models live in `app/types` and are shared across UI, composables, and persistence:

- **Orders & Requests**: `OrderRequest`, `OrderWithId`, `OrderLayout`, `OrderLayoutBlock` (alias of `BlockItem`) in `app/types/order.ts`.
- **Builder/Layout**: `BlockType`, `BlockItem`, `DrawingState`, `ScreenId`, `ScreenCardRefShape` in `app/types/builder.ts`.
- **Templates**: `ShowcaseTemplate` and related types in `app/stores/showcase.ts`.
- **Auth & Sessions**: `AuthUser`, `SessionClaims`, and related types in `app/types/auth.ts`.
- **Whop / access**: `AccessBillingSnapshot` and API responses in `app/types/access.ts`; entitlement state in `stores/whopAccess.ts`; client API via `useWhopAccess()` (backed by `GET /api/access/me`). Submission-time gating only — builder and draft layout saves do not require access.

Layering is enforced end-to-end:

- **UI components** render and emit events; they never talk to Firestore directly.
- **Composables** (e.g. `useBuilderSave`, `useDrawing`, `useTemplateApplication`, `useOrderSubmission`, `useOrderUpdate`) orchestrate behavior and operate on the canonical types.
- **Stores and persistence** (Pinia stores and Firebase composables/server utilities) own state and I/O, including immutable updates and runtime validation.

All shared state (layouts, orders, templates, requests) is updated immutably by replacing arrays/objects via store/composable APIs rather than mutating nested properties.

Logging is centralized:

- Client code uses `logger` from `app/utils/logger.ts` instead of `console.*`.
- Server code uses `logger` from `server/utils/logger.ts` for `[server]`-prefixed diagnostics.

---

## Developer Workflow and Verification

Recommended checks when working on this codebase:

- **Typecheck**: Run `npm run typecheck` to ensure the project passes strict TypeScript checks.
- **Builder layout round-trip**:
  - Open a request (gallery or order), navigate to the builder, add/move/remove blocks, and click Save.
  - Reload the page and re-open the builder; the layout should exactly match the last save and produce no console errors.
- **Request creation and submission**:
  - Create a draft request from the Gallery, fill out the form, and submit.
  - Verify a new order appears in the Gallery/sites with the expected status and layout.
- **Order edit**:
  - Open an existing order in edit mode, change form fields and/or layout, and save.
  - Confirm the changes persist and the layout round-trip behavior remains correct.

These flows exercise the canonical models (orders, layouts, templates), the `useBuilderSave` composable, immutable store updates, and runtime Firestore validation via `parseOrderDocument`.

**Live Sites** (`/sites`, `/sites/:id`): Delivered websites are managed here, not in the builder. The builder is for design selection and the request flow only. Live sites have their own Pinia store (`stores/sites.ts`) and control-panel UI for content updates, business hours, seasonal announcements, and change requests. No pathway from live sites back into the builder to "rebuild."

No page implements its own navbar; all use the default layout and shared AppNavbar except the builder, which uses the builder layout.

---

## CSS and Styling Architecture

**Global CSS** (loaded via `nuxt.config.ts` `css` array, in order):
1. `app/assets/css/style.css` – Reset, base typography, **design tokens** (`:root`), utilities, and landing section wrappers that target child component roots.
2. `app/assets/css/components.css` – Shared UI patterns (buttons, modal, device frames, toggle group, form elements). Uses tokens from `style.css`.
3. `app/assets/css/navbar.css` – AppNavbar only. Uses tokens from `style.css`.

**Design tokens** (`:root` in `style.css`):
- **Colors**: `--color-primary`, `--color-primary-dark`, `--color-primary-tint`, `--color-bg`, `--color-border`, `--color-text`, `--color-text-muted`, etc. No hardcoded hex in token-using files.
- **Focus**: `--focus-ring-primary` for focus-within box-shadow on form sections and selectable options.
- **Spacing**: `--space-xs` through `--space-3xl` (rem scale).
- **Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- **Layout**: `--container-max: 1200px` for all main content containers (navbar, landing, gallery, request-form footer).

**Page-scoped CSS** (loaded per page via `<style scoped src="...">`; do not re-import `style.css`):
- Landing: `landing.css` (extends with `--landing-*` on `.landing-container`).
- Gallery: `gallery.css`.
- Builder: `editor.css`.
- Sites (list and detail): `sites.css`.
- Gallery request: `request-form.css`.
- Showcase (component): `showcase.css` (uses `--showcase-*` from template).

**Breakpoints** (use consistently in `@media`): `480px`, `640px`, `768px`, `900px`, `1024px`, `1200px`.

**Container usage**: Sections use `max-width: var(--container-max)` (or page-local equivalent) and `margin: 0 auto`. No content exceeds container width unless explicitly full-bleed.

**Scoped styles**: Component-specific styles use Vue scoped `<style scoped>` or scoped page CSS. No reliance on incidental global side effects. No `!important`; cascade is resolved via structure and specificity.

---

## Component Hierarchy

### My Sites Page (`pages/sites/index.vue`)

```
sites/index.vue  [uses default layout → AppNavbar + slot]
├── SitesWelcomeHeader
│   ├── Title + subtitle
│   └── Gallery CTA (Open Gallery → /gallery)
├── SitesTabList (role="tablist", Live Sites | Orders)
├── SitesLiveSitesPanel (role="tabpanel", visible when Live Sites active)
│   ├── Table of site entries (business, domain, last update, status, Manage)
│   └── SitesEmptyState (when no sites)
└── SitesOrdersPanel (role="tabpanel", visible when Orders active)
    ├── Table of order entries (template, submitted, status, editing, Modify)
    └── SitesEmptyState (when no orders; CTA → Gallery)
```

### Builder / Main Editor Page (`pages/index.vue` or builder pages)

```
index.vue (Main Page)  [uses default layout → AppNavbar + slot]
├── InfoBar
│   └── (Business form fields)
├── ScreensPanel
│   ├── DrawingControlsPanel (at top, under "Editing page layout" bar)
│   ├── .screens-area (flex: 1, position: relative)
│   │   ├── .screens-inner — ScreenCard (Desktop), ScreenCard (Mobile)
│   │   └── AiChatPanel (overlay, does not affect layout)
│   ├── ScreenCard (Desktop)
│   │   ├── ScreenHeader
│   │   ├── ItemsList (render-mode="canvas")
│   │   │   └── Dynamic Block Components
│   │   │       ├── HeroBlock
│   │   │       ├── NavBlock
│   │   │       └── ...
│   │   └── DrawingOverlay
│   │       ├── VueDrawingCanvas
│   │       └── DrawingToolControls
│   └── ScreenCard (Mobile)
│       └── (Same structure)
├── ItemsList (sidebar - "available")
│   └── (render-mode="preview")
└── ItemsList (sidebar - "unused")
    └── (render-mode="preview")
```

---

## State Management Flow

### Business Data Flow

```
User types in InfoBar
        ↓
v-model updates businessStore.companyName
        ↓
businessStore.companyName is reactive ref
        ↓
useBusinessData() returns computed(() => businessStore.companyName)
        ↓
Block components read via mergedData.value.companyName
        ↓
Blocks display updated value automatically
```

### Block Data Flow

```
User edits block field (contenteditable)
        ↓
@blur event fires
        ↓
updateTitle(e) handler called
        ↓
setField('title', newValue)
        ↓
useBlockData → blocksStore.updateBlockCustomField()
        ↓
blocksStore.screens.value[screenId][blockId].customData[fieldName] = value
        ↓
getField('title') returns new value
        ↓
blockData computed updates
        ↓
Component re-renders with new content
```

---

## Design Patterns

### 1. Composition API Pattern

All components use `<script setup>` with composition API:
- No `data()`, `methods`, `computed` options
- Direct use of `ref()`, `computed()`, composables
- Auto-imports via Nuxt 4

### 2. Props + Emits Pattern

Components communicate via:
- **Props**: Pass data down (reactive)
- **Emits**: Events bubble up (functions)
- **v-model**: Two-way binding shorthand

### 3. Store Pattern (Pinia)

Stores defined with composition API style:
```typescript
export const useMyStore = defineStore('myStore', () => {
  const data = ref(initialValue);
  const computed = computed(() => ...);
  const action = () => { ... };
  return { data, computed, action };
});
```

### 4. Inline Editing Pattern

Instead of form inputs:
```vue
<div 
  contenteditable="true"
  @blur="saveContent"
>
  {{ content }}
</div>
```

Benefits:
- No modal dialogs
- Edit in place
- Visual WYSIWYG experience
- Auto-save on blur

---

## Screen Management

### Desktop vs Mobile

Two separate canvases with independent:
- Block lists (`desktopList`, `mobileList`)
- Drawing overlays (separate canvas refs)
- Drawing strokes (separate arrays)
- Block customizations (separate in blocks store)

### Why Separate?

Allows users to:
- Show different blocks on mobile vs desktop
- Customize same block differently per screen
- Have mobile-specific layouts
- Test responsive designs

---

## Drawing System Architecture

```
ScreenCard
└── DrawingOverlay
    ├── <canvas> (vue-drawing-canvas)
    ├── DrawingToolControls
    │   ├── Pen/Highlighter/Eraser
    │   ├── Color picker
    │   ├── Line width
    │   └── Text mode toggle
    └── State from useDrawing()
```

**Drawing State** (per screen):
```typescript
{
  isDrawingMode: boolean,
  strokeType: 'dash' | 'line',
  color: '#000000',
  lineWidth: 5,
  isTextMode: boolean,
  textFontSize: 16,
  textColor: '#000000',
  textFontFamily: 'Arial'
}
```

**Strokes Array**: Stores all drawn paths for persistence

---

## Data Flow Diagrams

### Editing a Block Field

```
┌──────────────┐
│ User clicks  │
│ editable div │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ contenteditable│
│ = "true"     │
│ User types   │
└──────┬───────┘
       │ @blur
       ▼
┌──────────────┐
│ updateField()│
│ handler      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ setField()   │
│ (composable) │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ blocksStore  │
│ .update...() │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Store updates│
│ Vue reactivity│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Component    │
│ re-renders   │
└──────────────┘
```

### Reading Business Data in Block

```
┌──────────────┐
│ Block mounts │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ useBlockData │
│ (blockId)    │
└──────┬───────┘
       │ calls
       ▼
┌──────────────┐
│useBusinessData│
│ ()           │
└──────┬───────┘
       │ returns
       ▼
┌──────────────┐
│ mergedData   │
│ computed     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Combines:    │
│ - business   │
│ - customData │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ blockData    │
│ computed     │
│ uses merged  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Template     │
│ renders value│
└──────────────┘
```

---

## Performance Considerations

### Reactivity Optimization

- Use `computed()` for derived state (auto-caches)
- Store refs in stores, not in components
- Minimal prop drilling (use composables instead)

### Component Optimization

- Scoped CSS (no global style pollution)
- Dynamic imports for large components (if needed)
- Keyed lists (`:key="element.id"` in v-for)

### Render Optimization

- `render-mode` prop on ItemsList (preview vs canvas)
- Conditional rendering (`v-if` for unmounting)
- Lazy loading blocks (current: all imported upfront)

---

## Extension Points

### Adding a New Block

1. Create `app/components/BlockElements/MyBlock.vue`
2. Import in `app/components/ItemsList.vue`
3. Add to `componentMap` object
4. Add to `availableList` in `index.vue`

### Adding New Business Fields

1. Add to `business` store state
2. Add to `useBusinessData` composable
3. Add to InfoBar fields array

### Adding New Composable

1. Create `app/composables/useMyFeature.ts`
2. Export function with return object
3. Use in components (auto-imported by Nuxt)

---

**Next**: [Block System](03-BLOCK-SYSTEM.md)
