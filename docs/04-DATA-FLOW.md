# Data Flow Reference

**Complete state management patterns, data flows, and reactivity diagrams.**

---

## Overview

The app uses **dual-store architecture**:
- **Business Store**: Global company data (name, email, phone, etc.)
- **Blocks Store**: Per-instance block customizations

Data flows through **composables** that abstract store access and provide helpers.

---

## Store Architecture

### Business Store (Global)

**File**: [stores/business.ts](../app/stores/business.ts)

```
┌─────────────────────────────────────┐
│       Business Store (Global)       │
├─────────────────────────────────────┤
│ • companyName                       │
│ • email                             │
│ • telephone                         │
│ • address                           │
│ • city                              │
│ • postalCode                        │
│ • website                           │
│ • businessHours                     │
│ • taxId                             │
└─────────────────────────────────────┘
         │
         ↓
    (accessed via)
         │
         ↓
┌─────────────────────────────────────┐
│      useBusinessData()              │
│  (composable abstraction)           │
├─────────────────────────────────────┤
│ Returns:                            │
│  • companyName (computed ref)       │
│  • email (computed ref)             │
│  • telephone (computed ref)         │
│  • address (computed ref)           │
│  • city (computed ref)              │
│  • postalCode (computed ref)        │
│  • website (computed ref)           │
│  • businessHours (computed ref)     │
│  • taxId (computed ref)             │
│  • fullAddress (computed ref)       │
│  • hasContact (computed ref)        │
│  • isComplete (computed ref)        │
└─────────────────────────────────────┘
```

**Implementation**:
```javascript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBusinessStore = defineStore('business', () => {
  const companyName = ref('');
  const email = ref('');
  const telephone = ref('');
  const address = ref('');
  const city = ref('');
  const postalCode = ref('');
  const website = ref('');
  const businessHours = ref('');
  const taxId = ref('');
  
  const updateBusinessInfo = (data) => { /* ... */ };
  const resetBusinessInfo = () => { /* ... */ };
  const getBusinessInfo = () => ({ /* ... */ });
  
  return {
    companyName,
    email,
    telephone,
    address,
    city,
    postalCode,
    website,
    businessHours,
    taxId,
    updateBusinessInfo,
    resetBusinessInfo,
    getBusinessInfo
  };
});
```

### Blocks Store (Per-Instance)

**File**: [stores/blocks.ts](../app/stores/blocks.ts)

```
┌─────────────────────────────────────────────────┐
│           Blocks Store (Per-Instance)           │
├─────────────────────────────────────────────────┤
│ Structure:                                      │
│  screens: {                                     │
│    "desktop": {                                 │
│      "el-hero-1234": {                          │
│        blockId: "el-hero-1234",                 │
│        blockType: "hero",                       │
│        customData: { title: "...", ... }        │
│      },                                         │
│      "el-footer-5678": {                        │
│        blockId: "el-footer-5678",               │
│        blockType: "footer",                     │
│        customData: { brandText: "..." }         │
│      }                                          │
│    },                                           │
│    "mobile": {                                  │
│      "el-hero-9999": {                          │
│        blockId: "el-hero-9999",                 │
│        blockType: "hero",                       │
│        customData: { title: "..." }             │
│      }                                          │
│    }                                            │
│  }                                              │
└─────────────────────────────────────────────────┘
         │
         ↓
    (accessed via)
         │
         ↓
┌─────────────────────────────────────────────────┐
│           useBlockData(blockId)                 │
│       (composable abstraction)                  │
├─────────────────────────────────────────────────┤
│ Returns:                                        │
│  • getField(name) → value                       │
│  • setField(name, value) → void                 │
│  • isLocalValue(name) → boolean                 │
│  • mergedData (business + custom)               │
│  • blockData (full block object)                │
│  • deleteBlock() → void                         │
│  • screenId (desktop/mobile)                    │
└─────────────────────────────────────────────────┘
```

