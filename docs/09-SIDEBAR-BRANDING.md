# Sidebar Branding System

**Application branding and identity display in the left sidebar footer.**

---

## Overview

The sidebar branding section is a fixed UI element anchored at the bottom of the left sidebar. It displays the application identity, current workspace/account information, and provides quick access to account and help features.

### Purpose

- **Visual Identity**: Display app branding (icon and name)
- **Workspace Awareness**: Show current workspace/account context
- **Quick Actions**: Provide convenient access to account settings and help
- **Professional Polish**: Maintain consistent UI aesthetic

---

## Architecture

### Component Structure

```
SidebarBranding.vue
├── Branding Content (app icon + text)
│   ├── Icon (SVG badge with gradient background)
│   └── Text Section
│       ├── App Name ("Site Builder")
│       └── Workspace Indicator (company name or "No workspace")
└── Action Buttons (account & help)
    ├── Account Settings Button (user icon)
    └── Help & Support Button (help icon)
```

### Integration Points

**File**: [app/components/SidebarBranding.vue](../app/components/SidebarBranding.vue)

The component integrates into the main page layout at:
- **Location**: [app/pages/index.vue](../app/pages/index.vue)
- **Parent**: Left sidebar (`.left-sidebar`)
- **Position**: Anchored at bottom, after ItemsList

### Data Source

The workspace indicator reads from the **Business Store** via the `useBusinessData()` composable:

```
Business Store (global)
    ↓
useBusinessData() [composable abstraction]
    ↓
SidebarBranding.vue [display + events]
```

This follows the **three-layer architecture** established in the project:
1. **Data Layer**: Business store holds company/workspace data
2. **Logic Layer**: `useBusinessData()` provides reactive computed refs
3. **Presentation Layer**: Component consumes and displays

---

## Component API

### Props

**None** - Component operates independently using composables and stores.

### Emits

```typescript
{
  'account-click': [],  // Fired when account button clicked
  'help-click': []      // Fired when help button clicked
}
```

### Usage

```vue
<SidebarBranding
  @account-click="handleAccountClick"
  @help-click="handleHelpClick"
/>
```

---

## Display Behavior

### App Icon

- **Visual**: SVG icon with blue gradient background (`#1e3a8a` → `#3b82f6`)
- **Size**: 36×36px square with 8px border-radius
- **Content**: Window/document icon representing the site builder
- **Purpose**: Visual branding, distinguishes the application

### App Name

- **Text**: "Site Builder" (fixed label)
- **Styling**: 
  - Font size: 13px, font-weight 700
  - Color: #1f2937 (dark gray)
  - Letter spacing: 0.3px
- **Purpose**: Clear application identification

### Workspace Indicator

- **Text**: Displays company name from business store
- **Fallback**: "No workspace" if company name is empty
- **Truncation**: Ellipsis (...) applied if name exceeds 18 characters
- **Styling**:
  - Font size: 11px, font-weight 500
  - Color: #6b7280 (medium gray)
  - Single line (whitespace: nowrap)
  - Tooltip: Full company name available on hover (title attribute)
- **Purpose**: Context awareness - shows active workspace

### Action Buttons

**Structure**: Two equal-width buttons in a row

**Account Settings Button**:
- **Icon**: User profile icon (SVG)
- **Title**: "Account Settings" (for accessibility)
- **Behavior**: Emits `account-click` event on click

**Help & Support Button**:
- **Icon**: Help/question mark icon (SVG)
- **Title**: "Help & Support" (for accessibility)
- **Behavior**: Emits `help-click` event on click

**Button Styling**:
- **Size**: Height 32px, flex: 1 (equal width)
- **Border**: 1px solid #d1d5db (light gray)
- **Background**: White, 6px border-radius
- **Icon Color**: #4b5563 (slate gray)
- **Hover State**:
  - Border color changes to #1e3a8a (blue)
  - Icon color changes to #1e3a8a
  - Background: rgba(30, 58, 138, 0.05) (subtle blue tint)
  - Box shadow: 0 2px 6px rgba(30, 58, 138, 0.1)
- **Active State**: scale(0.98) for tactile feedback

---

## Layout Integration

### Sidebar Structure

The left sidebar uses flexbox column layout with three sections:

```
┌─────────────────────────────────┐
│      .sidebar-header            │ ← flex: 0 0 auto
│    (Available Items)            │
├─────────────────────────────────┤
│                                 │
│    .sidebar-list (ItemsList)    │ ← flex: 1 (grows)
│    (scrollable content)         │
│                                 │
├─────────────────────────────────┤
│   .sidebar-branding             │ ← flex: 0 0 auto
│   (anchored at bottom)          │
└─────────────────────────────────┘
```

### CSS Implementation

**Key Properties**:

```css
.left-sidebar {
  display: flex;
  flex-direction: column;
}

.left-sidebar > .sidebar-list {
  flex: 1;        /* Grows to fill available space */
  overflow-y: auto; /* Scrolls when content exceeds space */
  min-height: 0;  /* Allows shrinking below content size */
}

.left-sidebar > .sidebar-branding {
  flex: 0 0 auto; /* Fixed size, doesn't grow or shrink */
}
```

**Result**: When items overflow, the list scrolls independently while branding remains visible at bottom.

