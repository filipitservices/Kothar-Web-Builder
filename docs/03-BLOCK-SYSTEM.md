# Block System Architecture

**Complete guide to the block system: lifecycle, data management, editing patterns, and implementation.**

---

## Overview

The block system is the core of Kothar, providing 13 pre-built, reusable UI components that users can drag, customize, and arrange to build websites.

### Key Concepts

**1. Block Types**
- Pre-defined component templates (Hero, Nav, Footer, Form, etc.)
- Each type has specific layout, styling, and editable fields
- Registered in `ItemsList.vue` component map

**2. Block Instances**
- Each drag creates a new instance with unique `blockId`
- Format: `{type}-{timestamp}-{random}` (e.g., `navbar-1738083421789-a3f2c1`)
- Independent customizations per instance
- Can have multiple instances of same type on one screen

**3. Block Data**
- **Global fallback**: Business store data (company name, email, etc.)
- **Local override**: Per-instance customData stored in blocks store
- **Merged data**: Composable combines both for display

**4. Screen Independence**
- Desktop and mobile have separate block lists
- Same block can have different customizations per screen
- Blocks store organized by `screenId` (`desktop` or `mobile`)

---

## Block Lifecycle

### 1. Creation (Drag from Sidebar)

```
User drags block from sidebar
         ↓
ItemsList.vue detects drag (vue-draggable)
         ↓
cloneItem() generates unique blockId
  Format: `${type}-${Date.now()}-${Math.random()...}`
         ↓
New item object created:
  {
    id: blockId,
    type: blockType,
    label: displayLabel
  }
         ↓
Added to desktopList or mobileList (parent state)
         ↓
ItemsList re-renders with new block
```

**Code** (`ItemsList.vue`):
```javascript
const cloneItem = (original) => ({
  ...original,
  id: `${original.type || 'item'}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
});
```

### 2. Initialization & Rendering

```
Block added to list array
         ↓
ItemsList iterates list with v-for
         ↓
Dynamic component rendering:
  <component :is="getComponent(element.type)" 
             :block-id="element.id"
             :screen-type="screenType" />
         ↓
Block component mounts
         ↓
useBlockData(blockId) called in setup()
         ↓
Composable checks blocks store for existing data
         ↓
If not found, auto-initializes empty customData:
  blocksStore.setBlockData(screenId, blockId, blockType, {
    title: '',
    subtitle: '',
    customData: {}
  })
         ↓
Component renders with merged business + custom data
```

### 3. User Editing

```
User clicks contenteditable field
         ↓
Browser makes field editable (built-in)
         ↓
User types new content
         ↓
User clicks away or presses Enter
         ↓
@blur event fires
         ↓
updateField() handler extracts new value
  e.target.textContent?.trim()
         ↓
Calls setField(fieldName, newValue)
         ↓
useBlockData → blocksStore.updateBlockCustomField()
         ↓
Store updates screens[screenId][blockId].customData[fieldName]
         ↓
Vue reactivity triggers re-render
         ↓
Component displays updated value
         ↓
Visual indicator shows customized state (bold text)
```

**Code Example** (`FooterBlock.vue`):
```vue
<template>
  <span
    class="editable"
    :class="{ 'has-local-value': isLocalValue('tagline') }"
    @blur="updateTagline"
    @keydown.enter.prevent="handleEnter"
    contenteditable="true"
  >
    {{ tagline }}
  </span>
</template>

<script setup>
const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const tagline = computed(() => 
  getField('tagline') ?? 'Quality service you can trust.'
);

const updateTagline = (e) => {
  const newValue = e.target.textContent?.trim() || '';
  setField('tagline', newValue);
};

const handleEnter = (e) => e.target.blur(); // Save on Enter
</script>
```

### 4. Deletion

```
User clicks × button on block
         ↓
ItemsList emits 'remove' event with blockId
         ↓
Parent component (ScreenCard) handles event
         ↓
Removes item from desktopList/mobileList array
         ↓
Block component unmounts (Vue lifecycle)
         ↓
⚠️ Data remains in blocks store (no cleanup)
         ↓
Note: Could add cleanup in future:
  blocksStore.removeBlock(screenId, blockId)
```

---

## Block Data Management

### Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│            User Interaction                 │
│   (edits field in block component)          │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│       Block Component (Presentation)        │
│  - Receives blockId prop                    │
│  - Calls useBlockData(blockId)              │
│  - Renders merged data                      │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│      useBlockData (Logic Layer)             │
│  - getField(name) → value                   │
│  - setField(name, value)                    │
│  - isLocalValue(name) → boolean             │
│  - mergedData (business + custom)           │
└─────────┬──────────────────┬────────────────┘
          │                  │
          ↓                  ↓
┌─────────────────┐  ┌─────────────────┐
│ Business Store  │  │  Blocks Store   │
│  (Global Data)  │  │  (Per-Instance) │
│  - companyName  │  │  - customData   │
│  - email        │  │  - per screen   │
│  - telephone    │  │  - per blockId  │
└─────────────────┘  └─────────────────┘
```

### Data Priority & Fallbacks

