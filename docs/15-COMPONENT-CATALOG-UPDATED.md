# Component Catalog - Updated

**Complete reference for all block components (18 total) with props, usage examples, and styling patterns.**

**Last Updated**: January 29, 2026 - SMB Refinement

---

## Navigation & Structure Blocks

### NavBlock
**File**: [BlockElements/NavBlock.vue](../app/components/BlockElements/NavBlock.vue)

**Purpose**: Navigation bar with branding

**Props**:
```typescript
{
  blockId: string;
  screenType?: string;
}
```

**Features**:
- Brand text auto-populated from business data
- Static menu items (Home, About, Services, Contact)
- Mobile responsive layout

---

### HeroBlock
**File**: [BlockElements/HeroBlock.vue](../app/components/BlockElements/HeroBlock.vue)

**Purpose**: Large hero section with headline and CTAs

**Editable Fields**:
- Eyebrow text
- Headline
- Subheadline
- Primary CTA button text
- Secondary CTA button text

**Features**:
- 2-column grid layout (text + visual)
- Mobile responsive (stacks to 1 column)

---

### FooterBlock
**File**: [BlockElements/FooterBlock.vue](../app/components/BlockElements/FooterBlock.vue)

**Purpose**: Footer with business info and copyright

**Editable Fields**:
- Tagline
- Copyright text (auto-includes current year)

**Business Data Used**:
- Company name (brand)
- Email
- Phone
- Address
- Business hours

**Features**:
- 2-column layout (brand info + contact)
- Auto-populated contact details

---

## Service & Offering Blocks

### ServicesBlock ⭐ NEW
**File**: [BlockElements/ServicesBlock.vue](../app/components/BlockElements/ServicesBlock.vue)

**Purpose**: Showcase business services/offerings with pricing

**Editable Fields**:
- Block title
- Block subtitle
- Per service: name, description, price

**Features**:
- Add/remove services dynamically
- Grid layout (responsive)
- Price display per service
- Icon placeholders

**Use Cases**: Service businesses, contractors, professional services

---

### FeaturesBlock
**File**: [BlockElements/FeaturesBlock.vue](../app/components/BlockElements/FeaturesBlock.vue)

**Purpose**: Highlight key features or benefits (3-column grid)

**Editable Fields**:
- Block title
- Block subtitle
- Per feature: title, text

**Features**:
- Add/remove features
- 3-column grid (desktop), 1-column (mobile)
- Icons per feature

---

### PricingBlock 🔄 REDESIGNED
**File**: [BlockElements/PricingBlock.vue](../app/components/BlockElements/PricingBlock.vue)

**Purpose**: Flexible pricing plans display

**Editable Fields**:
- Block title
- Block subtitle
- Per plan: name, price, description, features (multi-line), CTA text

**Features**:
- Add/remove plans (not limited to 2)
- Card-based layout (better than old table)
- Responsive grid
- Multi-line feature lists

**Before/After**: Replaced rigid 2-plan table with flexible card system

---

## Team & Credibility Blocks

### TeamBlock ⭐ NEW
**File**: [BlockElements/TeamBlock.vue](../app/components/BlockElements/TeamBlock.vue)

**Purpose**: Display team members and staff

**Editable Fields**:
- Block title
- Block subtitle
- Per member: name, role, bio

**Features**:
- Add/remove team members
- Circular photo placeholders
- Grid layout
- Text-centered design

**Use Cases**: Professional services, agencies, healthcare practices

---

### CredentialsBlock ⭐ NEW
**File**: [BlockElements/CredentialsBlock.vue](../app/components/BlockElements/CredentialsBlock.vue)

**Purpose**: Showcase certifications, licenses, and awards

**Editable Fields**:
- Block title
- Block subtitle
- Per credential: name, issuing organization

**Features**:
- Add/remove credentials
- Badge icon per credential
- Grid layout

**Use Cases**: Professional services, contractors, healthcare

---

### TestimonialBlock
**File**: [BlockElements/TestimonialBlock.vue](../app/components/BlockElements/TestimonialBlock.vue)

**Purpose**: Single customer testimonial with star rating

**Editable Fields**:
- Testimonial quote

**Business Data Used**:
- Company name (as client attribution)

**Features**:
- 5-star visual rating
- Quote styling
- Border-left accent

---

### LogosBlock ⭐ NEW
**File**: [BlockElements/LogosBlock.vue](../app/components/BlockElements/LogosBlock.vue)

**Purpose**: Display client logos, partners, or trust signals

**Editable Fields**:
- Block title
- Block subtitle
- Per logo: company name

**Features**:
- Add/remove logos
- Grid layout (auto-fit)
- Logo placeholders

**Use Cases**: B2B services, agencies, consultants

---

### StatsBlock
**File**: [BlockElements/StatsBlock.vue](../app/components/BlockElements/StatsBlock.vue)

**Purpose**: Display key statistics or metrics

**Editable Fields**:
- Per stat (3 total): number, label

