/**
 * Shared draft → persist → Whop check → submit or checkout + /sites.
 * Used by gallery request and orders edit (draft only). Non-draft updates stay on the page.
 */

import { useRouter } from 'vue-router';
import { useOrdersStore } from '~/stores/orders';
import { useRequestLayoutStore } from '~/stores/requestLayout';
import { useWhopAccessStore } from '~/stores/whopAccess';
import { useWhopAccess } from '~/composables/useWhopAccess';
import type { OrderUpdateParams } from '~/composables/useOrderUpdate';
import { ROUTES } from '~/constants/routes';
import { WHOP_CHECKOUT_RETURN_PATH } from '~/constants/access';
import { ORDER_STATUS_DEFAULT } from '~/types/order';
import type { OrderWithId, OrderLayout } from '~/types/order';
import type { TemplateRequestFormData } from '~/types/templateRequest';

export type DraftSubmitResult =
  | { kind: 'submitted' }
  | { kind: 'redirected_to_sites' }
  | { kind: 'checkout_failed'; syncedOrder: OrderWithId | null };

export function useDraftRequestSubmitFlow() {
  const router = useRouter();
  const ordersStore = useOrdersStore();
  const requestLayoutStore = useRequestLayoutStore();
  const { fetchAccessFromServer, openCheckout } = useWhopAccess();

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

    await fetchAccessFromServer();

    if (useWhopAccessStore().hasAccess !== true) {
      try {
        await openCheckout(WHOP_CHECKOUT_RETURN_PATH);
      } catch {
        return { kind: 'checkout_failed', syncedOrder };
      }
      requestLayoutStore.reset();
      await router.replace({ path: ROUTES.sites, query: { tab: 'orders' } });
      return { kind: 'redirected_to_sites' };
    }

    const basis = syncedOrder ?? order;
    await updateOrder({
      userId,
      orderId: order.id,
      formData,
      existingAttachments: basis.attachments ?? [],
      newFiles: undefined,
      layout,
      status: ORDER_STATUS_DEFAULT,
    });

    requestLayoutStore.reset();
    await navigateTo({ path: ROUTES.sites, query: { tab: 'orders' } });
    return { kind: 'submitted' };
  }

  return { submitDraftOrder };
}
