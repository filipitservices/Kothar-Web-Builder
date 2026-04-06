/**
 * Shared draft → persist → server finalize (Whop + membership policy) → submitted, or access modal.
 * Used by gallery request and orders edit (draft only). Non-draft updates stay on the page.
 */

import { useOrdersStore } from '~/stores/orders';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import { useUnsavedChangesStore } from '~/stores/unsavedChanges';
import type { OrderUpdateParams } from '~/composables/useOrderUpdate';
import { ROUTES } from '~/constants/routes';
import type { FinalizeDraftResponse } from '~/types/finalizeDraft';
import type { OrderWithId, OrderLayout } from '~/types/order';
import type { TemplateRequestFormData } from '~/types/templateRequest';
import { FinalizeDraftError } from '~/types/finalizeDraftError';

export type DraftSubmitResult =
  | { kind: 'submitted' }
  /** Entitlement check failed; draft is saved — show access modal, do not navigate as success. */
  | { kind: 'subscription_required'; syncedOrder: OrderWithId | null };

function readHttpFromUnknown(err: unknown): {
  statusCode?: number;
  statusMessage?: string;
} {
  if (err === null || typeof err !== 'object') return {};
  const o = err as Record<string, unknown>;
  const statusCode =
    typeof o.statusCode === 'number'
      ? o.statusCode
      : typeof o.status === 'number'
        ? o.status
        : undefined;
  const statusMessage = typeof o.statusMessage === 'string' ? o.statusMessage : undefined;
  return { statusCode, statusMessage };
}

export function useDraftRequestSubmitFlow() {
  const ordersStore = useOrdersStore();
  const requestLayoutStore = useRequestLayoutStore();

  async function submitDraftOrder(params: {
    userId: string;
    order: OrderWithId;
    formData: TemplateRequestFormData;
    layout: OrderLayout | undefined;
    updateOrder: (p: OrderUpdateParams) => Promise<void>;
  }): Promise<DraftSubmitResult> {
    const { userId, order, formData, layout, updateOrder } = params;

    await updateOrder({
      userId,
      orderId: order.id,
      formData,
      existingAttachments: order.attachments ?? [],
      newFiles: formData.files?.length ? [...formData.files] : undefined,
      existingLogoAttachments: order.logoAttachments ?? [],
      newLogoFiles: formData.logoFiles?.length ? [...formData.logoFiles] : undefined,
      layout,
    });

    const syncedOrder = await ordersStore.fetchOrder(userId, order.id);

    try {
      const res = await $fetch<FinalizeDraftResponse>('/api/orders/finalize-draft', {
        method: 'POST',
        body: { orderId: order.id },
      });
      if (res.ok === false && res.reason === 'subscription_required') {
        return { kind: 'subscription_required', syncedOrder };
      }
    } catch (err: unknown) {
      const { statusCode: codeFromErr, statusMessage: msgFromErr } = readHttpFromUnknown(err);
      const httpStatus = codeFromErr;
      /** Legacy/alternate deploys that still return 403 */
      if (httpStatus === 403) {
        return { kind: 'subscription_required', syncedOrder };
      }
      const message =
        msgFromErr?.trim() && msgFromErr.trim().length > 0
          ? msgFromErr.trim()
          : 'Could not complete submission.';
      throw new FinalizeDraftError(message, {
        cause: err,
        statusCode: httpStatus,
        statusMessage: msgFromErr,
      });
    }

    await ordersStore.fetchOrder(userId, order.id);

    requestLayoutStore.reset();
    useUnsavedChangesStore().requestAllowNext();
    await navigateTo({ path: ROUTES.sites, query: { tab: 'orders' } });
    return { kind: 'submitted' };
  }

  return { submitDraftOrder };
}
