# Builder UI Restructure — Audit Reference

**Commit:** chore(builder): audit sidebar/dashboard/header references

## Audit Results: Symbol and Reference Matches

### DrawingDashboard / DrawingToolControls / DrawingControlsPanel
- **DrawingDashboard**: Not found — the component is `DrawingControlsPanel`
- **DrawingToolControls**: `app/components/DrawingControlsPanel.vue`, `docs/06-COMPONENT-CATALOG.md`, `docs/02-ARCHITECTURE.md`
- **DrawingControlsPanel**: `app/components/ScreensPanel.vue`, `app/composables/useScreenScaling.ts`, `docs/06-COMPONENT-CATALOG.md`, `docs/02-ARCHITECTURE.md`, `docs/10-AI-CHAT-SYSTEM.md`

### "Editing page layout"
- `app/components/BuilderEditor.vue` line 34

### .drawing-controls-panel
- `app/components/DrawingControlsPanel.vue` (root class)
- `app/composables/useScreenScaling.ts` (lines 24, 81)

### SidebarBranding
- Component import/usage: `app/components/BuilderEditor.vue` (lines 14–17, 114)
- Component file: `app/components/SidebarBranding.vue`
- CSS: `app/assets/css/editor.css` (`.left-sidebar > .sidebar-branding`)
- Documentation: `docs/09-SIDEBAR-BRANDING.md`
- Storybook/tests: None

### Left sidebar header / Right sidebar header
- Left: `app/components/BuilderEditor.vue` — `.sidebar-header` with "Available Items"
- Right: `app/components/TemplatesList.vue` — `.templates-header` (different styling)

### Gradient CSS (dashboard)
- `app/components/DrawingControlsPanel.vue` line 208: `linear-gradient(135deg, #f6f7fb 0%, #e9edf5 100%)`
