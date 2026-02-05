# API Reference

**Complete API documentation for all stores, composables, and utilities.**

---

## Pinia Stores

### useBusinessStore

**File**: [stores/business.ts](../app/stores/business.ts)

**Purpose**: Manages global business information shared across all blocks

#### State

```typescript
{
  companyName: Ref<string>,
  email: Ref<string>,
  telephone: Ref<string>,
  address: Ref<string>,
  city: Ref<string>,
  postalCode: Ref<string>,
  website: Ref<string>,
  businessHours: Ref<string>,
  taxId: Ref<string>
}
```

#### Actions

**`updateBusinessInfo(data: Partial<BusinessInfo>): void`**

Updates one or more business fields.

```typescript
const business = useBusinessStore();
business.updateBusinessInfo({
  companyName: 'Acme Corp',
  email: 'info@acme.com',
  telephone: '555-1234'
});
```

**`resetBusinessInfo(): void`**

Resets all fields to empty strings.

```typescript
business.resetBusinessInfo();
```

**`getBusinessInfo(): BusinessInfo`**

Returns snapshot of all business data as plain object.

```typescript
const snapshot = business.getBusinessInfo();
console.log(snapshot.companyName); // 'Acme Corp'
```

#### Usage

```typescript
import { useBusinessStore } from '~/stores/business';

const business = useBusinessStore();

// Direct access (reactive)
console.log(business.companyName); // Ref<string>

// Update single field
business.companyName = 'New Name';

// Update multiple fields
business.updateBusinessInfo({
  email: 'new@email.com',
  telephone: '555-9999'
});
```

---

### useBlocksStore

**File**: [stores/blocks.ts](../app/stores/blocks.ts)

**Purpose**: Manages per-instance block customizations for desktop and mobile screens

#### State

```typescript
{
  screens: Ref<{
    desktop: {
      [blockId: string]: BlockData
    },
    mobile: {
      [blockId: string]: BlockData
    }
  }>
}
```

**BlockData Interface**:
```typescript
interface BlockData {
  blockId: string;
  blockType: string;
  position?: number;
  title?: string;
  subtitle?: string;
  customData?: Record<string, any>;
}
```

#### Actions

**`getScreenBlocks(screenId: 'desktop' | 'mobile'): ScreenBlocks`**

Returns all blocks for a specific screen.

```typescript
const blocks = useBlocksStore();
const desktopBlocks = blocks.getScreenBlocks('desktop');
// { 'el-hero-123': { blockId: ..., blockType: ..., customData: ... }, ... }
```

**`getBlockData(screenId: 'desktop' | 'mobile', blockId: string): BlockData | undefined`**

Returns data for a specific block instance.

```typescript
const blockData = blocks.getBlockData('desktop', 'el-hero-123');
console.log(blockData?.customData?.title);
```

**`setBlockData(screenId: 'desktop' | 'mobile', blockId: string, blockType: string, data: Partial<BlockData>): void`**

Creates or updates a block's data. Merges with existing data.

```typescript
blocks.setBlockData('desktop', 'el-hero-123', 'hero', {
  title: 'Custom Title',
  customData: { subtitle: 'Custom Subtitle' }
});
```

**`updateBlockCustomField(screenId: 'desktop' | 'mobile', blockId: string, fieldName: string, value: any): void`**

Updates a single field in block's customData.

```typescript
blocks.updateBlockCustomField('desktop', 'el-hero-123', 'title', 'New Title');
```

**`removeBlock(screenId: 'desktop' | 'mobile', blockId: string): void`**

Deletes a block instance from storage.

```typescript
blocks.removeBlock('desktop', 'el-hero-123');
```

**`clearScreen(screenId: 'desktop' | 'mobile'): void`**

Removes all blocks from a screen.

```typescript
blocks.clearScreen('desktop');
```

**`syncBlockToScreen(sourceScreenId: 'desktop' | 'mobile', targetScreenId: 'desktop' | 'mobile', blockId: string): void`**

Copies block customizations from one screen to another.

```typescript
blocks.syncBlockToScreen('desktop', 'mobile', 'el-hero-123');
```

