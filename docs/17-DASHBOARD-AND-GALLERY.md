# Dashboard & Template Gallery System

> **Document Version:** 1.1
> **Last Updated:** February 2025
> **Status:** Production

## Overview

This document describes the multi-space architecture introduced to SOSG, featuring a central dashboard as the authenticated entry point and a separate template gallery system for SMB onboarding.

**Key Principle:** The Gallery system is **completely separate** from the Website Builder's block/template system. They serve different purposes:

| System | Purpose | Data Source | User Flow |
|--------|---------|-------------|-----------|
| **Builder Templates** | Starting points for DIY website building | `stores/templates.ts` | Select → Edit blocks in canvas |
| **Gallery Showcase** | Professional designs for managed services | `stores/showcase.ts` | Browse → Preview → Request consultation |

---

## Architecture

### Navigation Flow

```
Landing (/) 
    │
    ├── Guest: "Get Started" → /login
    │
    └── Authenticated: "Dashboard" → /dashboard
                                        │
                                        ├── /builder (DIY website builder)
                                        │
                                        └── /gallery (template showcase)
                                                │
                                                └── /gallery/request/[id] (request form)
```

### Route Protection

All authenticated routes use the `auth` middleware:

- `/dashboard` - Central hub after login
- `/builder` - Website builder (existing)
- `/gallery` - Template gallery showcase
- `/gallery/request/[id]` - Template request form

---

## Dashboard (`/dashboard`)

**File:** `app/pages/dashboard.vue`  
**CSS:** `app/assets/css/dashboard.css`

The dashboard serves as the authenticated entry point, replacing direct navigation to `/builder` after login.

### Features

- Welcome message with user's name
- Space cards for different product areas:
  - **Website Builder** - DIY block-based builder
  - **Template Gallery** - Browse professional designs
- Consistent header with UserMenu
- Protected via `auth` middleware

### Space Card Structure

```vue
<div class="space-card">
  <div class="space-icon">{{ icon }}</div>
  <h2 class="space-title">{{ title }}</h2>
  <p class="space-description">{{ description }}</p>
  <NuxtLink :to="path" class="space-cta">{{ ctaText }}</NuxtLink>
</div>
```

---

## Template Gallery (`/gallery`)

**File:** `app/pages/gallery/index.vue`  
**CSS:** `app/assets/css/gallery.css`

The gallery showcases professional, fully-designed website templates for SMB customers who prefer managed services over DIY building.

### Features

- Category filtering (All, Local Services, Professional, etc.)
- Grid of template cards with preview thumbnails
- Click to open full preview modal
- Distinct visual treatment from builder templates

### Categories

```typescript
type ShowcaseCategory = 
  | 'local-services'   // Plumbers, electricians, etc.
  | 'professional'     // Law firms, consultants
  | 'creative'         // Photographers, designers
  | 'healthcare'       // Clinics, therapists
  | 'hospitality'      // Restaurants, cafes
  | 'retail';          // Shops, boutiques
```

---

## Showcase Store (`stores/showcase.ts`)

**IMPORTANT:** This is a completely separate store from `stores/templates.ts`. The showcase store contains full professional website designs, not builder blocks.

### Interface

```typescript
interface ShowcaseSection {
  type: 'hero' | 'services' | 'about' | 'testimonials' | 
        'gallery' | 'contact' | 'cta' | 'faq' | 'pricing' | 'team';
  headline?: string;
  subheadline?: string;
  content?: string;
  items?: Array<{ title: string; description?: string; icon?: string }>;
  cta?: { text: string; action: string };
}

interface ShowcaseTemplate {
  id: string;
  name: string;
  industry: string;
  category: ShowcaseCategory;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  sections: ShowcaseSection[];
  thumbnail?: string;
}
```

### Available Templates

