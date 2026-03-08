# Template System Documentation

**Complete guide to the template system: architecture, usage, and extension.**

---

## Overview

The template system provides pre-built website layouts that users can apply with a single click. Templates define sequences of blocks (navbar, hero, features, etc.) that are automatically instantiated and added to the target screen.

### Key Features

- **14 Industry-Specific Builder Templates**: Organized by industry (Local Services, Professional, Creative, Retail, Healthcare, Hospitality)
- **10 Showcase Templates with Builder Integration**: Full professional designs that also define builder block sequences
- **Unified Flow**: Showcase template → Request editor → Builder (pre-loaded with template blocks)
- **Category Filtering**: Industry-based categories
- **Screen Selection**: Apply to desktop, mobile, or both
- **State Transformation**: Pure state updates, no DOM manipulation
- **Unique Block IDs**: Each application generates fresh block instances
- **Shared `TemplateBlock` type**: Both builder and showcase templates use the same block definition structure (`types/builder.ts`)

### Unified Template-to-Builder Flow

```
Dashboard → Showcase template → ShowcaseModal → "Choose This Design"
    │
    ↓
/gallery/request/[id] (Request editor)
    │
    ├── "Open in Builder" → /builder?showcaseTemplate=[id]
    │       ↓
    │   Builder mounts → reads showcaseTemplate query param
    │       ↓
    │   Looks up showcase template → applyBlocks(template.blocks, 'both')
    │       ↓
    │   Builder canvas populated with template's block layout
    │       ↓
    │   Query param cleared (router.replace)
    │       ↓
    │   User edits, rearranges, customizes blocks
    │
    └── Submit request form (existing flow)
```

Templates are predefined builder layouts. The builder edits those layouts. The user flow moves naturally from template → request editor → builder.

---

## Architecture

### Three-Layer Structure

```
┌──────────────────────────────────────┐
│       Presentation Layer             │
│   (TemplatesList.vue Component)      │
│   - Display templates                │
│   - Category filtering               │
│   - Screen selection modal           │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│         Logic Layer                  │
│  (useTemplateApplication Composable) │
│   - Generate unique block IDs        │
│   - Create block items               │
│   - Transform list state             │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│          Data Layer                  │
│    (useTemplatesStore Pinia Store)   │
│   - Template definitions             │
│   - Category queries                 │
│   - Template lookup by ID            │
└──────────────────────────────────────┘
```

### Data Flow

**Path A: Builder sidebar (builder templates)**

```
TemplatesList emits 'apply' → builder.vue handleTemplateApply()
  → useTemplateApplication.applyTemplate(templateId, screen)
    → templatesStore.getTemplateById(id)
    → applyBlocks(template.blocks, screen)
```

**Path B: Showcase template → builder (unified flow)**

```
Request page "Open in Builder" → /builder?showcaseTemplate=[id]
  → builder.vue onMounted()
    → showcaseStore.getTemplateById(id)
    → applyBlocks(template.blocks, 'both')
    → router.replace({ path: '/builder' })
```

**Both paths converge on `applyBlocks()`:**

```
applyBlocks(blocks: TemplateBlock[], screen)
         │
         ├──────> Generate block items with unique IDs
         │        blocks.map(createBlockItem)
         │        createBlockItem() → { id, type, label }
         │        generateBlockId() → "{type}-{timestamp}-{uuid}"
         │
         └──────> Replace list arrays (state transformation)
                  desktopList.value = newBlocks OR
                  mobileList.value = newBlocks OR
                  both
         │
         ↓
Vue reactivity triggers update → ItemsList re-renders → Block components mount
```

---

## Components

### TemplatesList.vue

**Location**: [components/TemplatesList.vue](../app/components/TemplatesList.vue)

**Purpose**: Display available templates with category filtering and screen selection

**Features**:
- Category filter buttons (Business, Portfolio, Landing, Ecommerce, All)
- Template cards with name, description, block preview
- Modal for screen selection (Desktop, Mobile, Both)
- Icon preview of first 3 blocks

**Props**: None

**Events**:
```typescript
emit('apply', templateId: string, screen: 'desktop' | 'mobile' | 'both')
```

**Usage**:
```vue
<TemplatesList @apply="handleTemplateApply" />
```

**Template Card Structure**:
```
┌─────────────────────────────────┐
│ Small Business                  │
│ Perfect for local businesses... │
│ 7 blocks                        │
│ 📐 🎯 ⭐ +4                      │
└─────────────────────────────────┘
```

**Screen Selector Modal**:
- Triggered on template click
- Three options: Desktop, Mobile, Both
- Cancel button to dismiss

**Styling**:
- Responsive card grid
- Hover effects with transform and shadow
- Active category highlighting
- Fixed modal overlay with backdrop

