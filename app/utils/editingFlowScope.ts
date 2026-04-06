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
  const galleryRequestMatch = path.match(/^\/gallery\/request\/([^/]+)(?:\/builder)?\/?$/);
  if (galleryRequestMatch?.[1]) {
    return decodeURIComponent(galleryRequestMatch[1]);
  }

  const orderEditMatch = path.match(/^\/orders\/([^/]+)\/(?:edit|builder)\/?$/);
  if (orderEditMatch?.[1]) {
    return decodeURIComponent(orderEditMatch[1]);
  }

  return null;
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
