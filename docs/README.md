# Kothar Documentation

**Comprehensive project documentation organized for clarity and AI readability.**

---

## Getting Started

**New to the project?** Start here:

- **[Overview](01-OVERVIEW.md)** — What this app does, tech stack, project structure, and quick start (`pnpm install` / `pnpm dev`)

---

## Core Documentation

Read these documents in order for complete project understanding:

1. **[Overview](01-OVERVIEW.md)**
   - What this app does
   - Tech stack and dependencies
   - Project structure
   - Quick start guide

2. **[Architecture](02-ARCHITECTURE.md)**
   - System design and layers
   - Dual store pattern
   - Component hierarchy
   - Data flow diagrams

3. **[Block System](03-BLOCK-SYSTEM.md)**
   - How blocks work
   - Creating new blocks
   - Design system reference
   - Inline editing patterns

4. **[Data Flow](04-DATA-FLOW.md)**
   - State management
   - Reactivity patterns
   - Composable architecture
   - Store interactions

5. **[API Reference](05-API-REFERENCE.md)**
   - Function signatures
   - Parameters and returns
   - Usage examples
   - Type definitions

6. **[Component Catalog](06-COMPONENT-CATALOG.md)** — legacy block catalog (13 blocks)
   - **[Component Catalog (Updated)](15-COMPONENT-CATALOG-UPDATED.md)** — current 18 builder blocks + form components
   - UI components, props, events, styling patterns

7. **[Gallery & Templates](17-DASHBOARD-AND-GALLERY.md)**
   - Integrated Gallery architecture
   - Showcase template system (separate from builder)
   - SMB onboarding flow
   - Template preview and request flow

---

## Feature & Integration Docs

| Doc | Topic |
|-----|-------|
| [07-TEMPLATE-SYSTEM.md](07-TEMPLATE-SYSTEM.md) | Builder template catalog (`stores/templates.ts`) |
| [09-SIDEBAR-BRANDING.md](09-SIDEBAR-BRANDING.md) | Removed SidebarBranding; UserMenu in AppNavbar |
| [10-AI-CHAT-SYSTEM.md](10-AI-CHAT-SYSTEM.md) | Builder AI chat panel |
| [11-ROUTING-AND-LANDING.md](11-ROUTING-AND-LANDING.md) | Routes, layouts, middleware |
| [13-BUILDER-CODE-ORGANIZATION.md](13-BUILDER-CODE-ORGANIZATION.md) | BuilderEditor, types, constants |
| [14-SMB-REFINEMENT-SUMMARY.md](14-SMB-REFINEMENT-SUMMARY.md) | SMB block additions summary |
| [16-FIREBASE-AUTH.md](16-FIREBASE-AUTH.md) | Session cookies, protected routes |
| [18-FIREBASE-FIRESTORE-STORAGE.md](18-FIREBASE-FIRESTORE-STORAGE.md) | Orders, attachments, Whop access |
| [19-FIREBASE-AI-LOGIC-CHAT.md](19-FIREBASE-AI-LOGIC-CHAT.md) | Gemini via Firebase AI Logic |

---

## Additional References

- [Nuxt Documentation](https://nuxt.com/docs) – Framework reference
- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html) – JavaScript framework
- [Pinia Documentation](https://pinia.vuejs.org/) – State management

---

## Project Structure

```
app/
  ├── components/          # Vue components (BlockElements/, BuilderEditor.vue, …)
  ├── composables/         # Reusable composition functions
  │   ├── useBlockData.ts      # Block data composable
  │   └── useDrawing.ts        # Drawing state
  ├── stores/              # Pinia state stores
  │   ├── blocks.ts            # Per-block local data
  │   └── business.ts          # Global business info
  ├── pages/               # Nuxt pages (landing, gallery, sites, builder routes, …)
  └── plugins/             # Vue plugins

docs/
  └── *.md                 # Topic-numbered documentation (this index)
```

---

## Quick Start for AI Agents

### Understanding the Block System
1. Read [03-BLOCK-SYSTEM.md](03-BLOCK-SYSTEM.md) for lifecycle and editing patterns
2. Read [04-DATA-FLOW.md](04-DATA-FLOW.md) for store → composable → component flow
3. Use [05-API-REFERENCE.md](05-API-REFERENCE.md) for `useBlockData` / store APIs
4. See [15-COMPONENT-CATALOG-UPDATED.md](15-COMPONENT-CATALOG-UPDATED.md) for all current block components

### Understanding Constraints
1. Read [05-API-REFERENCE.md](05-API-REFERENCE.md) — `useElementConstraints` section
2. See [02-ARCHITECTURE.md](02-ARCHITECTURE.md) — component hierarchy and layout boundaries

### Key Concepts
- **Global Data**: Business info (company name, email, etc.) — shared via `business` store
- **Local Data**: Block-specific overrides — editable per block instance in `blocks` store
- **blockId**: Unique identifier per block instance (e.g., `navbar-1738083421789-a3f2c1`)
- **Inline Editing**: contenteditable divs with @blur handlers, no input fields
- **Composables**: Vue composition functions for reusable logic (Nuxt 4 best practice)

---

## Documentation Standards

### For AI Consumption
- Clear hierarchy with quick summaries
- Code examples with explanations
- Explicit file paths and line references
- Before/after comparisons for changes
- Separation of concerns (feature per folder)

### Organization
- **README.md** — This index file (you are here)
- **Numbered docs** — One file per major topic (`01-` … `19-`)
- **Root README.md** — Project setup and getting started

---

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3.5.27)
- **State Management**: Pinia stores
- **TypeScript**: Full type safety
- **Patterns**: Composition API, composables, reactive refs
- **Styling**: Scoped CSS and design tokens in `app/assets/css/style.css`

---

## Documentation Updates

- **2026-06-23**: Fixed README index — removed dead links, aligned store paths and doc list with current structure
- **2026-01-27**: Initial numbered docs and AI-friendly README index

---

**Need Help?** Start with [01-OVERVIEW.md](01-OVERVIEW.md), then follow the core doc list above.
