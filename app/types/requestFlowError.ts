/**
 * Typed content for the global request/order error alert dialog.
 * Plain text only; never HTML.
 */

export type RequestFlowErrorFlowContext =
  | 'create_draft'
  | 'submit_draft'
  | 'update_order'
  | 'finalize_submission'
  | 'save_layout'
  | 'checkout'
  | 'generic';

export interface RequestFlowErrorContent {
  flowContext: RequestFlowErrorFlowContext;
  title: string;
  description: string;
  nextStep: string;
  /** Optional collapsed technical line (error code + short message) for support/debugging */
  debugDetail?: string;
}
