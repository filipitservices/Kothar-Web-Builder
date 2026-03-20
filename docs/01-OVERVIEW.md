# Kothar - Site Builder Application

**A Nuxt 4 + Vue 3 + Pinia website builder with drag-and-drop blocks, inline editing, and dual-screen preview.**

---

## What This Application Does

Kothar is a visual website builder that allows users to:
- Drag pre-built blocks (Hero, Nav, Footer, Form, etc.) onto desktop/mobile screens
- Edit content inline using contenteditable fields
- Store global business information (company name, email, contact info)
- Customize block content per instance (each block can have unique text)
- Draw annotations on screens using canvas overlay
- Preview desktop and mobile layouts side-by-side

---

## Core Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface                     │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  InfoBar   │  │  Screens   │  │ Sidebars  │ │
│  │(Business)  │  │(D+M Canvas)│  │(Blocks)   │ │
│  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Business │  │  Blocks  │  │   Quiz   │
   │  Store   │  │  Store   │  │  Store   │
   └──────────┘  └──────────┘  └──────────┘
         │             │             │
         └─────────────┼─────────────┘
                       ▼
              ┌─────────────────┐
              │   Composables   │
              │ (Business Logic)│
              └─────────────────┘
```

### Key Concepts

**1. Dual Data System**
- **Global Data**: Business information (company name, email, address, etc.) stored in `business` store - shared across all blocks
- **Local Data**: Block-specific customizations stored in `blocks` store - unique per block instance
- **Storage**: Per-screen organization (desktop/mobile) allowing different layouts

**2. Block System**
- 13 pre-built block types (Hero, Nav, Footer, Form, Features, etc.)
- Each block instance has unique `blockId` (e.g., `el-navbar-1234567890`)
- Blocks can be dragged between screens and edited inline
- Desktop and mobile screens maintain independent block lists and customizations

**3. Inline Editing**
- Blocks use `contenteditable` divs for editing (no input fields)
- Changes save automatically on blur event
- Visual feedback for customized fields (bold text)
- Falls back to global business data when not customized

**4. Drawing System**
- Canvas overlay on each screen for annotations
- Tools: pen, highlighter, eraser, text
- Per-screen drawing persistence
- Can toggle drawing mode on/off

---

## Technology Stack

- **Framework**: Nuxt 4 (Vue 3 + Auto-imports)
- **State Management**: Pinia stores
- **Styling**: Scoped CSS with design system
- **Drag & Drop**: vue-draggable (Sortable.js wrapper)
- **Drawing**: vue-drawing-canvas
- **TypeScript**: Partial (stores, composables)

---

## Project Structure

```
app/
├── components/
│   ├── BlockElements/          # 13 block types
│   │   ├── HeroBlock.vue
│   │   ├── NavBlock.vue
│   │   ├── FooterBlock.vue
│   │   ├── FormBlock.vue
│   │   └── ...                 # 9 more blocks
│   ├── DrawingOverlay.vue      # Canvas annotation
│   ├── InfoBar.vue             # Business info form
│   ├── ItemsList.vue           # Draggable list renderer
│   ├── ScreenCard.vue          # Single screen container
│   ├── ScreensPanel.vue        # Desktop + Mobile wrapper
│   └── QuizModal.vue           # Onboarding quiz
├── composables/
│   ├── useBlockData.ts         # Block data access
│   ├── useBusinessData.ts      # Business data access
│   ├── useDrawing.ts           # Drawing state
│   ├── useValidation.ts        # Form validation
│   ├── useElementConstraints.ts
│   ├── useListSyncing.ts
│   └── useScreenScaling.ts
├── stores/
│   ├── blocks.ts               # Per-block customizations
│   ├── business.ts             # Global company info
│   └── quiz.ts                 # Quiz state & questions
├── pages/
│   └── index.vue               # Main editor page
└── plugins/
    ├── vue-drawing-canvas.ts
    └── vuedraggable.ts

firebase/                        # Firebase security rules (see docs/18)
├── firestore.rules              # Firestore rules; deploy with firebase deploy --only firestore
└── storage.rules                # Storage rules; deploy with firebase deploy --only storage