**`exportData(): Record<string, ScreenBlocks>`**

Exports all block data for persistence (returns deep clone).

```typescript
const data = blocks.exportData();
localStorage.setItem('blocks', JSON.stringify(data));
```

**`importData(data: Record<string, ScreenBlocks>): void`**

Imports block data from external source.

```typescript
const data = JSON.parse(localStorage.getItem('blocks') || '{}');
blocks.importData(data);
```

---

### useQuizStore

**File**: [stores/quiz.ts](../app/stores/quiz.ts)

**Purpose**: Manages onboarding quiz state and answers

#### State

```typescript
{
  quizCompleted: Ref<boolean>,
  currentSlide: Ref<number>,
  answers: Ref<Record<string, string>>
}
```

#### Actions

**`nextSlide(): void`**

Advances to next quiz question.

```typescript
const quiz = useQuizStore();
quiz.nextSlide();
```

**`previousSlide(): void`**

Goes back to previous quiz question.

```typescript
quiz.previousSlide();
```

**`setAnswer(fieldName: string, value: string): void`**

Stores an answer to a quiz question.

```typescript
quiz.setAnswer('companyName', 'Acme Corp');
```

**`getAnswer(fieldName: string): string`**

Retrieves a stored answer.

```typescript
const company = quiz.getAnswer('companyName');
```

**`completeQuiz(): void`**

Marks quiz as completed.

```typescript
quiz.completeQuiz();
```

**`resetQuiz(): void`**

Resets quiz to initial state.

```typescript
quiz.resetQuiz();
```

---

## Composables

### useBusinessData()

**File**: [composables/useBusinessData.ts](../app/composables/useBusinessData.ts)

**Purpose**: Provides reactive access to business store with computed helpers

**Returns**:
```typescript
{
  // Direct field access (computed refs)
  companyName: ComputedRef<string>,
  email: ComputedRef<string>,
  telephone: ComputedRef<string>,
  address: ComputedRef<string>,
  city: ComputedRef<string>,
  postalCode: ComputedRef<string>,
  website: ComputedRef<string>,
  businessHours: ComputedRef<string>,
  taxId: ComputedRef<string>,
  
  // Computed helpers
  fullAddress: ComputedRef<string>,    // "address, city, postalCode"
  hasContact: ComputedRef<boolean>,    // true if email or telephone exists
  isComplete: ComputedRef<boolean>     // true if required fields filled
}
```

**Usage**:
```typescript
import { useBusinessData } from '~/composables/useBusinessData';

const business = useBusinessData();

// Access fields (auto-unwrapped in templates)
console.log(business.companyName.value); // 'Acme Corp'
console.log(business.fullAddress.value); // '123 Main St, Springfield, 12345'
console.log(business.hasContact.value); // true
```

**Computed Helpers**:

- **`fullAddress`**: Combines address, city, and postalCode with comma separation
- **`hasContact`**: Returns `true` if either email or telephone is set
- **`isComplete`**: Returns `true` if companyName, email, telephone, address, and city all have values

---

### useBlockData(blockId)

**File**: [composables/useBlockData.ts](../app/composables/useBlockData.ts)

**Purpose**: Provides access to block-specific data with business data fallback

**Parameters**:
- `blockId: string` - Unique block instance identifier

**Returns**:
```typescript
{
  getField: (name: string) => any,
  setField: (name: string, value: any) => void,
  isLocalValue: (name: string) => boolean,
  mergedData: ComputedRef<BusinessData & CustomData>,
  blockData: ComputedRef<BlockData | undefined>,
  deleteBlock: () => void,
  screenId: 'desktop' | 'mobile'
}
```

**⚠️ Current Limitation**: `screenId` always defaults to 'desktop'. Future enhancement planned for proper screen detection via provide/inject.

#### Methods

**`getField(name: string): any`**

Retrieves a field value from block's customData. Returns `undefined` if not set.

```typescript
const { getField } = useBlockData('el-hero-123');
const title = getField('title'); // string | undefined
```

