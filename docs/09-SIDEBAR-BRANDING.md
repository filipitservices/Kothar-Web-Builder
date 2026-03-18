# Sidebar Branding (Removed)

**SidebarBranding.vue** has been removed from the builder. Account and help functionality are available via **UserMenu** in the AppNavbar on pages that use the default layout (gallery, sites, etc.). The builder uses the builder layout, which has no navbar, so account actions are accessed by navigating to the gallery or other authenticated pages.

**Historical reference:** SidebarBranding was previously used in `BuilderEditor.vue` (left sidebar) and styled in `editor.css` (`.left-sidebar > .sidebar-branding`). The component file was `app/components/SidebarBranding.vue`.