---

## Styling System

The component respects the project's design system:

### Color Palette

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary Blue | #1e3a8a | Gradient background, hover states |
| Light Blue | #3b82f6 | Gradient highlight |
| Icon Gray | #4b5563 | Default button icon color |
| Text Dark | #1f2937 | App name text |
| Text Medium | #6b7280 | Workspace indicator |
| Border Light | #d1d5db | Button borders |
| Background | #fafafa | Branding section background |

### Typography

| Element | Size | Weight | Letter-spacing |
|---------|------|--------|-----------------|
| App Name | 13px | 700 | 0.3px |
| Workspace | 11px | 500 | - |
| Button (icon) | 16px | 2 (stroke) | - |

### Spacing

- **Internal padding**: 14px vertical, 12px horizontal
- **Icon size**: 36×36px
- **Icon-text gap**: 10px
- **Button gap**: 8px
- **Border top**: 1px solid #e5e7eb (separates from list)

---

## State & Reactivity

### Workspace Display Logic

The workspace indicator automatically updates when business data changes:

```typescript
const workspaceDisplay = computed(() => {
  const name = companyName.value?.trim();
  // Truncate if over 18 chars
  if (name && name.length > 18) {
    return name.substring(0, 15) + '...';
  }
  return name || 'No workspace';
});
```

**Behavior**:
- **Initial**: Shows "No workspace" if company name is empty
- **On Edit**: Updates reactively when user edits company name in InfoBar
- **Type-Safe**: Uses `useBusinessData()` composable, no direct store access from component

### Event Emission

Events are emitted to parent component for handling:

```typescript
const handleAccountClick = () => {
  console.log('Account settings clicked');
  emit('account-click');
};

const handleHelpClick = () => {
  console.log('Help clicked');
  emit('help-click');
};
```

**Parent Handling** (in [app/pages/index.vue](../app/pages/index.vue)):

```typescript
const handleAccountClick = () => {
  // Future: Open account settings modal or profile panel
  console.log('Account settings requested');
};

const handleHelpClick = () => {
  // Future: Open help documentation or support panel
  console.log('Help requested');
};
```

**Extensibility**: Handlers are stubbed for future implementation without modifying component.

---

## Extensibility & Future Features

### Possible Enhancements

1. **Account Dropdown Menu**
   - Extend `handleAccountClick` to show dropdown with options:
     - Profile
     - Settings
     - Billing
     - Sign Out
   - Requires small modal/dropdown component

2. **Help Panel**
   - Implement `handleHelpClick` to open help documentation
   - Could integrate with external docs or inline guide
   - Show tips, FAQs, or contact info

3. **Workspace Switching**
   - Extend workspace indicator to be clickable
   - Show list of available workspaces
   - Switch between them via store action

4. **Additional Status Icons**
   - Add visual indicators for sync status, notifications
   - Extend branding-actions section with additional buttons

5. **Theme Toggle**
   - Add theme switcher button (light/dark mode)
   - Store preference in localStorage or store

### Implementation Guidelines

**If modifying this component**:

1. **Preserve structure**: Keep the three-section layout (icon, text, actions)
2. **Respect styling**: Use existing color and spacing tokens
3. **Maintain composables**: Don't access stores directly - use composables
4. **Type-safe events**: Keep emits properly typed
5. **Accessibility**: Add aria-labels and titles to interactive elements
6. **Test behavior**: Verify workspace display updates when company name changes

---

## Visual Specifications

### Component Dimensions

| Aspect | Value |
|--------|-------|
| Width | Full sidebar width (280px) |
| Height | ~106px (content height) |
| Min-width | 256px (readable at small sizes) |
| Padding | 14px vertical, 12px horizontal |

### Spacing Details

```
Sidebar Branding (entire section)
├── Padding: 14px 12px
├── Gap: 12px (between content & actions)
│
├── Branding Content
│   ├── Gap: 10px (between icon & text)
│   ├── Icon: 36×36px
│   └── Text
│       ├── App Name: 13px
│       ├── Workspace: 11px
│       └── Gap: 2px (between lines)
│
└── Action Buttons
    ├── Flex: 1 (equal width)
    ├── Height: 32px
    └── Gap: 8px (between buttons)
```

---

## Testing Checklist

When verifying the branding section works correctly:

- [ ] Icon displays correctly with gradient background
- [ ] App name is visible and readable
- [ ] Workspace indicator shows company name when set
- [ ] Workspace indicator shows "No workspace" when empty
- [ ] Long company names truncate with ellipsis
- [ ] Tooltip shows full name on hover
- [ ] Account button is clickable and emits event
- [ ] Help button is clickable and emits event
- [ ] Hover states work (border/color/shadow changes)
- [ ] Click states work (scale animation)
- [ ] Sidebar items scroll independently of branding
- [ ] Branding section stays visible at bottom when scrolling
- [ ] Responsive behavior on smaller screens (if applicable)
- [ ] Dark mode compatible (if theme support added)

---

## Related Documentation

- [Architecture](02-ARCHITECTURE.md) - System design and layers
- [Data Flow](04-DATA-FLOW.md) - Business store and composables
- [Component Catalog](06-COMPONENT-CATALOG.md) - All components

---

**Last Updated**: January 28, 2026