**Implementation**:
```javascript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBlocksStore = defineStore('blocks', () => {
  // State: { screenId -> { blockId -> blockData } }
  const screens = ref<Record<string, ScreenBlocks>>({
    desktop: {},
    mobile: {}
  });
  
  const getScreenBlocks = (screenId: 'desktop' | 'mobile') => {
    return screens.value[screenId] || {};
  };
  
  const getBlockData = (screenId: 'desktop' | 'mobile', blockId: string) => {
    return screens.value[screenId]?.[blockId];
  };
  
  const setBlockData = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    blockType: string,
    data: Partial<BlockData>
  ) => {
    if (!screens.value[screenId]) {
      screens.value[screenId] = {};
    }
    
    const existing = screens.value[screenId][blockId];
    screens.value[screenId][blockId] = {
      blockId,
      blockType,
      position: data.position ?? existing?.position,
      title: data.title ?? existing?.title,
      subtitle: data.subtitle ?? existing?.subtitle,
      customData: {
        ...existing?.customData,
        ...data.customData
      }
    };
  };
  
  const updateBlockCustomField = (
    screenId: 'desktop' | 'mobile',
    blockId: string,
    fieldName: string,
    value: any
  ) => {
    if (screens.value[screenId]?.[blockId]) {
      if (!screens.value[screenId][blockId].customData) {
        screens.value[screenId][blockId].customData = {};
      }
      screens.value[screenId][blockId].customData[fieldName] = value;
    }
  };
  
  const removeBlock = (screenId: 'desktop' | 'mobile', blockId: string) => {
    if (screens.value[screenId]) {
      delete screens.value[screenId][blockId];
    }
  };
  
  return {
    screens,
    getScreenBlocks,
    getBlockData,
    setBlockData,
    updateBlockCustomField,
    removeBlock
  };
});
```

---

## Composable Architecture

### useBusinessData()

**File**: [composables/useBusinessData.ts](../app/composables/useBusinessData.ts)

**Purpose**: Abstraction layer for business store access

**Returns**:
```typescript
{
  // Raw fields (computed refs)
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
  fullAddress: ComputedRef<string>,      // "123 Main St, City, 12345"
  hasContact: ComputedRef<boolean>,      // true if email or telephone exists
  isComplete: ComputedRef<boolean>       // true if all required fields filled
}
```

**Implementation**: Uses `storeToRefs(businessStore)` for reactive field refs (companyName, email, etc.) and `computed()` for fullAddress, hasContact, and isComplete. Exposes getField and updateBusinessInfo from the store. Components use the returned refs and helpers; they do not access the store directly.

### useBlockData(blockId)

**File**: [composables/useBlockData.ts](../app/composables/useBlockData.ts)

**Purpose**: Access and update block-specific data with optional business data fallback

**Signature**:
```typescript
function useBlockData(blockId: string, screenIdOrRef?: 'desktop' | 'mobile' | string | { value: string }): {
  getField: (name: string) => unknown,
  setField: (name: string, value: unknown) => void,
  isLocalValue: (name: string) => boolean,
  mergedData: ComputedRef<...>,
  blockData: ComputedRef<BlockData | undefined>,
  deleteBlock: () => void,
  screenId: ComputedRef<'desktop' | 'mobile'>
}
```

**Screen context**: Block components receive `screenType` from parent (ItemsList). Pass it as the second argument: `useBlockData(blockId, screenType)` so desktop and mobile data stay separate. Defaults to `'desktop'` if omitted.

