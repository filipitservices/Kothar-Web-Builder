/** Response from POST /api/orders/finalize-draft */
export type FinalizeDraftResponse =
  | { ok: true }
  | { ok: false; reason: 'subscription_required' };