---

## Composables

### useTemplateApplication(params)

**Location**: [composables/useTemplateApplication.ts](../app/composables/useTemplateApplication.ts)

**Purpose**: Handle template application logic with state transformation

**Parameters**:
```typescript
{
  desktopList: Ref<BlockItem[]>,
  mobileList: Ref<BlockItem[]>
}
```

**Returns**:
```typescript
{
  applyTemplate: (templateId: string, screen: 'desktop' | 'mobile' | 'both') => boolean,
  getTemplatePreview: (templateId: string) => TemplatePreview | null
}
```

#### Methods

**`applyTemplate(templateId, screen)`**

Applies a builder template (from `stores/templates.ts`) to specified screen(s). Returns `true` on success, `false` if template not found. Delegates to `applyBlocks`.

```typescript
const success = applyTemplate('local-contractor', 'desktop');
```

**`applyBlocks(blocks, screen)`**

Core method: applies a `TemplateBlock[]` to the target screen(s). Used by both `applyTemplate` (builder templates) and the showcase-to-builder initialisation flow. Generates fresh block IDs for every block.

```typescript
applyBlocks(showcaseTemplate.blocks, 'both');
// desktopList.value = [
//   { id: 'navbar-1234-abc123', type: 'navbar', label: 'Navigation' },
//   { id: 'hero-1234-def456', type: 'hero', label: 'Hero Section' },
//   ...
// ]
```

**`getTemplatePreview(templateId)`**

Returns preview information for a template (useful for confirmation dialogs).

```typescript
const preview = getTemplatePreview('landing-page');
// {
//   name: 'Landing Page',
//   description: 'High-converting landing page...',
//   blockCount: 8,
//   blocks: [...]
// }
```

#### Helper Functions

**`generateBlockId(blockType)`**

Generates unique block ID using format: `{type}-{timestamp}-{uuid}`

```typescript
generateBlockId('navbar')
// → "navbar-1735834567890-a3f2c1b4"
```

**`createBlockItem(templateBlock)`**

Converts template block definition to block item with unique ID.

```typescript
createBlockItem({ type: 'hero', label: 'Hero Section' })
// → { id: 'hero-1234-abc', type: 'hero', label: 'Hero Section' }
```

---

## Stores

### useTemplatesStore

**Location**: [stores/templates.ts](../app/stores/templates.ts)

**Purpose**: Manage template definitions and queries

#### State

```typescript
{
  templates: Ref<Template[]>
}
```

**Template Interface**:
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'portfolio' | 'landing' | 'ecommerce';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

interface TemplateBlock {
  type: string;
  label: string;
}
```

#### Getters

**`getAllTemplates`**: Returns all templates (computed)

```typescript
const templates = templatesStore.getAllTemplates;
```

**`categories`**: Returns array of unique categories (computed)

```typescript
const cats = templatesStore.categories;
// ['business', 'portfolio', 'landing', 'ecommerce']
```

#### Methods

**`getTemplatesByCategory(category)`**

Returns templates filtered by category.

```typescript
const businessTemplates = templatesStore.getTemplatesByCategory('business');
```

**`getTemplateById(id)`**

Returns a specific template by ID.

```typescript
const template = templatesStore.getTemplateById('small-business');
```

---

## Predefined Templates

### 1. Small Business

**ID**: `small-business`  
**Category**: Business  
**Blocks**: 7

```
Navigation
Hero Section
Services (Features)
Testimonials
Call To Action
Contact Form
Footer
```

**Use Case**: Local businesses, consultants, service providers

---

### 2. Landing Page

**ID**: `landing-page`  
**Category**: Landing  
**Blocks**: 8

```
Navigation
Hero Section
Key Features
Statistics
Pricing
FAQ
Final CTA
Footer
```

**Use Case**: Product launches, marketing campaigns, lead generation

---

### 3. Portfolio

**ID**: `portfolio`  
**Category**: Portfolio  
**Blocks**: 7

```
Navigation
Hero Section
Portfolio Gallery
About Section (Text)
Client Testimonials
Contact Form
Footer
```

**Use Case**: Designers, photographers, freelancers, agencies

---

### 4. SaaS Product

**ID**: `saas-product`  
**Category**: Ecommerce  
**Blocks**: 9

```
Navigation
Product Hero
Product Features
Key Metrics (Stats)
Customer Reviews
Pricing Plans
FAQ
Sign Up CTA
Footer
```

**Use Case**: Software products, SaaS platforms, subscription services

---

### 5. Simple Contact

**ID**: `simple-contact`  
**Category**: Business  
**Blocks**: 5

```
Navigation
Header
About Text
Contact Form
Footer
```

**Use Case**: Minimal contact pages, coming soon pages

---

### 6. Full Featured

**ID**: `full-featured`  
**Category**: Business  
**Blocks**: 11

```
Navigation
Hero Section
Features
Statistics
Gallery
Testimonials
Pricing
FAQ
Call To Action
Contact Form
Footer
```

**Use Case**: Comprehensive websites, showcasing all block types

---

## Integration

### In index.vue

```vue
<template>
  <!-- Right Sidebar -->
  <div class="sidebar right-sidebar">
    <TemplatesList @apply="handleTemplateApply" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TemplatesList from '~/components/TemplatesList.vue';