docs/
├── 01-OVERVIEW.md              # This file
├── 02-ARCHITECTURE.md          # Detailed architecture
├── 03-BLOCK-SYSTEM.md          # How blocks work
├── 04-DATA-FLOW.md             # State management
├── 05-API-REFERENCE.md         # Composables & stores
└── 06-COMPONENT-CATALOG.md     # All components
```

---

## Quick Start Guide

### For AI Agents Understanding This Codebase

1. **Start Here**: Read this overview (you're doing it!)
2. **Architecture**: Read [02-ARCHITECTURE.md](02-ARCHITECTURE.md) for system design
3. **Blocks**: Read [03-BLOCK-SYSTEM.md](03-BLOCK-SYSTEM.md) to understand block lifecycle
4. **Data**: Read [04-DATA-FLOW.md](04-DATA-FLOW.md) for store → composable → component flow
5. **API**: Reference [05-API-REFERENCE.md](05-API-REFERENCE.md) for function signatures
6. **Components**: Browse [06-COMPONENT-CATALOG.md](06-COMPONENT-CATALOG.md) for all components

### For Developers

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Access at http://localhost:3000
```

---

## Key Files to Understand

| File | Purpose |
|------|---------|
| `app/pages/index.vue` | Landing page (public) |
| `app/pages/gallery/index.vue` | Central hub with builder + templates (protected) |
| `app/pages/builder.vue` | Main editor page (protected, requires auth) |
| `app/pages/sites/index.vue` | My Sites: Live Sites + Orders tabs (protected) |
| `app/pages/sites/[id].vue` | Site control panel (protected) |
| `app/pages/gallery/request/[id].vue` | Template request form (protected) |
| `app/pages/orders/[id]/edit.vue` | Order edit form (protected; locked orders redirect to /sites) |
| `app/pages/login.vue` | Authentication page |
| `app/middleware/auth.ts` | Route protection middleware |
| `app/middleware/guest.ts` | Guest-only route middleware |
| `app/stores/blocks.ts` | Block customization storage |
| `app/stores/business.ts` | Global business data |
| `app/stores/auth.ts` | Authentication state |
| `app/stores/showcase.ts` | Professional template showcase data |
| `app/stores/sites.ts` | Live sites (delivered websites) state |
| `app/stores/orders.ts` | User orders from Firestore (list, subscribe, fetch by id) |
| `app/composables/useBlockData.ts` | Block data access API |
| `app/composables/useBusinessData.ts` | Business data access API |
| `app/composables/useAuth.ts` | Authentication API |
| `app/composables/useOrderSubmission.ts` | Order submission (Firestore + Storage) |
| `app/composables/useOrderUpdate.ts` | Order update (edit flow; does not write status or modificationLocked) |
| `firebase/firestore.rules` | Firestore security rules (deploy with Firebase CLI) |
| `firebase/storage.rules` | Storage security rules (deploy with Firebase CLI) |
| `app/components/ItemsList.vue` | Renders draggable blocks |
| `app/components/ScreenCard.vue` | Single screen container |
| `app/components/ShowcaseModal.vue` | Template preview modal |
| `app/components/sites/SitesWelcomeHeader.vue` | My Sites page header + Gallery CTA |
| `app/components/sites/SitesTabList.vue` | Live Sites / Orders tab list |
| `app/components/sites/SitesLiveSitesPanel.vue` | Live sites table panel |
| `app/components/sites/SitesOrdersPanel.vue` | Orders table panel |
| `app/components/sites/SitesEmptyState.vue` | Empty state for sites/orders |

---

## Documentation Navigation

1. [Overview](01-OVERVIEW.md) ← You are here
2. [Architecture](02-ARCHITECTURE.md) - System design
3. [Block System](03-BLOCK-SYSTEM.md) - How blocks work
4. [Data Flow](04-DATA-FLOW.md) - State management
5. [API Reference](05-API-REFERENCE.md) - Functions & interfaces
6. [Component Catalog](06-COMPONENT-CATALOG.md) - All components
7. [Routing & Landing](11-ROUTING-AND-LANDING.md) - Page structure & auth
8. [Firebase Auth](16-FIREBASE-AUTH.md) - Authentication system
9. [Firebase Firestore & Storage](18-FIREBASE-FIRESTORE-STORAGE.md) - Orders and file attachments

---

**Last Updated**: February 2, 2026