**Priority Order** (highest to lowest):
1. **Block customData** - User customized this specific block instance
2. **Business store** - Global company information
3. **Component default** - Hard-coded fallback in component

**Example**: Footer brand text
```javascript
// Priority 1: Check custom field
const brandText = getField('brandText');

if (brandText) {
  return brandText; // ✅ User customized
}

// Priority 2: Check business data
const companyName = mergedData.value.companyName;
if (companyName) {
  return companyName; // ✅ From business info
}

// Priority 3: Default
return 'Your Company'; // ⚠️ Fallback
```

---

## Available Block Types

### 1. NavBlock (navbar)
- **Editable**: Brand text
- **Static**: Menu items (Home, About, Services, Contact)
- **Business Fallback**: `companyName` for brand
- **Use Case**: Site navigation

### 2. HeroBlock (hero)
- **Editable**: None (fully static in current implementation)
- **Static**: Title, subtitle, CTA buttons, visual placeholder
- **Use Case**: Landing page hero section

### 3. FooterBlock (footer)
- **Editable**: Brand text, tagline, copyright text
- **Business Display**: Email, telephone, address
- **Business Fallback**: `companyName` for brand/copyright
- **Use Case**: Site footer with contact info

### 4. FormBlock (form)
- **Editable**: Title, subtitle, button text, placeholder
- **Business Display**: Email (form destination)
- **Static**: Name, Email, Message fields
- **Use Case**: Contact form

### 5. HeaderBlock (header)
- **Editable**: Title, subtitle
- **Use Case**: Section heading

### 6. CtaBlock (cta)
- **Editable**: Title, subtitle, button text
- **Use Case**: Call-to-action section

### 7. FeaturesBlock (features)
- **Editable**: Title, 3× feature titles and descriptions
- **Layout**: 3-column grid
- **Use Case**: Product/service features

### 8. TestimonialBlock (testimonial)
- **Editable**: Quote, author name, author title
- **Use Case**: Customer testimonial

### 9. FaqBlock (faq)
- **Editable**: Title, 3× question/answer pairs
- **Use Case**: Frequently asked questions

### 10. PricingBlock (pricing)
- **Editable**: 3× plan names, prices, features
- **Layout**: 3-column pricing table
- **Use Case**: Pricing/subscription tiers

### 11. StatsBlock (stats)
- **Editable**: 3× stat numbers and labels
- **Layout**: 3-column statistics
- **Use Case**: Company metrics, achievements

### 12. GalleryBlock (gallery)
- **Editable**: None (uses placeholder divs)
- **Layout**: 3×2 grid of image placeholders
- **Use Case**: Image gallery/portfolio
- **Note**: Future enhancement for image uploads

### 13. TextBlock (text)
- **Editable**: Title, body text
- **Use Case**: General content section

---

## Inline Editing Pattern

### Why Contenteditable?

**Benefits**:
- ✅ WYSIWYG editing (edit in place, see result immediately)
- ✅ No modal dialogs or separate forms
- ✅ Native browser editing behavior
- ✅ Auto-save on blur (click away)
- ✅ Simple implementation

**Drawbacks**:
- ⚠️ Limited to plain text (no rich formatting)
- ⚠️ Browser inconsistencies
- ⚠️ Requires careful event handling

### Implementation Pattern

**Template**:
```vue
<span
  class="editable"
  :class="{ 'has-local-value': isLocalValue('fieldName') }"
  @blur="updateField"
  @keydown.enter.prevent="handleEnter"
  contenteditable="true"
>
  {{ fieldValue }}
</span>
```

**Script**:
```typescript
const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const fieldValue = computed(() => 
  getField('fieldName') ?? 'Default Value'
);

const updateField = (e: FocusEvent) => {
  const newValue = (e.target as HTMLElement).textContent?.trim() || '';
  const currentValue = getField('fieldName') || '';
  
  // Only update if changed (avoid unnecessary store writes)
  if (newValue !== currentValue) {
    setField('fieldName', newValue);
  }
};

const handleEnter = (e: KeyboardEvent) => {
  // Blur on Enter key (triggers save)
  (e.target as HTMLElement).blur();
};
```

**Styling**:
```css
.editable {
  cursor: text;
  transition: all 0.15s ease;
  padding: 2px 4px;
  margin: -2px -4px;
  border-radius: 3px;
}

.editable:hover {
  background: rgba(30, 58, 138, 0.03);
}

.editable:focus {
  background: rgba(30, 58, 138, 0.08);
  outline: 1px solid rgba(30, 58, 138, 0.2);
}

/* Visual indicator for customized fields */
.editable.has-local-value {
  font-weight: 600;
}
```

---

## Adding a New Block

### Step-by-Step Guide

**1. Create Component File**