1. **Pristine Plumbing** - Local services (plumbing)
2. **Spark Electric** - Local services (electrical)
3. **Summit Law Group** - Professional (legal)
4. **Clarity Consulting** - Professional (business consulting)
5. **Lens & Light Studio** - Creative (photography)
6. **Design Forward** - Creative (interior design)
7. **Wellness Center** - Healthcare (medical practice)
8. **Mindful Therapy** - Healthcare (mental health)
9. **Coastal Bistro** - Hospitality (restaurant)
10. **The Rustic Table** - Hospitality (farm-to-table)

---

## ShowcaseModal Component

**File:** `app/components/ShowcaseModal.vue`

Modal overlay for previewing complete showcase templates with device simulation.

### Features

- Desktop/Mobile toggle (reuses ScreenCard styling concepts)
- Full-height scrollable preview
- Template info sidebar
- "Choose This Design" CTA → navigates to request form
- Close on backdrop click or button

### Device Frames

Desktop frame dimensions: `700px × auto` (scrollable)  
Mobile frame dimensions: `330px × 600px`

Frame styling matches existing ScreenCard component for visual consistency.

---

## ShowcaseRenderer Component

**File:** `app/components/ShowcaseRenderer.vue`

Renders all sections of a showcase template. Used in both the preview modal and the request form preview.

### Supported Section Types

| Type | Description |
|------|-------------|
| `hero` | Full-width hero with headline, subheadline, CTA |
| `services` | Grid of service cards with icons |
| `about` | About section with content text |
| `testimonials` | Customer testimonials cards |
| `gallery` | Photo gallery placeholder |
| `contact` | Contact information section |
| `cta` | Call-to-action banner |
| `faq` | FAQ accordion items |
| `pricing` | Pricing tier cards |
| `team` | Team member profiles |

### Props

```typescript
interface Props {
  template: ShowcaseTemplate;
  viewMode?: 'desktop' | 'mobile';
}
```

---

## Template Request Form (`/gallery/request/[id]`)

**Page:** `app/pages/gallery/request/[id].vue`
**Form Component:** `app/components/TemplateRequestForm.vue`
**CSS:** `app/assets/css/request-form.css`

SMB onboarding form for requesting a website based on a selected showcase template. The form logic is extracted into a reusable `TemplateRequestForm` component.

### Architecture

The page consists of two main pieces:

1. **Page (`[id].vue`)** - Handles routing, template fetching, preview rendering, and progress display
2. **Form Component (`TemplateRequestForm.vue`)** - Contains all form logic, validation, color customization, and file uploads

This separation enables:
- Clean separation of concerns (page layout vs. form logic)
- Potential reuse of the form component
- Easier testing and maintenance

### Data Flow

```
TemplateRequestForm
    │
    ├── @color-change ──────► [id].vue updates previewTemplate ──► ShowcaseRenderer re-renders
    │
    ├── @progress-update ───► [id].vue updates progress bar in left column
    │
    └── @submit ────────────► [id].vue handles API submission
```

### Left Column Layout

The left column contains (in order):

1. **Welcome Message** - Personalized greeting using authenticated user's name
   - Uses first name from `displayName` or email prefix as fallback
   - Example: "Great choice, John!"

2. **Preview Card**
   - Live preview label
   - **Scaled Desktop Viewport** - CSS transform-scaled preview simulating a 1280x800 desktop viewport
   - Template info (industry, name, description)
   - **Navigation Links:**
     - "Choose a different design →" (primary link to gallery)
     - "Or build your own from scratch" (secondary link to builder)

3. **Progress Bar** - Shows form completion status
   - Moved from form to provide persistent visibility
   - Animated fill with gradient
   - Shows "X of Y fields completed"

### Preview Scaling

The preview uses CSS transform scaling to simulate a real desktop viewport:

```typescript
const VIEWPORT_WIDTH = 1280;  // Simulated desktop width
const VIEWPORT_HEIGHT = 800;  // Simulated desktop height

// Scale is calculated based on container width
viewportScale.value = containerWidth / VIEWPORT_WIDTH;
```

This approach:
- Preserves spacing, typography, and layout as if viewing a real desktop site
- Maintains aspect ratio without distortion
- Responds to container width changes via ResizeObserver
- Does not clip or squeeze content like a simple aspect-ratio box