**`setField(name: string, value: any): void`**

Sets a field value in block's customData. Auto-initializes block if doesn't exist.

```typescript
const { setField } = useBlockData('el-hero-123');
setField('title', 'New Hero Title');
```

**`isLocalValue(name: string): boolean`**

Checks if a field has been customized (not undefined, null, or empty string).

Used for visual indicators (bold text, highlighting).

```typescript
const { isLocalValue } = useBlockData('el-hero-123');
const isCustomized = isLocalValue('title'); // boolean
```

**`deleteBlock(): void`**

Removes this block instance from storage.

```typescript
const { deleteBlock } = useBlockData('el-hero-123');
deleteBlock(); // Removes from blocks store
```

#### Computed Properties

**`mergedData`**

Reactive object combining business data with block customData. Block customizations override business data.

```typescript
const { mergedData } = useBlockData('el-hero-123');

// Access in component
console.log(mergedData.value.companyName); // From business store
console.log(mergedData.value.customTitle); // From block customData
```

Structure:
```typescript
{
  // From business store
  companyName: string,
  email: string,
  telephone: string,
  address: string,
  city: string,
  postalCode: string,
  website: string,
  businessHours: string,
  taxId: string,
  fullAddress: string,
  hasContact: boolean,
  isComplete: boolean,
  
  // From block customData (merged)
  ...customData
}
```

**`blockData`**

Reactive reference to full block object from store.

```typescript
const { blockData } = useBlockData('el-hero-123');
console.log(blockData.value?.blockType); // 'hero'
console.log(blockData.value?.customData); // { title: '...', ... }
```

**Usage Example**:
```vue
<script setup>
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';

const props = defineProps({
  blockId: { type: String, required: true }
});

const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);

// Computed field with fallback
const title = computed(() => 
  getField('title') ?? mergedData.value.companyName ?? 'Default Title'
);

// Update handler
const updateTitle = (e) => {
  const newValue = e.target.textContent?.trim() || '';
  setField('title', newValue);
};
</script>

<template>
  <div
    class="title"
    :class="{ 'customized': isLocalValue('title') }"
    @blur="updateTitle"
    contenteditable
  >
    {{ title }}
  </div>
  
  <div class="contact" v-if="mergedData.hasContact">
    <div>{{ mergedData.email }}</div>
    <div>{{ mergedData.telephone }}</div>
  </div>
</template>
```

---

### useDrawing()

**File**: [composables/useDrawing.ts](../app/composables/useDrawing.ts)

**Purpose**: Manages drawing state for vue-drawing-canvas on both screens

**Returns**:
```typescript
{
  // Desktop state
  desktopDrawingState: DrawingState,
  desktopStrokes: Ref<any[]>,
  desktopDrawingImage: Ref<string>,
  desktopCanvasRef: Ref<any>,
  
  // Mobile state
  mobileDrawingState: DrawingState,
  mobileStrokes: Ref<any[]>,
  mobileDrawingImage: Ref<string>,
  mobileCanvasRef: Ref<any>,
  
  // Desktop methods
  toggleDesktopDrawing: () => void,
  enableDesktopDrawing: () => void,
  disableDesktopDrawing: () => void,
  setDesktopCanvasRef: (ref: any) => void,
  clearDesktopCanvas: () => void,
  undoDesktopStroke: () => void,
  redoDesktopStroke: () => void,
  toggleDesktopTextMode: () => void,
  
  // Mobile methods (same pattern)
  toggleMobileDrawing: () => void,
  enableMobileDrawing: () => void,
  disableMobileDrawing: () => void,
  setMobileCanvasRef: (ref: any) => void,
  clearMobileCanvas: () => void,
  undoMobileStroke: () => void,
  redoMobileStroke: () => void,
  toggleMobileTextMode: () => void,
  
  // Utility
  isAnyDrawingActive: ComputedRef<boolean>
}
```

**DrawingState Interface**:
```typescript
interface DrawingState {
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  strokeType: 'dash' | 'line' | 'circle' | 'square' | 'triangle' | 'half_triangle';
  color: string;
  lineWidth: number;
  isTextMode: boolean;
  textFontSize: number;
  textColor: string;
  textFontFamily: string;
}
```

