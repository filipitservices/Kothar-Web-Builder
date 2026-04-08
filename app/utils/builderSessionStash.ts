/**
 * Session-only stash for unsaved builder layout + sketch overlays when the user
 * chooses “Stash” on leave. Distinct from order-edit form stash keys.
 */

import type { OrderLayout } from '~/types/order';
import { isValidOrderLayout } from '~/composables/useOrderEditStash';

export const BUILDER_SESSION_STASH_VERSION = 1 as const;

const STASH_KEY_PREFIX = 'kothar:builder-session-stash:';

export interface BuilderSessionStashPayload {
  version: typeof BUILDER_SESSION_STASH_VERSION;
  orderId: string;
  savedAt: number;
  layout: OrderLayout;
  syncScreens: boolean;
}

function getStorageKey(orderId: string): string {
  return `${STASH_KEY_PREFIX}${orderId}`;
}

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function isValidPayload(raw: unknown): raw is BuilderSessionStashPayload {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  if (o.version !== BUILDER_SESSION_STASH_VERSION) return false;
  if (typeof o.orderId !== 'string' || !o.orderId.trim()) return false;
  if (typeof o.savedAt !== 'number') return false;
  if (typeof o.syncScreens !== 'boolean') return false;
  if (!isValidOrderLayout(o.layout)) return false;
  return true;
}

export function writeBuilderSessionStash(payload: {
  orderId: string;
  layout: OrderLayout;
  syncScreens: boolean;
}): void {
  if (!canUseSessionStorage() || !payload.orderId.trim()) return;
  const full: BuilderSessionStashPayload = {
    version: BUILDER_SESSION_STASH_VERSION,
    orderId: payload.orderId,
    savedAt: Date.now(),
    layout: {
      customized: payload.layout.customized,
      blocks: payload.layout.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        label: b.label,
      })),
      builderAnnotations: payload.layout.builderAnnotations
        ? {
            version: 1,
            desktop: {
              strokes: [...payload.layout.builderAnnotations.desktop.strokes],
              textBoxes: payload.layout.builderAnnotations.desktop.textBoxes.map((box) => ({
                ...box,
              })),
            },
            mobile: {
              strokes: [...payload.layout.builderAnnotations.mobile.strokes],
              textBoxes: payload.layout.builderAnnotations.mobile.textBoxes.map((box) => ({
                ...box,
              })),
            },
          }
        : undefined,
    },
    syncScreens: payload.syncScreens,
  };
  window.sessionStorage.setItem(getStorageKey(payload.orderId), JSON.stringify(full));
}

export function readBuilderSessionStash(orderId: string): BuilderSessionStashPayload | null {
  if (!canUseSessionStorage() || !orderId.trim()) return null;
  const raw = window.sessionStorage.getItem(getStorageKey(orderId));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidPayload(parsed) || parsed.orderId !== orderId) {
      clearBuilderSessionStash(orderId);
      return null;
    }
    return parsed;
  } catch {
    clearBuilderSessionStash(orderId);
    return null;
  }
}

export function clearBuilderSessionStash(orderId: string): void {
  if (!canUseSessionStorage() || !orderId.trim()) return;
  window.sessionStorage.removeItem(getStorageKey(orderId));
}