**Implementation**:
```javascript
import { computed } from 'vue';
import { useBlocksStore } from '~/stores/blocks';
import { useBusinessData } from '~/composables/useBusinessData';

export function useBlockData(blockId) {
  const blocksStore = useBlocksStore();
  const businessData = useBusinessData();
  
  // Currently hardcoded to 'desktop' - TODO: implement proper screen detection
  // In future, could use: useRoute() or provide/inject pattern
  const screenId = computed<'desktop' | 'mobile'>(() => {
    return 'desktop'; // Default fallback
  });

  const getField = (fieldName: string): any => {
    const blockData = blocksStore.getBlockData(screenId.value, blockId);
    return blockData?.customData?.[fieldName];
  };

  const setField = (fieldName: string, value: any): void => {
    let blockData = blocksStore.getBlockData(screenId.value, blockId);
    if (!blockData) {
      const blockType = blockId.split('-')[1] || 'unknown';
      blocksStore.setBlockData(screenId.value, blockId, blockType, {
        title: '',
        subtitle: '',
        customData: {}
      });
    }
    
    blocksStore.updateBlockCustomField(screenId.value, blockId, fieldName, value);
  };

  const isLocalValue = (fieldName: string): boolean => {
    const value = getField(fieldName);
    return value !== undefined && value !== null && value !== '';
  };

  const mergedData = computed(() => {
    return {
      // Business data from global store
      ...{
        companyName: businessData.companyName.value,
        email: businessData.email.value,
        telephone: businessData.telephone.value,
        address: businessData.address.value,
        city: businessData.city.value,
        postalCode: businessData.postalCode.value,
        website: businessData.website.value,
        businessHours: businessData.businessHours.value,
        taxId: businessData.taxId.value,
        fullAddress: businessData.fullAddress.value,
        hasContact: businessData.hasContact.value,
        isComplete: businessData.isComplete.value
      },
      
      // Block-specific customizations override above
      ...blocksStore.getBlockData(screenId.value, blockId)?.customData
    };
  });

  const blockData = computed(() => blocksStore.getBlockData(screenId.value, blockId));

  const deleteBlock = () => {
    blocksStore.removeBlock(screenId.value, blockId);
  };

  return {
    getField,
    setField,
    isLocalValue,
    mergedData,
    blockData,
    deleteBlock,
    screenId
  };
}
```

---

## Data Flow Patterns

### Pattern 1: Read-Only Business Data

**Use Case**: Display company info without customization

```
┌──────────────────┐
│   Component      │
│  (FooterBlock)   │
└────────┬─────────┘
         │
         │ import useBusinessData
         ↓
┌──────────────────┐
│ useBusinessData()│
└────────┬─────────┘
         │
         │ reads from
         ↓
┌──────────────────┐
│  Business Store  │
│  companyName     │
│  email           │
│  telephone       │
└──────────────────┘
```

**Code**:
```vue
<script setup>
import { useBusinessData } from '~/composables/useBusinessData';

const business = useBusinessData();
</script>

<template>
  <div class="footer-info">
    <div>{{ business.companyName.value }}</div>
    <div>{{ business.email.value }}</div>
    <div>{{ business.telephone.value }}</div>
  </div>
</template>
```

### Pattern 2: Editable Block Data

**Use Case**: User can customize text per block instance

```
┌──────────────────┐
│   Component      │
│   (TextBlock)    │
└────────┬─────────┘
         │
         │ import useBlockData
         ↓
┌──────────────────┐
│useBlockData(id)  │
└────────┬─────────┘
         │
         │ reads/writes
         ↓
┌──────────────────┐
│  Blocks Store    │
│  desktop: {      │
│    "el-text-1": {│
│      customData: │
│        { title }  │
│    }             │
│  }               │
└──────────────────┘
```

**Code**:
```vue
<script setup>
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';

const props = defineProps({
  blockId: { type: String, required: true }
});

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const blockData = computed(() => ({
  title: getField('title') ?? 'Default Title'
}));

const updateTitle = (e) => {
  const newValue = e.target.textContent?.trim() || '';
  const currentValue = getField('title') || '';
  if (newValue !== currentValue) {
    setField('title', newValue);
  }
};
</script>

<template>
  <div 
    class="text-title editable"
    :class="{ 'has-local-value': isLocalValue('title') }"
    @blur="updateTitle"
    contenteditable="true"
  >
    {{ blockData.title }}
  </div>
</template>
```

### Pattern 3: Merged Business + Custom Data

**Use Case**: Fall back to business data if not customized

```
┌──────────────────┐
│   Component      │
│  (FooterBlock)   │
└────────┬─────────┘
         │
         │ import useBlockData
         ↓
┌──────────────────┐
│useBlockData(id)  │
│   mergedData     │
└────────┬─────────┘
         │
         │ merges
         ├────────────────┐
         ↓                ↓
┌──────────────┐  ┌──────────────┐
│Business Store│  │ Blocks Store │
│ companyName  │  │  brandText   │
│ email        │  │  (custom)    │
└──────────────┘  └──────────────┘
         │                │
         └────────┬───────┘
                  ↓
         ┌────────────────┐
         │  Merged Data   │
         ├────────────────┤
         │ brandText OR   │
         │ companyName    │
         │ (fallback)     │
         └────────────────┘
```

