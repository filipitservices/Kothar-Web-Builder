# SOSG Documentation

**Comprehensive project documentation organized for clarity and AI readability.**

---

## � Getting Started

**New to the project?** Start here:

- **[Quick Start Guide](QUICK_START.md)** ⚡ - Get running in 5 minutes
- **[Overview](01-OVERVIEW.md)** ⭐ - Understand what this app does

---

## 📚 Core Documentation

Read these documents in order for complete project understanding:

1. **[Overview](01-OVERVIEW.md)** ⭐ 
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

6. **[Component Catalog](06-COMPONENT-CATALOG.md)**
   - All 13 block components
   - UI components
   - Props and events
   - Styling patterns

7. **[Dashboard & Gallery](17-DASHBOARD-AND-GALLERY.md)** 🆕
   - Multi-space architecture
   - Showcase template system (separate from builder)
   - SMB onboarding flow
   - Navigation patterns

---

## � Additional References

- [Nuxt Documentation](https://nuxt.com/docs) – Framework reference
- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html) – JavaScript framework
- [Pinia Documentation](https://pinia.vuejs.org/) – State management

---

## 🏗️ Project Structure

```
app/
  ├── components/          # Vue components
  ├── composables/         # Reusable composition functions
  │   ├── useBlockData.ts      # 🧱 Block data composable
  │   ├── useDrawing.ts        # 🎨 Drawing state
  │   └── useValidation.ts     # Form validation
  ├── stores/              # Pinia state stores
  │   ├── blockStorage.ts      # 🧱 Per-block local data
  │   ├── business.ts          # Global business info
  │   └── quiz.ts              # Quiz state
  ├── pages/               # Nuxt pages
  └── plugins/             # Vue plugins

docs/
  ├── README.md           # This file
  ├── block-data/         # 🧱 Block architecture docs
  ├── constraints/        # 🔒 Element constraints docs
  └── archive/            # Outdated documentation
```

---

## 🚀 Quick Start for AI Agents

### Understanding the Block System
1. Read [block-data/ARCHITECTURE.md](block-data/ARCHITECTURE.md) for the data flow
2. Check [block-data/API_REFERENCE.md](block-data/API_REFERENCE.md) for available functions
3. See [block-data/BLOCK_INTEGRATION.md](block-data/BLOCK_INTEGRATION.md) for implementation examples

### Understanding Constraints
1. Read [constraints/FINAL_DELIVERY.md](constraints/FINAL_DELIVERY.md) for overview
2. Check [constraints/INTEGRATION_GUIDE.md](constraints/INTEGRATION_GUIDE.md) for usage

### Key Concepts
- **Global Data**: Business info (company name, email, etc.) - read-only from business store
- **Local Data**: Block-specific overrides - editable per block instance
- **blockId**: Unique identifier per block instance (e.g., `el-hero-1234567890-abc123`)
- **Inline Editing**: contenteditable divs with @blur handlers, no input fields
- **Composables**: Vue composition functions for reusable logic (Nuxt 4 best practice)

---

## 📝 Documentation Standards

### For AI Consumption
- Clear hierarchy with quick summaries
- Code examples with explanations
- Explicit file paths and line references
- Before/after comparisons for changes
- Separation of concerns (feature per folder)

### Organization
- **README.md** - This index file (you are here)
- **Feature folders** - One folder per major feature
- **archive/** - Outdated docs preserved for reference
- **Root README.md** - Project setup and getting started

---

## 🔧 Tech Stack

- **Framework**: Nuxt 4 (Vue 3.5.27)
- **State Management**: Pinia stores
- **TypeScript**: Full type safety
- **Patterns**: Composition API, composables, reactive refs
- **Styling**: Scoped CSS, Tailwind utilities

---

## 📅 Documentation Updates

- **2026-01-27**: Created new block-data architecture docs
- **2026-01-27**: Reorganized into feature-based structure
- **2026-01-27**: Added AI-friendly README index

---

**Need Help?** Start with the relevant feature folder README above, or search for specific functions in API references.