**Usage**:
```typescript
import { useDrawing } from '~/composables/useDrawing';

const {
  desktopDrawingState,
  toggleDesktopDrawing,
  setDesktopCanvasRef,
  clearDesktopCanvas
} = useDrawing();

// Toggle drawing mode
toggleDesktopDrawing();

// Check if enabled
if (desktopDrawingState.desktopEnabled) {
  console.log('Drawing active');
}

// Change pen color
desktopDrawingState.color = '#ff0000';

// Change line width
desktopDrawingState.lineWidth = 5;
```

---

### useValidation()

**File**: [composables/useValidation.ts](../app/composables/useValidation.ts)

**Purpose**: Form validation for business information fields

**Returns**:
```typescript
{
  validate: (fieldName: string, value: string) => string | null,
  businessHoursOptions: string[]
}
```

**`validate(fieldName, value)`**

Validates a field value and returns error message or `null` if valid.

```typescript
const { validate } = useValidation();

const emailError = validate('email', 'invalid-email');
// Returns: 'Please enter a valid email address'

const validEmail = validate('email', 'user@example.com');
// Returns: null
```

**Validation Rules**:
- **companyName**: Required, min 2 characters
- **email**: Valid email format
- **telephone**: Valid phone format (digits, spaces, hyphens, parentheses)
- **address**: Required, min 5 characters
- **city**: Required, min 2 characters
- **postalCode**: Required, min 3 characters
- **website**: Valid URL format (if provided)
- **taxId**: Min 5 characters (if provided)

**businessHoursOptions**:
```typescript
const { businessHoursOptions } = useValidation();
// [
//   '9:00 AM - 5:00 PM',
//   '8:00 AM - 6:00 PM',
//   '24/7',
//   ...
// ]
```

---

### useScreenScaling()

**File**: [composables/useScreenScaling.ts](../app/composables/useScreenScaling.ts)

**Purpose**: Manages responsive scaling for canvas screens in ScreensPanel

**Returns**:
```typescript
{
  desktopScale: Ref<number>,
  mobileScale: Ref<number>,
  desktopScaledWidth: Ref<number>,
  desktopScaledHeight: Ref<number>,
  mobileScaledWidth: Ref<number>,
  mobileScaledHeight: Ref<number>,
  screensPanelRef: Ref<HTMLElement | null>,
  initializeScaling: (
    desktopWidth: number,
    desktopHeight: number,
    mobileWidth: number,
    mobileHeight: number
  ) => void,
  cleanupScaling: () => void
}
```

**Usage**:
```vue
<script setup>
import { useScreenScaling } from '~/composables/useScreenScaling';

const {
  desktopScale,
  mobileScale,
  screensPanelRef,
  initializeScaling
} = useScreenScaling();

onMounted(() => {
  initializeScaling(650, 380, 306, 520);
});
</script>

<template>
  <div ref="screensPanelRef">
    <div :style="{ transform: `scale(${desktopScale})` }">
      <!-- Desktop canvas -->
    </div>
    <div :style="{ transform: `scale(${mobileScale})` }">
      <!-- Mobile canvas -->
    </div>
  </div>
</template>
```

---

### useListSyncing()

**File**: [composables/useListSyncing.ts](../app/composables/useListSyncing.ts)

**Purpose**: Synchronizes block lists between desktop and mobile screens

**Parameters**:
```typescript
{
  desktopList: Ref<any[]>,
  mobileList: Ref<any[]>,
  syncEnabled: Ref<boolean>,
  onDesktopListUpdate: (list: any[]) => void,
  onMobileListUpdate: (list: any[]) => void
}
```

**Usage**:
```typescript
import { useListSyncing } from '~/composables/useListSyncing';

useListSyncing({
  desktopList: desktopListRef,
  mobileList: mobileListRef,
  syncEnabled: syncScreensRef,
  onDesktopListUpdate: (list) => {
    emit('update:desktopList', list);
  },
  onMobileListUpdate: (list) => {
    emit('update:mobileList', list);
  }
});
```