**Code**:
```vue
<script setup>
const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);

const blockData = computed(() => ({
  brandText: getField('brandText') ?? (mergedData.value.companyName || 'Your Company')
}));
</script>

<template>
  <div class="brand">{{ blockData.brandText }}</div>
  <div class="contact" v-if="mergedData.hasContact">
    <div v-if="mergedData.email">{{ mergedData.email }}</div>
    <div v-if="mergedData.telephone">{{ mergedData.telephone }}</div>
  </div>
</template>
```

---

## Reactivity Flow

### User Edits Field

```
User clicks contenteditable div
         │
         ↓
User types text
         │
         ↓
User clicks away (@blur event)
         │
         ↓
updateField(e) handler called
         │
         ↓
e.target.textContent extracted
         │
         ↓
Trimmed and compared to current value
         │
         ↓
setField('fieldName', newValue)
         │
         ↓
Blocks Store updated
         │
         ↓
Computed blockData reactive update
         │
         ↓
Template re-renders with new value
```

**Code**:
```javascript
const updateTitle = (e) => {
  const newValue = e.target.textContent?.trim() || '';
  const currentValue = getField('title') || '';
  if (newValue !== currentValue) {
    setField('title', newValue);  // Triggers reactivity
  }
};
```

### Business Data Change

```
User edits business info (e.g., company name)
         │
         ↓
Business Store updated
         │
         ↓
useBusinessData() computed refs update
         │
         ↓
Components using business data re-render
         │
         ↓
mergedData in useBlockData also updates
         │
         ↓
Blocks using mergedData re-render with new fallback values
```

---

## State Persistence

### LocalStorage

**Not currently implemented**, but could be added:

```javascript
// In stores/blocks.ts
import { watch } from 'vue';

export const useBlocksStore = defineStore('blocks', () => {
  const desktopBlocks = ref({});
  const mobileBlocks = ref({});
  
  // Load from localStorage on init
  if (process.client) {
    const saved = localStorage.getItem('blocks-data');
    if (saved) {
      const data = JSON.parse(saved);
      desktopBlocks.value = data.desktop || {};
      mobileBlocks.value = data.mobile || {};
    }
  }
  
  // Save to localStorage on change
  if (process.client) {
    watch([desktopBlocks, mobileBlocks], () => {
      localStorage.setItem('blocks-data', JSON.stringify({
        desktop: desktopBlocks.value,
        mobile: mobileBlocks.value
      }));
    }, { deep: true });
  }
  
  // ... rest of store
});
```

### API Persistence

**Not currently implemented**, but could be added:

```javascript
// In composables/useBlockData.ts
function setField(name, value) {
  blocksStore.setBlockField(blockId, name, value, screenId);
  
  // Auto-save to API
  $fetch('/api/blocks/save', {
    method: 'POST',
    body: {
      blockId,
      screenId,
      fieldName: name,
      value
    }
  }).catch(err => {
    console.error('Failed to save block data:', err);
    // Could revert local change or show error
  });
}
```

---

## Whop access (subscription entitlement)

**Store:** `stores/whopAccess.ts` holds the last result of **`GET /api/access/me`** (`hasAccess`, `pending`). It is reset on sign-out (`useAuth`). **Draft submission** does not rely on this store for the status transition (see **`finalize-draft`**). **Non-draft** order edits and **`ensureLoaded`** still use **`fetchAccessFromServer()`** for UX; **`GET /api/access/me`** revalidates billing when API keys and product/plan ids are set.

**Composable:** `useWhopAccess()` exposes **`fetchAccessFromServer()`**, **`ensureLoaded()`**, **`refresh()`**, **`openCheckout(returnPath?)`**, and computed refs. Whop post-checkout URL is centralized as **`WHOP_CHECKOUT_RETURN_PATH`** in **`constants/access.ts`** (same origin + **`/sites?tab=orders`**).

