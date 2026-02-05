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
│  Pinia Stores (blocks, business, quiz)             │
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

## Component Hierarchy

```
index.vue (Main Page)
├── InfoBar
│   └── (Business form fields)
├── ScreensPanel
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
4. Add to quiz questions (optional)

### Adding New Composable

1. Create `app/composables/useMyFeature.ts`
2. Export function with return object
3. Use in components (auto-imported by Nuxt)

---

**Next**: [Block System](03-BLOCK-SYSTEM.md)
