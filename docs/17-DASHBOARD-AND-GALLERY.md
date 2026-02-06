# Dashboard & Template System

> **Document Version:** 2.0
> **Last Updated:** February 2026
> **Status:** Production

## Overview

The dashboard serves as the authenticated central hub for SOSG, providing users with immediate access to both the website builder and a curated showcase of professional templates—all in one cohesive experience.

**Key Architecture Decision:** Templates are now integrated directly into the dashboard rather than existing as a separate page. This creates a more focused, intentional user experience where users can discover templates naturally without navigating away from their central workspace.

### System Separation

| System | Purpose | Data Source | User Flow |
|--------|---------|-------------|-----------|
| **Builder Templates** | Starting points for DIY website building | `stores/templates.ts` | Dashboard → Builder → Select template → Edit blocks |
| **Showcase Templates** | Professional designs for managed services | `stores/showcase.ts` | Dashboard → Preview → Request form → Consultation |

---

## Architecture

### Navigation Flow

```
Landing (/) 
    │
    ├── Guest: "Get Started" / "Sign In" → /login
    │
    └── Authenticated: "Dashboard" → /dashboard
                                        │
                                        ├── /builder (DIY website builder)
                                        │
                                        └── Showcase Modal (preview in-page)
                                                │
                                                └── /gallery/request/[id] (request form)
```

### Route Protection

All authenticated routes use the `auth` middleware:

- `/dashboard` - Central hub with builder access and templates showcase
- `/builder` - Website builder (existing)
- `/gallery/request/[id]` - Template request form

**Note:** The standalone `/gallery` route has been removed. Templates are now accessed directly from the dashboard.

---

## Dashboard (`/dashboard`)

**File:** `app/pages/dashboard.vue`  
**CSS:** `app/assets/css/dashboard.css`

The dashboard is the authenticated entry point, combining quick access to the builder with an integrated templates showcase.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Navigation Header                                [UserMenu]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Welcome Section                                            │
│  "Welcome back, [Name]"                                     │
│  "What would you like to create today?"                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔧 Start Building                                   │   │
│  │  Create your website from scratch. Drag blocks...   │   │
│  │                                        [Open Builder]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Professional Templates                                     │
│  "Start with a professionally designed website..."          │
│                                                             │
│  [All] [Local Services] [Professional] [Creative] ...       │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Preview │  │ Preview │  │ Preview │  │ Preview │       │
│  │─────────│  │─────────│  │─────────│  │─────────│       │
│  │ Name    │  │ Name    │  │ Name    │  │ Name    │       │
│  │ Desc... │  │ Desc... │  │ Desc... │  │ Desc... │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **Welcome Section** - Personalized greeting using authenticated user's name
2. **Builder Hero Card** - Prominent gradient card linking to `/builder`
3. **Templates Showcase** - Category-filtered grid of professional templates
4. **ShowcaseModal** - In-page preview modal with desktop/mobile toggle

### State Management

```typescript
// Template showcase state
const selectedCategory = ref<ShowcaseCategory | null>(null);
const showModal = ref(false);
const selectedTemplate = ref<ShowcaseTemplate | null>(null);

// Methods
const openShowcase = (template) => { ... };
const closeShowcase = () => { ... };
const handleChooseDesign = (templateId) => { ... };
```

### Category Filtering

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

**IMPORTANT:** This is completely separate from `stores/templates.ts`. The showcase store contains full professional website designs, not builder blocks.

### Interface