**Draft submit:** **`useDraftRequestSubmitFlow()`** (`composables/useDraftRequestSubmitFlow.ts`) persists the draft with **`updateOrder`**, then **`POST /api/orders/finalize-draft`** so **`draft → submitted`** is enforced on the server with live Whop **`checkAccess`** (not a second client `updateDoc`). If entitlement fails, the API returns **HTTP 200** with **`{ ok: false, reason: 'subscription_required' }`** (avoids spurious console errors); the UI shows the access modal and **does not** navigate as success — the order stays **draft**. On success **`{ ok: true }`**, navigate to orders. **Gallery request** and **draft** **`/orders/[id]/edit`** use it; **submitted** order edits still use **`fetchAccessFromServer()`** + client update + rules. Builder stays ungated.

**Errors on finalize or prior `updateOrder`:** Non-403 failures from **`$fetch`** to **`finalize-draft`** are thrown as **`FinalizeDraftError`** (`types/finalizeDraftError.ts`) with **`statusCode`**, **`statusMessage`**, and **`cause`**, then normalized in **`normalizeRequestFlowError()`** and shown in **`RequestFlowErrorModal`**. Subscription denials stay **`subscription_required`** (modal checkout flow), not this error dialog.

**Orders list (`stores/orders.ts`):** **`useOrdersSnapshotWhenFocused`** detaches on route unmount (**`detachSnapshotListener`**) but **keeps** cached rows; **`unsubscribeFromOrders()`** clears the list on empty **`userId`** or **sign-out** (`useAuth`).

**Server truth:** **`POST /api/orders/finalize-draft`** is the authoritative gate for **draft → submitted** (`evaluateWhopProductAccess` + membership cancel policy + Admin order update). Firestore `users/{uid}/access/billing` is still written by webhooks and **`GET /api/access/me`** sync for UI and for **non-draft** order updates that use client `updateDoc` + rules. Without a Whop API key, finalize cannot assert live access (**`{ ok: false }`**); set **`NUXT_WHOP_API_KEY`** and product/plan ids.

## Unsaved Navigation Data Flow

`stores/unsavedChanges.ts` is the single source of truth for route-leave prompting. Active editors register via `useUnsavedChanges()` with:

- `isDirty`: diff-based form/layout/builder edits
- `hasUnsavedSession`: draft-session state (`order.status === 'draft'`)
- `onDiscard`: page-specific rehydrate/reset action
- `onStashLeave` (optional): page-scoped stash hook used only where supported

The guard (`app/plugins/unsaved-changes-guard.client.ts`) classifies navigation intent via `app/utils/editingFlowScope.ts`:

- same editing scope (`/gallery/request/:id` ↔ `/gallery/request/:id/builder`, `/orders/:id/edit` ↔ `/orders/:id/builder`) -> allow without prompt
- leaving editing scope -> prompt when `hasDirtyEdits || hasUnsavedSession`

This keeps untouched drafts protected on external exits while preventing false prompts on internal edit/builder transitions.

`/orders/:id/edit` additionally provides a stash action in the same global dialog. The page wires `onStashLeave` to persist a session-scoped snapshot (form + layout) keyed by order id. On return to that order edit page, the stash is restored before editing resumes; discard and successful submit/update clear the stash.

---

## Data Flow Summary

### Read Operations

```
Component → Composable → Store → Return Value → Display
```

1. Component calls composable function
2. Composable reads from store
3. Store returns reactive ref/computed
4. Composable returns abstracted value
5. Component displays in template

### Write Operations

```
User Input → Event Handler → Composable Method → Store Mutation → Reactivity Update → Re-render
```

1. User interacts (edits text, clicks button)
2. Event handler captures input
3. Handler calls composable method (setField, etc.)
4. Composable updates store
5. Store mutation triggers reactivity
6. Computed values recalculate
7. Template re-renders with new data

### Cross-Store Dependencies

```
Business Store ←─────┐
       │             │
       │ (merged)    │
       ↓             │
Blocks Store         │
       │             │
       ↓             │
useBlockData ────────┘
   mergedData
```

`mergedData` provides seamless fallback from business data when block field not customized.

---

**Next**: [API Reference](05-API-REFERENCE.md)