**Behavior**:
- When `syncEnabled` is `true`, changes to either list update both
- When `false`, lists remain independent
- Automatically watches for changes and syncs

---

### useElementConstraints()

**File**: [composables/useElementConstraints.ts](../app/composables/useElementConstraints.ts)

**Purpose**: Validates and enforces element constraints (min/max instances)

**Returns**:
```typescript
{
  canAddElement: (type: string, currentList: any[]) => boolean,
  getElementCount: (type: string, list: any[]) => number,
  getConstraints: (type: string) => ElementConstraints
}
```

**ElementConstraints Interface**:
```typescript
interface ElementConstraints {
  min: number;
  max: number;
  required: boolean;
}
```

**Usage**:
```typescript
import { useElementConstraints } from '~/composables/useElementConstraints';

const { canAddElement, getConstraints } = useElementConstraints();

// Check if can add more
if (canAddElement('navbar', desktopList.value)) {
  // Add navbar
}

// Get constraints
const navConstraints = getConstraints('navbar');
console.log(navConstraints.max); // 1 (only one navbar allowed)
```

---

## Utility Functions

### getComponent(type: string)

**Location**: `ItemsList.vue` (local function)

**Purpose**: Maps block type string to Vue component

**Parameters**:
- `type: string` - Block type identifier

**Returns**: Vue component or `null`

**Usage**:
```typescript
const component = getComponent('hero'); // HeroBlock component
```

---

### cloneItem(original: Item)

**Location**: `ItemsList.vue` (local function)

**Purpose**: Creates new block instance with unique ID when dragging

**Parameters**:
- `original: Item` - Original item from sidebar

**Returns**: New item with unique `id`

**Implementation**:
```typescript
const cloneItem = (original) => ({
  ...original,
  id: `${original.type || 'item'}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
});
```

---

## Type Definitions

### BusinessInfo

```typescript
interface BusinessInfo {
  companyName: string;
  email: string;
  telephone: string;
  address: string;
  city: string;
  postalCode: string;
  website: string;
  businessHours: string;
  taxId: string;
}
```

### BlockData

```typescript
interface BlockData {
  blockId: string;
  blockType: string;
  position?: number;
  title?: string;
  subtitle?: string;
  customData?: Record<string, any>;
}
```

### ScreenBlocks

```typescript
interface ScreenBlocks {
  [blockId: string]: BlockData;
}
```

### QuizQuestion

```typescript
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  fieldName: keyof BusinessInfo;
  type: 'text' | 'select';
}
```

---

## Event System

### ItemsList Events

**`change`**: Emitted when list changes (drag/drop)
```typescript
@change="handleChange"
```

**`remove`**: Emitted when block is deleted
```typescript
@remove="(blockId) => handleRemove(blockId)"
```

### ScreensPanel Events

**`update:desktopList`**: Desktop list changed
```typescript
@update:desktopList="(list) => desktopList = list"
```

**`update:mobileList`**: Mobile list changed
```typescript
@update:mobileList="(list) => mobileList = list"
```

**`toggle-desktop-drawing`**: Toggle desktop drawing mode
**`toggle-mobile-drawing`**: Toggle mobile drawing mode
**`set-desktop-canvas-ref`**: Set desktop canvas reference
**`set-mobile-canvas-ref`**: Set mobile canvas reference

---

## Best Practices

### When to Use Stores Directly

✅ **Use stores directly**:
- In composables (abstraction layer)
- For actions (updateBusinessInfo, setBlockData)
- For data export/import

❌ **Don't use stores directly**:
- In block components (use composables)
- For read-only access (use composables)

### When to Use Composables

✅ **Use composables**:
- In all Vue components
- For reactive data access
- For computed helpers
- For abstraction and testability

### Memory Management

- **Blocks store**: Data persists after block deletion (minor memory leak)
- **Business store**: In-memory only, resets on page refresh
- **Quiz store**: Persists during session

---

**Next**: [Component Catalog](06-COMPONENT-CATALOG.md)
