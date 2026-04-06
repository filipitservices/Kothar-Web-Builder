/**
 * Thrown when POST /api/orders/finalize-draft fails (non–subscription_required paths).
 * Preserves HTTP metadata for normalization.
 */

export class FinalizeDraftError extends Error {
  public override readonly cause?: unknown;
  public readonly statusCode?: number;
  public readonly statusMessage?: string;

  constructor(
    message: string,
    options?: { cause?: unknown; statusCode?: number; statusMessage?: string }
  ) {
    super(message);
    this.name = 'FinalizeDraftError';
    this.cause = options?.cause;
    this.statusCode = options?.statusCode;
    this.statusMessage = options?.statusMessage;
  }
}