import { useTemplateApplication } from '~/composables/useTemplateApplication';

const desktopList = ref([]);
const mobileList = ref([]);

const { applyTemplate } = useTemplateApplication({
  desktopList,
  mobileList
});

const handleTemplateApply = (templateId, screen) => {
  applyTemplate(templateId, screen);
};
</script>
```

---

## State Transformation Pattern

### ✅ Correct Approach (What We Did)

**Pure state transformation** - Replace arrays, let Vue handle rendering.

```typescript
const applyToScreen = (templateId, screenType) => {
  const template = templatesStore.getTemplateById(templateId);
  const newBlocks = template.blocks.map(createBlockItem);
  
  // State transformation
  if (screenType === 'desktop') {
    desktopList.value = newBlocks;
  } else {
    mobileList.value = newBlocks;
  }
  
  // Vue reactivity handles the rest
};
```

**Flow**:
1. Create new array of block items
2. Assign to ref.value
3. Vue detects change via Proxy
4. ItemsList re-renders automatically
5. vue-draggable updates DOM

### ❌ Incorrect Approaches (Avoided)

**Direct DOM manipulation**:
```typescript
// ❌ DON'T DO THIS
document.querySelector('.list-group').innerHTML = '...';
```

**Direct array mutation**:
```typescript
// ❌ DON'T DO THIS
desktopList.push(...newBlocks); // Loses reactivity
desktopList.splice(0, desktopList.length, ...newBlocks); // Mutation
```

**Store manipulation without composable**:
```typescript
// ❌ DON'T DO THIS
blocksStore.screens.desktop = { ... }; // Bypasses abstractions
```

---

## Adding New Templates

### Step 1: Define Template

Edit `stores/templates.ts`:

```typescript
{
  id: 'my-template',
  name: 'My Template',
  description: 'Custom template description',
  category: 'business', // or portfolio, landing, ecommerce
  blocks: [
    { type: 'navbar', label: 'Navigation' },
    { type: 'hero', label: 'Hero Section' },
    { type: 'footer', label: 'Footer' }
  ]
}
```

### Step 2: Add to Templates Array

```typescript
const templates = ref<Template[]>([
  // ... existing templates
  {
    id: 'my-template',
    name: 'My Template',
    // ... rest of definition
  }
]);
```

### Step 3: Test

1. Template appears in TemplatesList
2. Filters correctly by category
3. Applies to screens correctly
4. Generates unique block IDs
5. Blocks render properly

---

## Block ID Generation

### Format

```
{blockType}-{timestamp}-{uuid}
```

**Example**:
```
navbar-1735834567890-a3f2c1b4
hero-1735834567891-f8e9d2c5
footer-1735834567892-9b4a7f3e
```

### Why This Format?

1. **Type prefix**: Easy to identify block type
2. **Timestamp**: Ensures chronological ordering
3. **UUID**: Prevents collisions even with rapid clicks
4. **No sequential numbers**: Avoids race conditions

### Implementation

```typescript
const generateBlockId = (blockType: string): string => {
  return `${blockType}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
};
```

Uses native `crypto.randomUUID()` (supported in all modern browsers and Node.js).

---

## Reactivity Behavior

### Template Application Flow

```
applyTemplate('small-business', 'desktop')
         │
         ↓
desktopList.value = newBlocks
         │
         ↓
Vue Proxy detects assignment
         │
         ↓
Triggers computed/watchers/components
         │
         ↓
ItemsList <draggable> receives new :list prop
         │
         ↓
vue-draggable updates internal Sortable.js instance
         │
         ↓
DOM updates with new blocks
         │
         ↓
Each block component receives :block-id prop
         │
         ↓
useBlockData(blockId) called in each block
         │
         ↓
Blocks initialize with default/business data
```

### No Manual DOM Updates Needed

Vue's reactivity system + vue-draggable handles all rendering:
- ✅ Array replacement triggers list update
- ✅ New items added to DOM automatically
- ✅ Old items removed automatically
- ✅ Sortable.js synchronizes with array
- ✅ Block components mount with correct props

---

## Best Practices

### Do's ✅

1. **Use state transformation**: Replace arrays, don't mutate
2. **Generate unique IDs**: Use timestamp + UUID pattern
3. **Validate template exists**: Check return value of `getTemplateById`
4. **Let Vue handle rendering**: No manual DOM manipulation
5. **Keep templates simple**: Just block type + label definitions
6. **Use TypeScript**: Type safety for template structure

### Don'ts ❌

1. **Don't mutate arrays**: `push()`, `splice()`, etc. break patterns
2. **Don't access DOM**: No `querySelector`, `innerHTML`, etc.
3. **Don't hardcode IDs**: Always generate unique IDs
4. **Don't bypass composable**: Always use `useTemplateApplication`
5. **Don't store block data in template**: Templates define structure only
6. **Don't mix concerns**: Templates don't know about drawing, quiz, etc.

---

## Troubleshooting

### Template Doesn't Apply

**Symptoms**: Clicking template does nothing

**Causes**:
1. Template ID mismatch
2. Store not initialized
3. Lists not passed to composable

**Solution**:
```typescript
// Check template exists
const template = templatesStore.getTemplateById(id);
console.log(template); // Should not be undefined

// Check composable initialized
const { applyTemplate } = useTemplateApplication({ desktopList, mobileList });
console.log(applyTemplate); // Should be function

// Check lists are refs
console.log(isRef(desktopList)); // Should be true
```

### Duplicate Block IDs

**Symptoms**: Blocks overlap or don't render

**Causes**:
1. Not using `generateBlockId`
2. Reusing old IDs

**Solution**: Always call `createBlockItem` which generates fresh IDs.

### Blocks Don't Render

**Symptoms**: Empty screen after template application

**Causes**:
1. Block type mismatch with componentMap
2. Async component loading issue

**Solution**:
```typescript
// Check block types match
const BLOCK_COMPONENTS = {
  navbar: () => import('./NavBlock.vue'),
  hero: () => import('./HeroBlock.vue'),
  // ... must include all types used in templates
};
```

---

## Future Enhancements

### Planned Features

1. **Custom Templates**: Allow users to save their own layouts
2. **Template Preview**: Show visual preview before applying
3. **Undo/Redo**: Revert template application
4. **Template Export/Import**: Share templates as JSON
5. **Block Presets**: Templates with pre-filled content
6. **Template Categories**: More granular categorization

### Potential Improvements

1. **Confirmation Dialog**: "Replace existing blocks?" prompt
2. **Merge Mode**: Add template blocks to existing instead of replacing
3. **Template Thumbnails**: Visual preview images
4. **Template Search**: Filter by name or description
5. **Recently Used**: Track frequently applied templates
6. **Template Analytics**: Track which templates are popular

---

## API Reference

### Types

```typescript
// Shared block definition (types/builder.ts) — used by both stores
interface TemplateBlock {
  type: BlockType;
  label: string;
}

// Builder template (stores/templates.ts)
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'local-services' | 'professional' | 'creative' | 'retail' | 'healthcare' | 'hospitality';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

// Showcase template (stores/showcase.ts) — includes both sections and blocks
interface ShowcaseTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  category: ShowcaseCategory;
  colorScheme: { primary; secondary; accent; background; text };
  sections: ShowcaseSection[];  // Rich content for visual preview
  blocks: TemplateBlock[];      // Builder block sequence
}

// Block item (after instantiation in the builder)
interface BlockItem {
  id: string;      // Generated unique ID
  type: BlockType;
  label: string;
}
```

### Events

```typescript
// TemplatesList emits
emit('apply', templateId: string, screen: 'desktop' | 'mobile' | 'both')
```

### Methods

```typescript
// useTemplateApplication
applyTemplate(templateId: string, screen: 'desktop' | 'mobile' | 'both'): boolean
applyBlocks(blocks: TemplateBlock[], screen: 'desktop' | 'mobile' | 'both'): void
getTemplatePreview(templateId: string): TemplatePreview | null

// useTemplatesStore
getTemplatesByCategory(category: string): Template[]
getTemplateById(id: string): Template | undefined

// useShowcaseStore
getTemplateById(id: string): ShowcaseTemplate | undefined
getTemplatesByCategory(category: ShowcaseCategory): ShowcaseTemplate[]

// Getters (both stores)
getAllTemplates: ComputedRef<Template[] | ShowcaseTemplate[]>
categories: ComputedRef<string[]>
```

---

**Status**: ✅ Production Ready

The template system is fully implemented, tested, and integrated with the existing architecture. It follows all established patterns:
- State transformation (no mutations)
- Composable abstraction
- TypeScript type safety
- Vue reactivity
- No direct DOM manipulation
- Clean separation of concerns
