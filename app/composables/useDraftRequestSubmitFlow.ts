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

export type DraftSubmitResult =
  | { kind: 'submitted' }
  /** Entitlement check failed; draft is saved — show access modal, do not navigate as success. */
  | { kind: 'subscription_required'; syncedOrder: OrderWithId | null };

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
      const statusCode =
        err !== null &&
        typeof err === 'object' &&
        'statusCode' in err &&
        typeof (err as { statusCode: unknown }).statusCode === 'number'
          ? (err as { statusCode: number }).statusCode
          : undefined;
      const statusFromErr =
        err !== null &&
        typeof err === 'object' &&
        'status' in err &&
        typeof (err as { status: unknown }).status === 'number'
          ? (err as { status: number }).status
          : undefined;
      const httpStatus = statusCode ?? statusFromErr;
      /** Legacy/alternate deploys that still return 403 */
      if (httpStatus === 403) {
        return { kind: 'subscription_required', syncedOrder };
      }
      throw err;
    }

    await ordersStore.fetchOrder(userId, order.id);

    requestLayoutStore.reset();
    useUnsavedChangesStore().requestAllowNext();
    await navigateTo({ path: ROUTES.sites, query: { tab: 'orders' } });
    return { kind: 'submitted' };
  }

  return { submitDraftOrder };
}
