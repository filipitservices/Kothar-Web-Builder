# Template System Documentation

**Complete guide to the builder template system: architecture, usage, and extension.**

---

## Overview

The template system provides pre-built website layouts that users can apply with a single click inside the builder. Templates define sequences of blocks (navbar, hero, features, etc.) that are automatically instantiated and added to the target screen.

### Key Features

- **13 Predefined Templates**: Organized by design intent and structural pattern
- **6 Use-Case Categories**: Service Showcase, Professional & Expert, Portfolio & Creative, Product Focused, Appointment Based, Experience & Venue
- **Screen Selection**: Apply to desktop, mobile, or both
- **State Transformation**: Pure state updates, no DOM manipulation
- **Unique Block IDs**: Each application generates fresh block instances

### Design Philosophy

Templates are categorized by **structural use case**, not by industry. Instead of "Law Firm" or "Restaurant", templates describe what kind of layout they provide: "Expert Authority", "Venue & Experience", etc. This makes the system:
- **Flexible**: Any business can find a template that matches their structural needs
- **Scalable**: New templates slot into use-case categories without expanding an industry list
- **Neutral**: No assumptions about the user's specific business type

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
BuilderEditor calls handleTemplateApply()
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

## Categories

| Category ID | Display Label | Description |
|---|---|---|
| `service-showcase` | Service Showcase | Perfect for showcasing services |
| `professional` | Professional & Expert | Designed for professional portfolios and expert authority |
| `creative` | Portfolio & Creative | Great for visual portfolios and creative work |
| `product-focused` | Product Focused | Best for product-focused businesses |
| `appointment-based` | Appointment Based | Great for appointment-based businesses |
| `experience` | Experience & Venue | Optimized for showcasing experiences and venues |

---

## Predefined Templates

### Service Showcase

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `service-authority` | Service Authority | 9 | Showcasing services with credentials, reviews, and CTAs |
| `service-pricing` | Service & Pricing | 8 | Service businesses with clear pricing and process steps |

### Professional & Expert

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `expert-authority` | Expert Authority | 9 | Professionals showcasing expertise and credentials |
| `strategic-consultancy` | Strategic Consultancy | 9 | Consultants and advisors with approach and results |
| `trusted-professional` | Trusted Professional | 8 | Credentialed professionals building client trust |

### Portfolio & Creative

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `visual-portfolio` | Visual Portfolio | 8 | Work showcase with galleries and testimonials |
| `creative-showcase` | Creative Showcase | 9 | Creative teams showcasing process and portfolio |

### Product Focused

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `product-spotlight` | Product Spotlight | 8 | Highlighting products with location and reviews |
| `product-catalog` | Product Catalog | 8 | Product showcase with pricing and FAQ |

### Appointment Based

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `practice-booking` | Practice & Booking | 9 | Appointment-based businesses with team and credentials |
| `wellness-booking` | Wellness & Booking | 9 | Wellness professionals with consultations |

### Experience & Venue

| ID | Name | Blocks | Use Case |
|---|---|---|---|
| `venue-experience` | Venue & Experience | 8 | Venue-based businesses showcasing atmosphere |
| `event-services` | Event Services | 8 | Event-focused businesses with packages and process |

---

## Components

### TemplatesList.vue

**Location**: `components/TemplatesList.vue`

**Purpose**: Display available templates with category filtering and screen selection

**Events**:
```typescript
emit('apply', templateId: string, screen: 'desktop' | 'mobile' | 'both')
```

**Usage**:
```vue
<TemplatesList @apply="handleTemplateApply" />
```

---

## Composables

### useTemplateApplication(params)

**Location**: `composables/useTemplateApplication.ts`

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

---

## Store

### useTemplatesStore

**Location**: `stores/templates.ts`

**Types**:
```typescript
type TemplateCategory =
  | 'service-showcase'
  | 'professional'
  | 'creative'
  | 'product-focused'
  | 'appointment-based'
  | 'experience';

interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  blocks: TemplateBlock[];
}

interface TemplateBlock {
  type: string;
  label: string;
}
```

**Getters**: `getAllTemplates`, `categories`

**Methods**: `getTemplatesByCategory(category)`, `getTemplateById(id)`, `getCategoryLabel(category)`

---

## Adding New Templates

1. Define template in `stores/templates.ts` with one of the existing use-case categories
2. Each template needs: `id`, `name`, `description`, `category`, `blocks[]`
3. Template appears automatically in TemplatesList filtered by category
4. Block sequences are applied via `useTemplateApplication` with unique IDs

---

## State Transformation Pattern

Templates are applied as pure state transformations. The template's block definitions are converted to `BlockItem[]` with unique IDs and assigned to the target list ref. Vue reactivity handles all rendering updates.

```typescript
const applyToScreen = (templateId, screenType) => {
  const template = templatesStore.getTemplateById(templateId);
  const newBlocks = template.blocks.map(createBlockItem);
  if (screenType === 'desktop') {
    desktopList.value = newBlocks;
  } else {
    mobileList.value = newBlocks;
  }
};
```

No direct array mutation, no DOM manipulation, no store bypassing.

---

**Status**: Production Ready