**Features**:
- 3-column grid (desktop), 1-column (mobile)
- Large number display

---

## Content & Information Blocks

### TextBlock
**File**: [BlockElements/TextBlock.vue](../app/components/BlockElements/TextBlock.vue)

**Purpose**: General text content section

**Editable Fields**:
- Title
- Content paragraph

**Features**:
- Simple title + paragraph layout
- For general information, about sections, etc.

---

### GalleryBlock 🔄 ENHANCED
**File**: [BlockElements/GalleryBlock.vue](../app/components/BlockElements/GalleryBlock.vue)

**Purpose**: Image gallery for portfolios and showcases

**Editable Fields**:
- Block title
- Block subtitle
- Per item: caption

**Features**:
- Add/remove items dynamically (no longer fixed at 4)
- Editable captions per image
- Responsive grid (auto-fill)
- 4:3 aspect ratio placeholders

**Before/After**: Changed from static 4-image grid to dynamic gallery

---

### FaqBlock
**File**: [BlockElements/FaqBlock.vue](../app/components/BlockElements/FaqBlock.vue)

**Purpose**: Frequently Asked Questions section

**Editable Fields**:
- Block title
- Per FAQ: question, answer

**Features**:
- Add/remove FAQ items
- Q&A card layout

---

### ProcessBlock ⭐ NEW
**File**: [BlockElements/ProcessBlock.vue](../app/components/BlockElements/ProcessBlock.vue)

**Purpose**: "How It Works" / service process flow

**Editable Fields**:
- Block title
- Block subtitle
- Per step: title, description

**Features**:
- Add/remove steps
- Numbered step indicators
- Arrow connectors between steps
- Horizontal flow (desktop), vertical (mobile)

**Use Cases**: Service businesses, consultants, agencies

---

### LocationBlock ⭐ NEW
**File**: [BlockElements/LocationBlock.vue](../app/components/BlockElements/LocationBlock.vue)

**Purpose**: Physical location, hours, and contact information

**Editable Fields**:
- Block title
- Custom note

**Business Data Used** (auto-populated):
- Full address
- Phone
- Email
- Business hours

**Features**:
- 2-column layout (info + map placeholder)
- Map icon placeholder
- Organized info sections

**Use Cases**: Local businesses, retail, healthcare

---

## Conversion & Action Blocks

### CtaBlock
**File**: [BlockElements/CtaBlock.vue](../app/components/BlockElements/CtaBlock.vue)

**Purpose**: Call-to-action with button

**Editable Fields**:
- Title
- Subtitle
- Button text

**Features**:
- Horizontal layout (desktop), vertical (mobile)
- Prominent button styling

---

### FormBlock
**File**: [BlockElements/FormBlock.vue](../app/components/BlockElements/FormBlock.vue)

**Purpose**: Contact form

**Editable Fields**:
- Form title
- Subtitle
- Field labels (Name, Email, Message)
- Button text

**Business Data Used**:
- Email (shows "Send to: [email]")

**Features**:
- Static form fields (visual only)
- Responsive 2-column to 1-column layout

---

## Block Summary

**Total Blocks**: 18

### By Category:
- **Navigation & Structure**: 3 (Nav, Hero, Footer)
- **Service & Offering**: 3 (Services, Features, Pricing)
- **Team & Credibility**: 5 (Team, Credentials, Testimonial, Logos, Stats)
- **Content & Information**: 5 (Text, Gallery, FAQ, Process, Location)
- **Conversion & Action**: 2 (CTA, Form)

### New Blocks (6):
- ServicesBlock ⭐
- TeamBlock ⭐
- CredentialsBlock ⭐
- ProcessBlock ⭐
- LogosBlock ⭐
- LocationBlock ⭐

### Redesigned Blocks (2):
- PricingBlock 🔄
- GalleryBlock 🔄

### Removed Blocks (1):
- HeaderBlock ❌ (redundant with Hero and Text blocks)

---

## Design System Reference

### Typography Scale
- **Block Title**: 16px/700 (desktop), 14px (mobile)
- **Block Subtitle**: 12px (desktop), 11px (mobile)
- **Item Title**: 12-13px/700
- **Item Text**: 11px
- **Labels**: 10-11px/700, uppercase, letter-spacing

### Color Palette
- **Primary Text**: #334155
- **Secondary Text**: #64748b
- **Accent**: #1e3a8a
- **Borders**: #e2e8f0 (solid), #cbd5e1 (dashed)
- **Background**: #f8fafc (block), #ffffff (cards)

### Spacing
- **Block Padding**: 14px (desktop), 10px (mobile)
- **Card Padding**: 10-12px
- **Grid Gap**: 10-12px

### Borders
- **Title Bottom**: 2px solid #e2e8f0
- **Subtitle Bottom**: 1px dashed #e2e8f0
- **Card Border**: 1px dashed #cbd5e1

