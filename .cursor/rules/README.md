# Cursor Rules — Kothar

This directory contains **modular, context-aware** Cursor rules. They encode engineering standards and domain invariants for the Kothar codebase. Rules are applied by Cursor based on frontmatter: `alwaysApply`, `globs`, or `description` (intelligent application).

## Layer Overview

| Layer | Purpose | When it applies |
|-------|---------|-----------------|
| **Core** | Invariants that apply to all changes (immutability, single source of truth, TypeScript, no quickpatch, analyze-before-implement) | Always (00) or by task-type guidance (01) |
| **Architecture** | Nuxt 4 structure, frontend three-layer design, routing and middleware | When editing pages, layouts, middleware, or component/composable structure |
| **State** | Pinia ownership, no syncing, centralized mutations, immutable updates | When editing stores or composables |
| **Styling** | Design tokens, spacing scale, no ad-hoc colors, layout safety | When editing CSS or component/page styles |
| **Domain** | Builder, templates, showcase, live sites — scope and invariants per domain | When editing files in those domains |
| **Cross-cutting** | Firebase boundaries, TypeScript standards, documentation integrity, refactor standards | When touching auth, types, docs, or refactors |

## File Index

- **00-core-invariants.mdc** — Always applied. Central constraints (no prop mutation, no artificial syncing, no TS silencing, no quickpatch, analyze before implement).
- **01-task-type-guidance.mdc** — Task-type → rule subset mapping and "analyze before implement" by task type. Use to load the right rules for architectural, UI, state, routing, builder, showcase, Firebase, refactor, or docs tasks.
- **02-nuxt-structure.mdc** — Nuxt 4 file-based routing, layouts, middleware, composables. Globs: pages, layouts, middleware, nuxt.config.
- **03-frontend-architecture.mdc** — Three-layer (presentation → composables → stores), component responsibilities. Globs: components, composables, pages.
- **04-routing-and-middleware.mdc** — Route protection, layout assignment, middleware impact. Globs: pages, middleware, layouts.
- **05-pinia-state.mdc** — Store ownership, single source of truth, mutation API. Globs: stores, composables.
- **06-reactivity-immutability.mdc** — No direct nested mutation; immutable update patterns. Globs: stores, composables, components.
- **07-css-architecture.mdc** — Design tokens, spacing, no ad-hoc colors, layout safety. Globs: assets/css, *.vue.
- **08-domain-builder.mdc** — Builder scope, blocks, no one-off logic, template application. Globs: builder page, BlockElements, ItemsList, useBlockData, useTemplateApplication, blocks store, templates store.
- **09-domain-templates.mdc** — Builder template system; state transformation, unique IDs. Globs: templates store, TemplatesList, useTemplateApplication.
- **10-domain-showcase-live-sites.mdc** — Showcase vs builder; live sites not rebuilt via builder. Globs: showcase store, sites store, sites pages, gallery pages, dashboard, ShowcaseModal, showcase components.
- **11-firebase-boundaries.mdc** — Auth and session boundaries; no duplicate auth state. Globs: Firebase plugin, useAuth, auth store, auth/guest middleware, server auth API and utils.
- **12-typescript-standards.mdc** — Explicit data models; no any or type silencing. Globs: **/*.ts, **/*.vue.
- **13-documentation-integrity.mdc** — After structural/architectural refactors, rewrite affected docs; do not append lazily. Applied by description (refactor/docs tasks).
- **14-refactor-standards.mdc** — No quickpatch, no demo-grade code, docs in sync. Applied by description (refactor tasks).

## Usage

- **Always loaded:** Only `00-core-invariants.mdc` has `alwaysApply: true`. All others are scoped by globs or by Cursor’s use of `description` for relevance.
- **Task-based:** For a given task, refer to `01-task-type-guidance.mdc` to see which rule subsets to consider (e.g. styling → core + CSS architecture; state → core + Pinia + reactivity; builder → core + domain-builder + domain-templates + state).
- **No redundancy:** Core invariants are stated once in `00-core-invariants.mdc`. Other files reference "per core invariants" and add only contextual, scoped rules. Avoid duplicating the same rule in multiple files.
- **Conflicts:** Rules are designed not to contradict each other. Core is the authority on global invariants; domain and layer rules extend with context. If a rule seems to conflict with another, core wins; then clarify the domain/layer rule wording.

## Project Docs

Rules reference the `docs/` directory for detailed behavior and APIs. When changing architecture or behavior, update both the code and the relevant docs (see **13-documentation-integrity.mdc**).
