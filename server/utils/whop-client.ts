import Whop from '@whop/sdk';

/** SDK builds `Authorization: Bearer ${apiKey}` — pass the key without a Bearer prefix. */
function normalizeApiKey(raw: string): string {
  const t = raw.trim();
  if (t.startsWith('Bearer ')) return t.slice(7).trim();
  return t;
}

/**
 * Whop REST client (checkout, etc.). Uses NUXT_WHOP_API_KEY and optional NUXT_WHOP_APP_ID.
 */
export function getWhopApiClient(apiKey: string, appId: string | undefined): Whop {
  if (!apiKey) {
    throw new Error('Whop API key is not configured.');
  }
  return new Whop({
    apiKey: normalizeApiKey(apiKey),
    appID: appId?.trim() || undefined,
  });
}

/**
 * Webhook verification client — only needs the webhook secret.
 * The SDK requires a non-empty apiKey to construct the client; it is not used for unwrap.
 */
export function getWhopWebhookClient(webhookSecret: string): Whop {
  if (!webhookSecret) {
    throw new Error('Whop webhook secret is not configured.');
  }
  return new Whop({
    apiKey: 'webhook_only_placeholder',
    webhookKey: webhookSecret,
  });
}
