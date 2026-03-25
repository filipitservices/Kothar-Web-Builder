import { ROUTES } from '~/constants/routes';

/** Firestore path: users/{uid}/access/{ACCESS_BILLING_DOC_ID} — server-written entitlement snapshot. */
export const ACCESS_COLLECTION = 'access';
export const ACCESS_BILLING_DOC_ID = 'billing';

/** Metadata key passed through Whop checkout → membership (webhook mapping). */
export const WHOP_METADATA_FIREBASE_UID = 'firebase_uid';

/** Whop `redirect_url` after checkout; matches post-pay navigation for the payment tab. */
export const WHOP_CHECKOUT_RETURN_PATH = `${ROUTES.sites}?tab=orders`;