### Responsive Breakpoints
All blocks use `.mobile-layout` class applied when `screenType === 'mobile'`

---

## Common Patterns

### Editable Content
All editable fields use:
- `contenteditable="true"`
- `@blur` event for saving
- `@keydown.enter.prevent` to trigger blur on Enter
- `.editable` class for hover/focus states
- `.has-local-value` class for customized values (bold)

### Add/Remove Functionality
Dynamic blocks (Features, Services, FAQ, etc.) follow pattern:
- `addItem()` function adds to array
- `removeItem(index)` removes from array
- Delete button (×) in top-right of items
- "Add" button below grid
- Minimum item count enforced (typically 1-2)

### Data Flow
All blocks use `useBlockData(blockId)` composable:
```typescript
const { getField, setField, isLocalValue, mergedData } = useBlockData(props.blockId);
```

---

**For implementation examples and data flow details, see:**
- [03-BLOCK-SYSTEM.md](03-BLOCK-SYSTEM.md) - Block lifecycle and patterns
- [04-DATA-FLOW.md](04-DATA-FLOW.md) - State management details
- [14-SMB-REFINEMENT-SUMMARY.md](14-SMB-REFINEMENT-SUMMARY.md) - Recent changes

---

## Template Request Form Components

### TemplateRequestForm
**File**: [TemplateRequestForm.vue](../app/components/TemplateRequestForm.vue)

**Purpose**: Shared form component for both request editing pages (`/gallery/request/[id]` and `/orders/[id]/edit`)

**Section structure** (6 sections):
1. **Design Customization** — `ColorSchemePicker` (unchanged)
2. **Branding** — Logos subsection (`FileUploadArea` for images) + Branding Material subsection (`FileUploadArea` for all formats + existing attachments list)
3. **Business Info** — Business name, Preferred URL (with availability disclaimer), Location (`LocationInput` with Photon verification), Industry (`IndustryCardGrid` with "Other" custom input)
4. **Contact** — Contact name, Email, Phone, Website (via `IconInput`)
5. **Website Goals** — `GoalSelector` (max 3) + `TagInput` for audience tags
6. **Additional Requests** — Freeform textarea + `RequestCategorySelector`

**Composables**: `useTemplateRequestForm` (state, progress), `useTemplateRequestValidation` (field validators)

---

### LocationInput
**File**: [form/LocationInput.vue](../app/components/form/LocationInput.vue)

**Purpose**: Text input with Photon geocoding autocomplete for business location

**Props**: `modelValue: LocationData`, `inputId?`, `placeholder?`, `readOnly?`
**Emits**: `update:modelValue`, `blur`

**Features**:
- Debounced search against Photon API (300ms, max 5 results)
- Keyboard navigation (arrow keys, enter, escape)
- Verified badge when a suggestion is selected
- Graceful degradation when API is unreachable (`verified: false`)
- On the template request form, non-empty text without a selected suggestion fails validation (see `useTemplateRequestValidation`)

---

### TagInput
**File**: [form/TagInput.vue](../app/components/form/TagInput.vue)

**Purpose**: Flexible tag input with autocomplete suggestions

**Props**: `modelValue: string[]`, `suggestions?: string[]`, `placeholder?`, `maxTags?`, `readOnly?`
**Emits**: `update:modelValue`

**Features**:
- Free-text entry (comma or Enter to add)
- Autocomplete suggestions (not restrictive — custom entries always allowed)
- Removable chips with Backspace support
- Duplicate prevention (case-insensitive)

---

### RequestCategorySelector
**File**: [form/RequestCategorySelector.vue](../app/components/form/RequestCategorySelector.vue)

**Purpose**: Card-style multi-select for request categories

**Props**: `modelValue: string[]`, `categories?`, `readOnly?`
**Emits**: `update:modelValue`

**Features**:
- Each category has an SVG icon + label
- Uses `.form-option` / `.form-option--selected` patterns; selected chrome is themed by parent **`FormSection`** (`variant="requests"`), not the user color palette
- No max limit (unlike GoalSelector)

---

### GoalSelector (updated)
**File**: [form/GoalSelector.vue](../app/components/form/GoalSelector.vue)

**Props**: `goals`, `modelValue`, `readOnly?`, `maxSelection?` (3 on the request form)
- Disables unselected cards when limit is reached
- Shows "X / 3 selected" hint text
- Selected-card wash/border: parent **`FormSection`** (`variant="target"`), not user palette colors

---

### IndustryCardGrid (updated)
**File**: [form/IndustryCardGrid.vue](../app/components/form/IndustryCardGrid.vue)

**Props**: `modelValue`, `customValue?`, `customValueError?`, `options?`, `name?`, `label?`, `readOnly?` — selected-card styling comes from parent **`FormSection`** (`variant="business"`).

**Emits**: `update:modelValue`, `update:customValue`, `customBlur`
- Shows a text input below the grid when "Other" is selected
- Custom input validated at form level (rejects nonsense via blocklist)
