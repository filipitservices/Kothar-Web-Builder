# Component Catalog

**Complete reference for all components with props, usage examples, and styling patterns.**

---

## Block Components (13 Total)

### HeroBlock

**File**: [BlockElements/HeroBlock.vue](../app/components/BlockElements/HeroBlock.vue)

**Purpose**: Large hero section with headline, subtext, and CTA buttons

**Props**:
```typescript
{
  blockId: string;      // Required (not used in current implementation)
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Static content (no inline editing)
- 2-column grid layout (text + visual placeholder)
- Primary and ghost CTA buttons
- Mobile responsive (stacks to 1 column)

**Structure**:
```
┌─────────────────────────────────────┐
│ FEATURED                            │
│ Bold, clear value prop              │
│ Short supporting copy...            │
│ [Get Started] [Learn More]          │
│                      [Visual Box]   │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<HeroBlock 
  blockId="el-hero-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `2fr 1.2fr` (desktop), `1fr` (mobile)
- Padding: `16px` (desktop), `10px` (mobile)
- Eyebrow: 11px, #64748b, uppercase
- Headline: 18px/700, #334155, 2px solid border-bottom
- Subhead: 12px, #64748b, 1px dashed border-bottom
- Visual: Diagonal stripe background pattern

---

### NavBlock

**File**: [BlockElements/NavBlock.vue](../app/components/BlockElements/NavBlock.vue)

**Purpose**: Navigation bar with editable brand text and menu items

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable brand text (falls back to companyName from business store)
- Static menu items (Home, About, Services, Contact)
- Mobile responsive (stacks vertically)
- Visual feedback for customized fields

**Data Fields**:
```typescript
{
  brandText: string;  // Falls back to business.companyName or "Your Brand"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ [Your Brand]    Home About Services │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<NavBlock 
  blockId="el-navbar-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Layout: Flexbox, space-between
- Padding: `14px` (desktop), `10px` (mobile)
- Brand: 16px/700, #334155
- Menu items: 12px/600, #64748b, 14px gap
- Mobile: Column layout, left-aligned

**Editing**:
- Click brand text to edit
- Changes save on blur (click away)
- Highlighted when customized

---

### FooterBlock

**File**: [BlockElements/FooterBlock.vue](../app/components/BlockElements/FooterBlock.vue)

**Purpose**: Footer with business info, links, and copyright

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- 3-column grid (brand/links/contact)
- Editable brand text, tagline, copyright
- Displays business data (email, phone, address)
- Auto-populated current year
- Mobile responsive (stacks columns)

**Data Fields**:
```typescript
{
  brandText: string;      // Falls back to business.companyName or "Your Company"
  tagline: string;        // Default: "Quality service you can trust."
  copyrightText: string;  // Falls back to business.companyName or "Your Company"
}
```

**Business Data Used**:
- `mergedData.email`
- `mergedData.telephone`
- `mergedData.fullAddress`

**Structure**:
```
┌─────────────────────────────────────────────┐
│ [Your Company]    Quick Links    Contact    │
│ Tagline...        About          email@...  │
│                   Services       555-1234   │
│                   Contact        123 Main   │
├─────────────────────────────────────────────┤
│        © 2024 Your Company. All rights...   │
└─────────────────────────────────────────────┘
```

**Usage**:
```vue
<FooterBlock 
  blockId="el-footer-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `2fr 1fr 1fr` (desktop)
- Padding: `14px` (desktop), `10px` (mobile)
- Brand: 16px/700, #334155, 2px solid border-bottom
- Tagline: 12px, #64748b, 1px dashed border-bottom
- Headings: 11px/700, uppercase, #334155
- Links/Info: 11px, #64748b
- Bottom: 1px dashed border-top

---

### FormBlock

**File**: [BlockElements/FormBlock.vue](../app/components/BlockElements/FormBlock.vue)

**Purpose**: Contact form with editable title/subtitle/button

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title, subtitle, button text, placeholder
- Displays business email as contact destination
- Static form fields (Name, Email, Message)
- Mobile responsive