```typescript
interface ShowcaseSection {
  type: 'hero' | 'services' | 'about' | 'features' | 'testimonials' | 
        'team' | 'pricing' | 'gallery' | 'contact' | 'cta' | 'faq' | 
        'stats' | 'process' | 'trust' | 'location';
  data: Record<string, any>;
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

1. **Elite Plumbing & Heating** - Local services (plumbing)
2. **Premier Electrical Services** - Local services (electrical)
3. **Smith & Associates Law Firm** - Professional (legal)
4. **ClearPath Accounting** - Professional (accounting)
5. **Apex Business Consulting** - Professional (consulting)
6. **Lens & Light Photography** - Creative (photography)
7. **Pixel Perfect Agency** - Creative (design/marketing)
8. **Bright Smile Dental** - Healthcare (dental)
9. **Harvest Table Bistro** - Hospitality (restaurant)
10. **Artisan Home Boutique** - Retail (home goods)

---

## ShowcaseModal Component

**File:** `app/components/ShowcaseModal.vue`

Modal overlay for previewing complete showcase templates with device simulation. Opens directly from the dashboard when a template card is clicked.

### Features

- Desktop/Mobile toggle (uses shared device frame styling)
- Full-height scrollable preview
- Template info in header
- "Close Preview" secondary action
- "Choose This Design" CTA → navigates to request form

### Device Frames

Desktop frame dimensions: `700px × 550px`  
Mobile frame dimensions: `330px × 600px`

Frame styling matches existing ScreenCard component for visual consistency.

---

## ShowcaseRenderer Component

**File:** `app/components/showcase/ShowcaseRenderer.vue`

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
| `process` | Step-by-step process flow |
| `trust` | Trust badges and certifications |
| `stats` | Key statistics display |
| `features` | Feature highlights |

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

SMB onboarding form for requesting a website based on a selected showcase template.

### Architecture

The page consists of two main pieces:

1. **Page (`[id].vue`)** - Handles routing, template fetching, preview rendering, and progress display
2. **Form Component (`TemplateRequestForm.vue`)** - Contains all form logic, validation, color customization, and file uploads

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

### Navigation

- Back link: Returns to `/dashboard` (templates section)
- "Choose a different design" link: Returns to `/dashboard`
- "Build your own" link: Goes to `/builder`

### Layout

Two-column layout on desktop:
- **Left (420px)**: Welcome message, live preview card (sticky), progress bar
- **Right (flexible)**: Form sections

Responsive collapse to single column on mobile.

---

## CSS Files

| File | Purpose |
|------|---------|
| `dashboard.css` | Dashboard page styles including templates section |
| `request-form.css` | Request form page styles |
| `components.css` | Shared UI components (buttons, forms, modals, device frames) |
| `showcase.css` | ShowcaseRenderer section styles |

All CSS files follow the existing design system:
- Primary color: `#1e3a8a`
- Border radius: `12px` (cards), `8px` (inputs)
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.04)` (subtle)
- System fonts (Inter stack)

---

## Navigation Updates

### Login Redirect

After successful login, users are redirected to `/dashboard`:

```typescript
// app/pages/login.vue
const redirectUrl = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' ? redirect : '/dashboard';
});
```

### Landing Page CTAs

Landing page CTAs are auth-aware:
- **Guest:** "Get Started" / "Launch Builder" → `/login`
- **Authenticated:** "Dashboard" / "Go to Dashboard" → `/dashboard`

### UserMenu Dropdown

The UserMenu dropdown includes a "Dashboard" link for quick navigation from any authenticated page.

---

## Removed Routes

The following route has been removed in favor of dashboard integration:

- ~~`/gallery`~~ - Templates are now accessed directly from the dashboard

The request form route remains at `/gallery/request/[id]` for URL stability.

---

## Future Considerations

### Planned Enhancements

1. **Template Search** - Search by name or description
2. **Favorites** - Save templates to user's favorites
3. **Request Status** - Track submitted requests
4. **More Templates** - Expand template library
5. **Template Thumbnails** - Visual preview images

### API Integration

The request form currently logs to console. Future integration:

```typescript
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

The integrated dashboard experience provides:

1. **Unified entry point** - Single destination after login
2. **Discoverability** - Templates surface naturally alongside builder access
3. **Visual hierarchy** - Builder is primary action, templates are secondary exploration
4. **Maintained functionality** - Same modal preview, same request flow
5. **Simplified navigation** - Fewer pages, clearer user journey
6. **Design consistency** - Follows existing design system

The architecture maintains separation of concerns:
- Showcase templates remain distinct from builder templates
- ShowcaseModal and ShowcaseRenderer components are reused
- Request form flow is preserved with updated navigation