### Form Sections

1. **Design Customization** (Interactive)
   - Visual color pickers for all 5 template colors
   - Hex input fields for precise values
   - Per-color reset buttons
   - Reset all to template defaults button
   - Live preview updates as colors change

2. **Business Information**
   - Business name (required)
   - Industry
   - Years in business
   - Business description

3. **Contact Information**
   - Contact name (required)
   - Email (required)
   - Phone
   - Current website URL
   - Business address

4. **Website Goals**
   - Goal selector (attract customers, showcase work, generate leads, etc.)
   - Target audience description

5. **Branding & Content**
   - **File Upload Area** - Multi-file drag-and-drop upload
     - Click to browse or drag files
     - Supports: Images, PDF, AI, PSD, EPS, SVG
     - Shows uploaded file list with remove buttons
     - Professional copy: "Drop your files here (logos, brand assets, etc.) and we'll take care of the rest."
   - Additional notes textarea

### Form Component Props & Events

```typescript
interface Props {
  template: ShowcaseTemplate;  // Template for default colors
  isSubmitting?: boolean;      // Disable form during submission
  showProgress?: boolean;      // Show/hide built-in progress bar (default: true)
}

interface Emits {
  (e: 'submit', data: TemplateRequestFormData): void;
  (e: 'colorChange', colors: ColorCustomization): void;
  (e: 'progressUpdate', progress: { completed: number; total: number }): void;
}
```

### Color Customization Types

```typescript
interface ColorCustomization {
  primary: string;     // Headlines, buttons, links
  secondary: string;   // Accents, secondary elements
  accent: string;      // CTAs, highlights, emphasis
  background: string;  // Page background
  text: string;        // Body text, paragraphs
}

interface TemplateRequestFormData {
  // Business info
  businessName: string;
  industry: string;
  yearsInBusiness: string;
  businessDescription: string;
  // Contact info
  contactName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  // Goals
  goals: string[];
  targetAudience: string;
  // Branding
  brandAssets: string[];  // File names for display
  files: File[];          // Actual File objects for upload
  additionalNotes: string;
  // Colors
  colorCustomization: ColorCustomization;
}
```

### Layout

Two-column layout on desktop:
- **Left (420px)**: Welcome message, live preview card (sticky), progress bar
- **Right (flexible)**: Form sections

Responsive collapse to single column on mobile.

---

## TemplateRequestForm Component

**File:** `app/components/TemplateRequestForm.vue`

A thin orchestration component that composes form sections using extracted composables and sub-components. Follows Nuxt 4 best practices for component composition.

### Architecture

The form logic is split into focused modules:

| Module | Purpose |
|--------|---------|
| `useTemplateRequestForm.ts` | Form state, progress tracking, color handling |
| `useFileUpload.ts` | File upload logic, drag-and-drop, validation |
| `FileUploadArea.vue` | File upload UI component |
| `TemplateRequestForm.vue` | Orchestration layer composing all pieces |

### Props

```typescript
interface Props {
  template: ShowcaseTemplate;  // Template for default colors
  isSubmitting?: boolean;      // Disable form during submission
  showProgress?: boolean;      // Show/hide built-in progress bar (default: true)
}
```

### Events

```typescript
interface Emits {
  (e: 'submit', data: TemplateRequestFormData): void;
  (e: 'colorChange', colors: ColorCustomization): void;
  (e: 'progressUpdate', progress: { completed: number; total: number }): void;
}
```

### Features

- **Composable-based architecture**: Business logic extracted to reusable composables
- **Immutable updates**: All state changes create new objects
- **Validation**: Hex color format validation
- **Reset functionality**: Individual and bulk color resets
- **Template watching**: Resets form when template changes

---

## Form Composables

### useTemplateRequestForm

**File:** `app/composables/useTemplateRequestForm.ts`

Encapsulates form state management, progress tracking, and color customization.

