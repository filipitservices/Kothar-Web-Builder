# Template System Documentation

**Complete guide to the template system: architecture, usage, and extension.**

---

## Overview

The template system provides pre-built website layouts that users can apply with a single click. Templates define sequences of blocks (navbar, hero, features, etc.) that are automatically instantiated and added to the target screen.

### Key Features

- **Predefined Templates**: Grouped by **site intent** (service & offerings, showcase, information-first, lead & conversion, trust, minimal)—not niche industry labels
- **Category Filtering**: Service & offerings, Showcase & gallery, Information-first, Lead & conversion, Trust & credibility, Simple & compact
- **Screen Selection**: Apply to desktop, mobile, or both (request builder applies to the shared layout list)
- **State Transformation**: Pure state updates, no DOM manipulation
- **Unique Block IDs**: Each application generates fresh block instances

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

```
User clicks template
         │
         ↓
TemplatesList emits 'apply' event
  { templateId: string, screen: 'desktop' | 'mobile' | 'both' }
         │
         ↓
index.vue calls handleTemplateApply()
         │
         ↓
useTemplateApplication.applyTemplate()
         │
         ├──────> Get template definition from store
         │        templatesStore.getTemplateById(id)
         │
         ├──────> Generate block items with unique IDs
         │        template.blocks.map(createBlockItem)
         │        createBlockItem() → { id, type, label }
         │        generateBlockId() → "{type}-{timestamp}-{uuid}"
         │
         └──────> Replace list arrays (state transformation)
                  desktopList.value = newBlocks OR
                  mobileList.value = newBlocks OR
                  both
         │
         ↓
Vue reactivity triggers update
         │
         ↓
ItemsList re-renders with new blocks
         │
         ↓
Block components mount with blockId props
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

Applies a template to specified screen(s). Returns `true` on success, `false` if template not found.

Flow:
1. Lookup template in store
2. Generate new block items with unique IDs
3. Replace target list array(s)
4. Vue reactivity handles UI update

```typescript
const success = applyTemplate('service-focused', 'desktop');
// desktopList.value = [
//   { id: 'navbar-1234-abc123', type: 'navbar', label: 'Navigation' },
//   { id: 'hero-1234-def456', type: 'hero', label: 'Hero Section' },
//   ...
// ]
```

**`getTemplatePreview(templateId)`**

Returns preview information for a template (useful for confirmation dialogs).

```typescript
const preview = getTemplatePreview('lead-generation');
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
  category:
    | 'services'
    | 'showcase'
    | 'information'
    | 'conversion'
    | 'trust'
    | 'minimal';
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
// e.g. ['services', 'showcase', 'information', 'conversion', 'trust', 'minimal']
```

#### Methods

**`getTemplatesByCategory(category)`**

Returns templates filtered by category.

```typescript
const serviceTemplates = templatesStore.getTemplatesByCategory('services');
```

**`getTemplateById(id)`**

Returns a specific template by ID.

```typescript
const template = templatesStore.getTemplateById('service-focused');
```

---

## Predefined Templates

Templates are named for **what the site is meant to do**. IDs and block lists live in [`app/stores/templates.ts`](../app/stores/templates.ts).

| ID | Category (intent) | Summary |
|----|-------------------|--------|
| `service-focused` | Service & offerings | Services, process, proof, location, contact |
| `full-marketing` | Service & offerings | Broad marketing page with gallery, pricing, FAQ, CTA |
| `showcase-gallery` | Showcase & gallery | Gallery-led with offerings and inquiry |
| `information-first` | Information-first | Overview, key points, FAQ, contact |
| `lead-generation` | Lead & conversion | Benefits, stats, CTA, short path to form |
| `landing-one-page` | Lead & conversion | Single scrolling story to one conversion goal |
| `trust-credibility` | Trust & credentials | Credentials, partners, testimonials, team |
| `compact-presence` | Simple & compact | Minimal hero, about, contact |

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
  category: 'services', // or showcase, information, conversion, trust, minimal
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
applyTemplate('service-focused', 'desktop')
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
6. **Don't mix concerns**: Templates don't know about drawing mode, AI chat, etc.

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
// Template definition
interface Template {
  id: string;
  name: string;
  description: string;
  category:
    | 'services'
    | 'showcase'
    | 'information'
    | 'conversion'
    | 'trust'
    | 'minimal';
  thumbnail?: string;
  blocks: TemplateBlock[];
}

// Block in template
interface TemplateBlock {
  type: string;
  label: string;
}

// Block item (after instantiation)
interface BlockItem {
  id: string;      // Generated unique ID
  type: string;    // Block type
  label: string;   // Display label
}

// Template preview
interface TemplatePreview {
  name: string;
  description: string;
  blockCount: number;
  blocks: { type: string; label: string }[];
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
getTemplatePreview(templateId: string): TemplatePreview | null

// useTemplatesStore
getTemplatesByCategory(category: string): Template[]
getTemplateById(id: string): Template | undefined

// Getters
getAllTemplates: ComputedRef<Template[]>
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
