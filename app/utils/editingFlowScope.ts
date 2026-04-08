import type { RouteLocationNormalized } from 'vue-router';

export interface EditingFlowScopeOutside {
  kind: 'outside';
}

export interface EditingFlowScopeActive {
  kind: 'editing';
  entityId: string;
}

export type EditingFlowScope = EditingFlowScopeOutside | EditingFlowScopeActive;

const OUTSIDE_SCOPE: EditingFlowScopeOutside = { kind: 'outside' };

function getEntityIdFromPath(path: string): string | null {
  const galleryRequestMatch = path.match(
    /^\/gallery\/request\/([^/]+)(?:\/(?:edit|builder))?\/?$/,
  );
  if (galleryRequestMatch?.[1]) {
    return decodeURIComponent(galleryRequestMatch[1]);
  }

  const orderEditMatch = path.match(/^\/orders\/([^/]+)\/(?:edit|builder)\/?$/);
  if (orderEditMatch?.[1]) {
    return decodeURIComponent(orderEditMatch[1]);
  }

  return null;
}

/**
 * Same request/order entity navigating only between the paired request (or order) page
 * and the builder — e.g. /gallery/request/:id ↔ /gallery/request/:id/builder, or
 * /orders/:id/edit ↔ /orders/:id/builder. Used so unsaved layout/sketch can prompt on
 * internal moves when dirty.
 */
export function isIntraEntityBuilderSiblingNavigation(
  from: Pick<RouteLocationNormalized, 'path'>,
  to: Pick<RouteLocationNormalized, 'path'>,
): boolean {
  if (!isSameEditingFlow(from, to)) {
    return false;
  }
  if (from.path === to.path) {
    return false;
  }

  const inGalleryFamily = (p: string): boolean =>
    /^\/gallery\/request\/[^/]+(?:\/(?:builder|edit))?\/?$/.test(p);

  const inOrderFamily = (p: string): boolean =>
    /^\/orders\/[^/]+\/(?:edit|builder)\/?$/.test(p);

  return (
    (inGalleryFamily(from.path) && inGalleryFamily(to.path)) ||
    (inOrderFamily(from.path) && inOrderFamily(to.path))
  );
}

export function getEditingFlowScope(route: Pick<RouteLocationNormalized, 'path'>): EditingFlowScope {
  const entityId = getEntityIdFromPath(route.path);
  if (!entityId) {
    return OUTSIDE_SCOPE;
  }
  return {
    kind: 'editing',
    entityId,
  };
}

export function isSameEditingFlow(
  from: Pick<RouteLocationNormalized, 'path'>,
  to: Pick<RouteLocationNormalized, 'path'>,
): boolean {
  const fromScope = getEditingFlowScope(from);
  const toScope = getEditingFlowScope(to);
  return (
    fromScope.kind === 'editing' &&
    toScope.kind === 'editing' &&
    fromScope.entityId === toScope.entityId
  );
}

export function isLeavingEditingFlow(
  from: Pick<RouteLocationNormalized, 'path'>,
  to: Pick<RouteLocationNormalized, 'path'>,
): boolean {
  const fromScope = getEditingFlowScope(from);
  if (fromScope.kind !== 'editing') {
    return false;
  }
  return !isSameEditingFlow(from, to);
}