```typescript
interface UseTemplateRequestFormReturn {
  formData: Ref<TemplateRequestFormData>;
  progress: ComputedRef<FormProgress>;
  defaultColors: ComputedRef<ColorCustomization>;
  updateField: <K extends keyof TemplateRequestFormData>(field: K, value: TemplateRequestFormData[K]) => void;
  updateColors: (colors: ColorCustomization) => void;
  resetColors: () => ColorCustomization;
  resetForm: () => void;
}
```

### useFileUpload

**File:** `app/composables/useFileUpload.ts`

Encapsulates file upload logic including drag-and-drop handling and file validation.

```typescript
interface UseFileUploadReturn {
  files: Readonly<Ref<readonly File[]>>;
  isDragging: Readonly<Ref<boolean>>;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  formatFileSize: (bytes: number) => string;
  handleDragEnter: (event: DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (event: DragEvent) => void;
  resetDragState: () => void;
}
```

---

## FileUploadArea Component

**File:** `app/components/form/FileUploadArea.vue`

Friendly, accessible file upload component with drag-and-drop support. Designed to feel warm and inviting rather than clinical.

### Features

- **Visual Design**: Soft blue-purple gradient background, prominent icon, welcoming copy
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
- **Interactions**: Hover states, focus rings, drag-over feedback with subtle scale animation
- **File List**: Clean display with file icons, names, sizes, and remove buttons

### Props

```typescript
interface Props {
  accept?: string;           // HTML accept attribute (default: 'image/*,.pdf,.ai,.psd,.eps,.svg')
  multiple?: boolean;        // Allow multiple files (default: true)
  ariaLabel?: string;        // ARIA label for the file input
  formatsText?: string;      // Supported formats display text (default: 'PNG, JPG, PDF, SVG, AI, PSD, EPS')
  acceptedTypes?: string[];  // MIME types for validation
}
```

### Events

```typescript
interface Emits {
  (e: 'update:files', files: readonly File[]): void;
}
```

### Usage

```vue
<FileUploadArea
  accept="image/*,.pdf,.svg"
  formats-text="PNG, JPG, PDF, SVG"
  @update:files="handleFilesUpdate"
/>
```

---

## CSS Files

| File | Purpose |
|------|---------|
| `dashboard.css` | Dashboard page styles |
| `gallery.css` | Gallery page and template card styles |
| `request-form.css` | Request form page styles |

All CSS files follow the existing design system:
- Primary color: `#1e3a8a`
- Border radius: `12px` (cards), `8px` (inputs)
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.04)` (subtle)
- System fonts (Inter stack)

---

## Navigation Updates

### Login Redirect

After successful login, users are redirected to `/dashboard` instead of `/builder`:

```typescript
// app/pages/login.vue
const redirectUrl = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? redirect : '/dashboard';
});
```

### Landing Page CTAs

Landing page CTAs are now auth-aware:
- **Guest:** "Get Started" / "Launch Builder" → `/login`
- **Authenticated:** "Dashboard" / "Go to Dashboard" → `/dashboard`

### UserMenu Dropdown

Added "Dashboard" link to the UserMenu dropdown for quick navigation from any authenticated page.

---

## Future Considerations

### Planned Enhancements

1. **Template Filtering** - Search, sort, tag-based filtering
2. **Favorites** - Save templates to user's favorites
3. ~~**Preview Customization**~~ ✅ Implemented - Live color scheme preview in request form
4. **Request Status** - Track submitted requests
5. **More Templates** - Expand template library

### API Integration

The request form currently logs to console. Future integration:

```typescript
// Future: Submit to backend API
async function handleSubmit() {
  await $fetch('/api/template-requests', {
    method: 'POST',
    body: {
      templateId: template.value?.id,
      ...formData.value
    }
  });
}
```

---

## Summary

The Dashboard and Gallery system introduces a multi-space architecture that:

1. **Separates concerns** - DIY builder vs. managed services
2. **Improves UX** - Clear entry point and navigation
3. **Enables SMB onboarding** - Professional templates with request flow
4. **Maintains consistency** - Same design system, auth patterns
5. **Preserves existing functionality** - Builder remains unchanged