**Data Fields**:
```typescript
{
  title: string;        // Default: "Get in Touch"
  subtitle: string;     // Default: "Send us a message and we'll respond within 24 hours."
  buttonText: string;   // Default: "Send Message"
  placeholder: string;  // Default: "Message will be sent to: [email]"
}
```

**Business Data Used**:
- `mergedData.email`

**Structure**:
```
┌─────────────────────────────────────┐
│ Get in Touch                        │
│ Send us a message...                │
│ ┌─────────────────────────────────┐ │
│ │ Name                            │ │
│ ├─────────────────────────────────┤ │
│ │ Email                           │ │
│ ├─────────────────────────────────┤ │
│ │ Message                         │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ Message sent to: email@example.com  │
│ [Send Message]                      │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<FormBlock 
  blockId="el-form-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom
- Subtitle: 12px, #64748b, 1px dashed border-bottom
- Fields: White background, 1px dashed border
- Labels: 11px/700, uppercase, #334155, letter-spacing
- Button: 12px/700, #334155, 1px dashed border

---

### HeaderBlock

**File**: [BlockElements/HeaderBlock.vue](../app/components/BlockElements/HeaderBlock.vue)

**Purpose**: Section header with title and subtitle

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title and subtitle
- Simple centered layout
- Mobile responsive

**Data Fields**:
```typescript
{
  title: string;     // Default: "Section Heading"
  subtitle: string;  // Default: "Optional subtitle or description."
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│          Section Heading            │
│    Optional subtitle or description │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<HeaderBlock 
  blockId="el-header-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom, centered
- Subtitle: 12px, #64748b, 1px dashed border-bottom, centered

---

### FeaturesBlock

**File**: [BlockElements/FeaturesBlock.vue](../app/components/BlockElements/FeaturesBlock.vue)

**Purpose**: 3-column feature grid

**Props**:
```typescript
{
  blockId: string;      // Required (not used in current implementation)
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Static content (no inline editing)
- 3-column grid layout
- Icon + title + description per feature
- Mobile responsive (stacks to 1 column)

**Structure**:
```
┌─────────────────────────────────────┐
│ Three key features                  │
│ Explain why customers choose you.   │
│ ┌─────┐  ┌─────┐  ┌─────┐          │
│ │ ►   │  │ ►   │  │ ►   │          │
│ │ F1  │  │ F2  │  │ F3  │          │
│ │ ... │  │ ... │  │ ... │          │
│ └─────┘  └─────┘  └─────┘          │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<FeaturesBlock 
  blockId="el-features-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `repeat(3, 1fr)` (desktop), `1fr` (mobile)
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom
- Subtitle: 12px, #64748b, 1px dashed border-bottom
- Feature items: White background, 1px dashed border, 10px padding
- Icon: 14px, #1e3a8a (blue)
- Feature title: 12px/700, #334155
- Feature text: 11px, #64748b

---

### TestimonialBlock

**File**: [BlockElements/TestimonialBlock.vue](../app/components/BlockElements/TestimonialBlock.vue)

**Purpose**: Customer testimonial with quote and attribution

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable testimonial text and client name
- 5-star rating display
- Left blue border accent
- Center-aligned text
- Falls back to companyName for attribution

**Data Fields**:
```typescript
{
  testimonial: string;  // Default: "Customer quote goes here. Share a specific benefit or result."
  clientName: string;   // Falls back to business.companyName or "Client Name, Company"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ ★★★★★                               │
│ "Customer quote goes here..."       │
│ — Client Name, Company              │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<TestimonialBlock 
  blockId="el-testimonial-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Left border: 4px solid #1e3a8a (blue)
- Stars: 14px, #fbbf24 (yellow)
- Text: 12px, #334155, italic, 1px dashed border-bottom
- Author: 11px/600, #64748b
- Center-aligned

---

### CtaBlock

**File**: [BlockElements/CtaBlock.vue](../app/components/BlockElements/CtaBlock.vue)

**Purpose**: Call-to-action buttons row

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title and button text
- 2-button layout (Primary + Secondary)
- Center-aligned
- Mobile responsive

**Data Fields**:
```typescript
{
  title: string;           // Default: "Ready to get started?"
  primaryButton: string;   // Default: "Get Started"
  secondaryButton: string; // Default: "Learn More"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│      Ready to get started?          │
│   [Get Started] [Learn More]        │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<CtaBlock 
  blockId="el-cta-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom, centered
- Buttons: 12px/700, 1px dashed border, 8px gap
- Center-aligned

---

### FaqBlock

**File**: [BlockElements/FaqBlock.vue](../app/components/BlockElements/FaqBlock.vue)

**Purpose**: FAQ question and answer list

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title
- Static Q&A items (3 questions)
- Mobile responsive

**Data Fields**:
```typescript
{
  title: string;  // Default: "Frequently Asked Questions"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ Frequently Asked Questions          │
│ ┌─────────────────────────────────┐ │
│ │ Q: Question one?                │ │
│ │ A: Answer to question one...    │ │
│ ├─────────────────────────────────┤ │
│ │ Q: Question two?                │ │
│ │ A: Answer to question two...    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<FaqBlock 
  blockId="el-faq-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom
- FAQ items: White background, 1px dashed border, 10px padding
- Question: 12px/700, #334155
- Answer: 11px, #64748b

---

### PricingBlock

**File**: [BlockElements/PricingBlock.vue](../app/components/BlockElements/PricingBlock.vue)

**Purpose**: Pricing table with 3 tiers

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title and subtitle
- 3 pricing tiers (Basic, Pro, Enterprise)
- Static prices and features
- Mobile responsive (stacks columns)

**Data Fields**:
```typescript
{
  title: string;     // Default: "Simple, Transparent Pricing"
  subtitle: string;  // Default: "Choose the plan that fits your needs."
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ Simple, Transparent Pricing         │
│ Choose the plan that fits...        │
│ ┌─────┐  ┌─────┐  ┌─────┐          │
│ │Basic│  │ Pro │  │Enter│          │
│ │ $X  │  │ $X  │  │ $X  │          │
│ │ ✓...│  │ ✓...│  │ ✓...│          │
│ └─────┘  └─────┘  └─────┘          │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<PricingBlock 
  blockId="el-pricing-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `repeat(3, 1fr)` (desktop), `1fr` (mobile)
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom, centered
- Subtitle: 12px, #64748b, 1px dashed border-bottom, centered
- Pricing cards: White background, 1px dashed border, 10px padding
- Price: 18px/700, #334155
- Features: 11px, #64748b, checkmark bullets

---

### StatsBlock

**File**: [BlockElements/StatsBlock.vue](../app/components/BlockElements/StatsBlock.vue)

**Purpose**: 3-stat counter display

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title
- 3 static stat items (number + label)
- Mobile responsive (stacks to column)

**Data Fields**:
```typescript
{
  title: string;  // Default: "By the Numbers"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ By the Numbers                      │
│   10K+        500+        99%       │
│ Customers    Projects   Satisfaction│
└─────────────────────────────────────┘
```

**Usage**:
```vue
<StatsBlock 
  blockId="el-stats-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `repeat(3, 1fr)` (desktop), `1fr` (mobile)
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom, centered
- Stat number: 18px/700, #1e3a8a (blue)
- Stat label: 11px, #64748b
- Center-aligned items

---

### GalleryBlock

**File**: [BlockElements/GalleryBlock.vue](../app/components/BlockElements/GalleryBlock.vue)

**Purpose**: Image grid placeholder

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title
- 4-image grid (placeholders with diagonal stripes)
- Mobile responsive (2-column grid)

**Data Fields**:
```typescript
{
  title: string;  // Default: "Gallery"
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ Gallery                             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ //// │ │ //// │ │ //// │ │ //// │    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<GalleryBlock 
  blockId="el-gallery-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Grid: `repeat(4, 1fr)` (desktop), `repeat(2, 1fr)` (mobile)
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom
- Images: 80px height, diagonal stripe pattern, 1px dashed border

---

### TextBlock

**File**: [BlockElements/TextBlock.vue](../app/components/BlockElements/TextBlock.vue)

**Purpose**: Free-form text content section

**Props**:
```typescript
{
  blockId: string;      // Required
  screenType?: string;  // 'desktop' | 'mobile' (default: 'desktop')
}
```

**Features**:
- Editable title and content
- Simple text layout
- Mobile responsive

**Data Fields**:
```typescript
{
  title: string;    // Default: "Text Section Heading"
  content: string;  // Default: "Add any paragraph or formatted text content here."
}
```

**Structure**:
```
┌─────────────────────────────────────┐
│ Text Section Heading                │
│ Add any paragraph or formatted      │
│ text content here.                  │
└─────────────────────────────────────┘
```

**Usage**:
```vue
<TextBlock 
  blockId="el-text-123" 
  screenType="desktop" 
/>
```

**Styling**:
- Padding: `14px` (desktop), `10px` (mobile)
- Title: 16px/700, #334155, 2px solid border-bottom
- Content: 11px, #64748b

---

## Sites Page Components

### SitesWelcomeHeader

**File**: [components/sites/SitesWelcomeHeader.vue](../app/components/sites/SitesWelcomeHeader.vue)

**Purpose**: My Sites page header with title, subtitle, and Gallery CTA

**Features**:
- Page title "My Sites" and descriptive subtitle
- "Discover layout templates" CTA linking to `/gallery`
- Uses design tokens only

**Usage**:
```vue
<SitesWelcomeHeader />
```

---

### SitesTabList

**File**: [components/sites/SitesTabList.vue](../app/components/sites/SitesTabList.vue)

**Purpose**: Tab list for switching between Live Sites and Orders panels

**Props**:
```typescript
{
  modelValue: 'sites' | 'orders';
  sitesCount: number;
  ordersCount: number;
}
```

**Emits**: `update:modelValue`

**Features**:
- `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Keyboard navigation (arrow keys)
- Badge counts for sites and orders

---

### SitesLiveSitesPanel

**File**: [components/sites/SitesLiveSitesPanel.vue](../app/components/sites/SitesLiveSitesPanel.vue)

**Purpose**: Panel listing delivered (live) websites

**Props**:
```typescript
{
  sites: SiteSummary[];
  visible: boolean;
  panelId?: string;
  labelledBy?: string;
  getStatusLabel: (status: string) => string;
  formatLastUpdated: (isoDate: string) => string;
}
```

**Features**:
- Table: Business, Domain, Last update, Status, Manage action
- SitesEmptyState when no sites

---

### SitesOrdersPanel

**File**: [components/sites/SitesOrdersPanel.vue](../app/components/sites/SitesOrdersPanel.vue)

**Purpose**: Panel listing template request orders

**Props**:
```typescript
{
  orders: OrderWithId[];
  visible: boolean;
  panelId?: string;
  labelledBy?: string;
  getOrderStatusLabel: (status: string) => string;
  getOrderStatusClass: (status: string) => string;
  formatOrderDate: (createdAt: unknown) => string;
}
```

**Emits**:
```typescript
{
  'delete-draft': [order: OrderWithId];
}
```

**Features**:
- Table: Template, Submitted, Status, Editing, **Actions** (**Modify** + compact trash icon for deletable `draft` rows; fixed-width slot keeps rows aligned)
- Locked orders show "—" instead of actions
- SitesEmptyState when no orders
- **Delete** is presentational only; parent (`pages/sites/index.vue`) confirms via **`DeleteDraftRequestModal`** and **`deleteDraftRequest()`**

---

### SitesEmptyState

**File**: [components/sites/SitesEmptyState.vue](../app/components/sites/SitesEmptyState.vue)

**Purpose**: Context-aware empty state for Live Sites or Orders panel

**Props**:
```typescript
{
  context: 'sites' | 'orders';
  message?: string;
  showCta?: boolean;
  live?: boolean;
}
```

**Features**:
- Default messages per context
- Orders context: "Browse templates" CTA to Gallery

---

## UI Components

### ItemsList

**File**: [components/ItemsList.vue](../app/components/ItemsList.vue)

**Purpose**: Draggable block list renderer

**Props**:
```typescript
{
  listId: string;              // 'desktopList' or 'mobileList'
  list: Array<Element>;        // Array of block elements
  screenType: string;          // 'desktop' or 'mobile'
  drawingEnabled?: boolean;    // Drawing mode flag
}
```

**Emits**:
```typescript
{
  'update:list': (newList: Array<Element>) => void
}
```

**Features**:
- Drag and drop reordering
- Dynamic component rendering based on block type
- Passes `blockId` and `screenType` to child blocks
- Draggable handle visual
- Drawing overlay integration

**Usage**:
```vue
<ItemsList
  listId="desktopList"
  :list="desktopElements"
  screenType="desktop"
  :drawingEnabled="false"
  @update:list="desktopElements = $event"
/>
```

**Component Map**:
Maps `element.type` to component:
```javascript
{
  hero: HeroBlock,
  navbar: NavBlock,
  header: HeaderBlock,
  footer: FooterBlock,
  cta: CtaBlock,
  features: FeaturesBlock,
  testimonial: TestimonialBlock,
  faq: FaqBlock,
  pricing: PricingBlock,
  form: FormBlock,
  stats: StatsBlock,
  gallery: GalleryBlock,
  text: TextBlock
}
```

---

### ScreenCard

**File**: [components/ScreenCard.vue](../app/components/ScreenCard.vue)

**Purpose**: Preview card container for desktop/mobile screens

**Props**:
```typescript
{
  title: string;          // "Desktop" or "Mobile"
  listId: string;         // 'desktopList' or 'mobileList'
  list: Array<Element>;   // Block elements
  screenType: string;     // 'desktop' or 'mobile'
}
```

**Emits**:
```typescript
{
  'update:list': (newList: Array<Element>) => void,
  'toggle-drawing': () => void,
  'clear-drawing': () => void,
  'undo-drawing': () => void
}
```

**Features**:
- Screen header with title
- Drawing controls integration
- ItemsList container
- Drawing overlay per screen

**Usage**:
```vue
<ScreenCard
  title="Desktop"
  listId="desktopList"
  :list="desktopElements"
  screenType="desktop"
  @update:list="desktopElements = $event"
  @toggle-drawing="toggleDrawing"
/>
```

---

### ScreenHeader

**File**: [components/ScreenHeader.vue](../app/components/ScreenHeader.vue)

**Purpose**: Header bar for screen cards

**Props**:
```typescript
{
  title: string;  // Screen name
}
```

**Emits**: None

**Features**:
- Fixed height title bar
- Consistent styling

**Usage**:
```vue
<ScreenHeader title="Desktop" />
```

---

### DrawingOverlay

**File**: [components/DrawingOverlay.vue](../app/components/DrawingOverlay.vue)

**Purpose**: Canvas drawing layer over screen

**Props**:
```typescript
{
  screenId: string;  // Unique identifier for canvas
}
```

**Emits**:
```typescript
{
  'clear': () => void,
  'undo': () => void
}
```

**Features**:
- Vue drawing canvas integration
- Tool controls (pen, eraser, line, etc.)
- Color and width controls
- Clear and undo actions

**Usage**:
```vue
<DrawingOverlay
  screenId="desktop"
  @clear="clearCanvas"
  @undo="undoLastStroke"
/>
```

---

### DrawingControlsPanel

**File**: [components/DrawingControlsPanel.vue](../app/components/DrawingControlsPanel.vue)

**Note:** There is no `DrawingDashboard` component; the canonical name is `DrawingControlsPanel`.

**Purpose**: Drawing toolbar with tool selection (Desktop/Mobile mode, sync, stroke controls)

**Position**: At top of ScreensPanel, under the "Editing page layout" bar when in request mode.

**Props**: `desktopDrawingState`, `mobileDrawingState`, `syncScreens`

**Emits**: `update:desktop-drawing-state`, `update:mobile-drawing-state`, `update:sync-screens`, `undo`, `redo`, `clear`

**Features**:
- Drawing mode toggle
- Tool selection (pen, eraser, shapes)
- Color picker
- Stroke width slider
- Clear and undo buttons

**Usage**:
```vue
<DrawingControlsPanel
  @toggle-drawing="toggleDrawing"
  @clear-drawing="clearCanvas"
  @undo-drawing="undoStroke"
/>
```

---

### DrawingToolControls

**File**: [components/DrawingToolControls.vue](../app/components/DrawingToolControls.vue)

**Purpose**: Inline drawing controls (simplified version)

**Props**: None

**Emits**:
```typescript
{
  'toggle': () => void,
  'clear': () => void,
  'undo': () => void
}
```

**Features**:
- Toggle, clear, undo buttons
- Compact inline layout

**Usage**:
```vue
<DrawingToolControls
  @toggle="toggleDrawing"
  @clear="clearCanvas"
  @undo="undoStroke"
/>
```

---

### ScreensPanel

**File**: [components/ScreensPanel.vue](../app/components/ScreensPanel.vue)

**Purpose**: Container for desktop and mobile screen cards

**Props**:
```typescript
{
  desktopList: Array<Element>;
  mobileList: Array<Element>;
}
```

**Emits**:
```typescript
{
  'update:desktopList': (newList: Array<Element>) => void,
  'update:mobileList': (newList: Array<Element>) => void
}
```

**Features**:
- 2-column layout for desktop/mobile cards
- Responsive scaling

**Usage**:
```vue
<ScreensPanel
  :desktopList="desktopElements"
  :mobileList="mobileElements"
  @update:desktopList="desktopElements = $event"
  @update:mobileList="mobileElements = $event"
/>
```

---

### InfoBar

**File**: [components/InfoBar.vue](../app/components/InfoBar.vue)

**Purpose**: Top info banner with business data display

**Props**: None

**Features**:
- Displays business store data
- Editable fields (inline contenteditable)
- Auto-save on blur

**Usage**:
```vue
<InfoBar />
```

---

### DualSwitch

**File**: [components/DualSwitch.vue](../app/components/DualSwitch.vue)

**Purpose**: Toggle switch component

**Props**:
```typescript
{
  modelValue: boolean;
  label?: string;
}
```

**Emits**:
```typescript
{
  'update:modelValue': (value: boolean) => void
}
```

**Usage**:
```vue
<DualSwitch
  v-model="isEnabled"
  label="Enable feature"
/>
```

---

## Common Props Pattern

All block components follow this prop pattern:

```typescript
{
  blockId: string;      // Required: Unique block identifier
  screenType?: string;  // Optional: 'desktop' | 'mobile' (default: 'desktop')
}
```

**Why?**
- `blockId` enables per-instance customization via `useBlockData()`
- `screenType` enables responsive styling via `.mobile-layout` class

---

## Common Editing Pattern

Editable blocks use this pattern:

```vue
<template>
  <div
    class="field editable"
    :class="{ 'has-local-value': isLocalValue('fieldName') }"
    @blur="updateField"
    @keydown.enter.prevent="$event.target.blur()"
    contenteditable="true"
  >
    {{ blockData.fieldName }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useBlockData } from '~/composables/useBlockData';

const props = defineProps({
  blockId: { type: String, required: true },
  screenType: { type: String, default: 'desktop' }
});

const { getField, setField, isLocalValue } = useBlockData(props.blockId);

const blockData = computed(() => ({
  fieldName: getField('fieldName') ?? 'Default Value'
}));

const updateField = (e) => {
  const newValue = e.target.textContent?.trim() || '';
  const currentValue = getField('fieldName') || '';
  if (newValue !== currentValue) {
    setField('fieldName', newValue);
  }
};
</script>

<style scoped>
.editable {
  padding: 2px 4px;
  margin: -2px -4px;
  border-radius: 3px;
  cursor: text;
  transition: all 0.15s ease;
  outline: none;
}

.editable:hover {
  background: rgba(30, 58, 138, 0.03);
}

.editable:focus {
  background: rgba(30, 58, 138, 0.08);
  outline: 1px solid rgba(30, 58, 138, 0.2);
}

.editable.has-local-value {
  font-weight: 600;
}
</style>
```

---

**Navigation**: [Back to Overview](01-OVERVIEW.md) | [API Reference](05-API-REFERENCE.md)