`app/components/BlockElements/MyBlock.vue`:
```vue
<template>
  <div class="my-block" :class="{ 'mobile-layout': screenType === 'mobile' }">
    <div class="my-title">
      <span
        class="editable"
        :class="{ 'has-local-value': isLocalValue('title') }"
        @blur="updateTitle"
        @keydown.enter.prevent="handleEnter"
        contenteditable="true"
      >
        {{ title }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';

const props = defineProps({
  blockId: { type: String, required: true },
  screenType: { type: String, default: 'desktop' }
});

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const title = computed(() => getField('title') ?? 'Default Title');

const updateTitle = (e: FocusEvent) => {
  const newValue = (e.target as HTMLElement).textContent?.trim() || '';
  setField('title', newValue);
};

const handleEnter = (e: KeyboardEvent) => (e.target as HTMLElement).blur();
</script>

<style scoped>
.my-block {
  padding: 14px;
  background: #f8fafc;
}

.my-title {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
}

.my-block.mobile-layout {
  padding: 10px;
}

.my-block.mobile-layout .my-title {
  font-size: 14px;
}

/* Inline editing styles */
.editable {
  /* ... same as other blocks ... */
}
</style>
```

**2. Register in ItemsList**

`app/components/ItemsList.vue`:
```javascript
// Add import
import MyBlock from './BlockElements/MyBlock.vue';

// Add to componentMap
const componentMap = {
  hero: HeroBlock,
  navbar: NavBlock,
  myblock: MyBlock, // ✅ Add here
  // ... other blocks
};
```

**3. Add to Available List**

`app/pages/index.vue`:
```javascript
const availableList = ref([
  { id: 'el-nav', type: 'navbar', label: 'Navigation' },
  { id: 'el-myblock', type: 'myblock', label: 'My Custom Block' }, // ✅ Add here
  // ... other blocks
]);
```

**4. Test**
- Drag block from sidebar onto canvas
- Edit title inline
- Verify data saves to blocks store
- Test on mobile screen

---

## Best Practices

### Do's ✅

1. **Always use `useBlockData(blockId)`** for data access
2. **Extract blockType from blockId** when initializing
3. **Provide sensible defaults** for all fields
4. **Use `isLocalValue()`** for visual indicators
5. **Handle Enter key** to blur and save
6. **Compare values before updating** to avoid unnecessary store writes
7. **Use mobile-layout class** for responsive styling
8. **Follow naming convention**: `{type}-{timestamp}-{random}`

### Don'ts ❌

1. **Don't access stores directly** in components (use composables)
2. **Don't hardcode business data** (use mergedData fallback)
3. **Don't forget blur handlers** (editing won't save)
4. **Don't use v-model on contenteditable** (doesn't work, use @blur)
5. **Don't assume blockData exists** (check for undefined)
6. **Don't share blockId** between desktop/mobile (they're independent)

---

## Common Patterns

### Pattern 1: Simple Editable Field

```vue
<template>
  <span
    class="editable"
    @blur="updateField"
    contenteditable="true"
  >
    {{ fieldValue }}
  </span>
</template>

<script setup>
const fieldValue = computed(() => getField('fieldName') ?? 'Default');

const updateField = (e) => {
  setField('fieldName', e.target.textContent?.trim() || '');
};
</script>
```

### Pattern 2: Business Data Fallback

```vue
<template>
  <div>{{ displayValue }}</div>
</template>

<script setup>
const displayValue = computed(() => 
  getField('customValue') ?? mergedData.value.companyName ?? 'Fallback'
);
</script>
```

### Pattern 3: Multiple Editable Fields

```vue
<template>
  <div>
    <h2 @blur="updateTitle" contenteditable>{{ title }}</h2>
    <p @blur="updateSubtitle" contenteditable>{{ subtitle }}</p>
  </div>
</template>

<script setup>
const title = computed(() => getField('title') ?? 'Title');
const subtitle = computed(() => getField('subtitle') ?? 'Subtitle');

const updateTitle = (e) => setField('title', e.target.textContent?.trim());
const updateSubtitle = (e) => setField('subtitle', e.target.textContent?.trim());
</script>
```

### Pattern 4: Conditional Business Data Display

```vue
<template>
  <div v-if="mergedData.hasContact">
    <div v-if="mergedData.email">{{ mergedData.email }}</div>
    <div v-if="mergedData.telephone">{{ mergedData.telephone }}</div>
  </div>
  <div v-else>No contact information available</div>
</template>
```

---

## Known Limitations

### 1. Screen Detection
- **Issue**: `useBlockData` always defaults to 'desktop'
- **Impact**: Mobile blocks may not save correctly
- **Workaround**: Components receive `screenType` prop but composable doesn't use it yet
- **TODO**: Implement provide/inject or route-based detection

### 2. No Data Cleanup on Delete
- **Issue**: Block data persists in store after deletion
- **Impact**: Memory accumulation over time (minor)
- **Workaround**: None currently
- **TODO**: Add cleanup in block deletion handler

### 3. Static Block Content
- **Issue**: HeroBlock and GalleryBlock have no editable fields
- **Impact**: Users can't customize these blocks
- **TODO**: Add inline editing for all content

### 4. No Image Upload
- **Issue**: GalleryBlock uses placeholder divs
- **Impact**: Can't add real images
- **TODO**: Implement image upload and storage

### 5. No Undo/Redo for Block Edits
- **Issue**: Only drawing has undo/redo
- **Impact**: Can't revert text changes
- **TODO**: Implement edit history

---

**Next**: [Data Flow](04-DATA-FLOW.md)
