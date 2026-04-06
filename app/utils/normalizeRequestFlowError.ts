/**
 * Maps thrown values from request/order flows into user-facing modal content.
 * Walks Error.cause chains and recognizes Firestore, Firebase Storage, and Nitro/ofetch errors.
 */

import { FirestoreError } from 'firebase/firestore';
import { FinalizeDraftError } from '~/types/finalizeDraftError';
import type {
  RequestFlowErrorContent,
  RequestFlowErrorFlowContext,
} from '~/types/requestFlowError';

const DOMAIN_WRAPPER_NAMES = new Set([
  'OrderUpdateError',
  'OrderSubmissionError',
  'CreateRequestError',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function hasStringCode(value: unknown): value is { code: string; message?: string } {
  return isRecord(value) && typeof value.code === 'string';
}

/** Modular SDK FirebaseError extends Error with code */
function isFirebaseStyleError(value: unknown): value is { name: string; code: string; message: string } {
  return (
    isRecord(value) &&
    value instanceof Error &&
    value.name === 'FirebaseError' &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof value.message === 'string'
  );
}

/** Nitro / ofetch error shape */
function readFetchMeta(err: unknown): {
  statusCode?: number;
  statusMessage?: string;
} {
  if (!isRecord(err)) return {};
  const statusCode =
    typeof err.statusCode === 'number'
      ? err.statusCode
      : typeof err.status === 'number'
        ? err.status
        : undefined;
  const statusMessage =
    typeof err.statusMessage === 'string'
      ? err.statusMessage
      : typeof err.message === 'string' && statusCode !== undefined
        ? err.message
        : undefined;
  return { statusCode, statusMessage };
}

function firestoreCodeToUserCopy(code: string): {
  description: string;
  nextStep: string;
} {
  switch (code) {
    case 'permission-denied':
      return {
        description:
          'Your changes could not be saved because access was denied. This can happen if your session expired or this request no longer allows edits.',
        nextStep:
          'Sign out and sign back in, then try again. If the problem continues, open My Sites → Orders and check that this request is still editable.',
      };
    case 'unavailable':
    case 'deadline-exceeded':
      return {
        description:
          'The service was temporarily unreachable or the request timed out. Nothing is wrong with your form data.',
        nextStep: 'Check your internet connection and try again in a moment.',
      };
    case 'unauthenticated':
      return {
        description: 'You are not signed in, or your session is no longer valid.',
        nextStep: 'Sign in again, return to this page, and try saving once more.',
      };
    case 'resource-exhausted':
      return {
        description: 'The service is busy or a usage limit was hit.',
        nextStep: 'Wait a short time and try again. If this keeps happening, contact support.',
      };
    case 'failed-precondition':
    case 'aborted':
    case 'cancelled':
      return {
        description:
          'The save could not complete because the operation conflicted with another change or was cancelled.',
        nextStep: 'Refresh the page to load the latest data, then try again.',
      };
    case 'not-found':
      return {
        description: 'The order or document could not be found. It may have been removed.',
        nextStep:
          'Go back to My Sites → Orders and open the request again, or start a new request from the Gallery.',
      };
    default:
      return {
        description: 'Something went wrong while saving to our servers.',
        nextStep: 'Try again. If the problem continues, contact support with the details below.',
      };
  }
}

function storageCodeToUserCopy(code: string): {
  description: string;
  nextStep: string;
} {
  if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
    return {
      description:
        'Uploading a file was blocked because you are not allowed to store it with the current session.',
      nextStep:
        'Sign in again and retry. If it persists, check that files are within allowed types and sizes.',
    };
  }
  if (code === 'storage/retry-limit-exceeded' || code === 'storage/canceled') {
    return {
      description: 'An upload was interrupted or hit a retry limit.',
      nextStep: 'Check your connection and try uploading again.',
    };
  }
  if (code === 'storage/quota-exceeded') {
    return {
      description: 'Storage quota was exceeded.',
      nextStep: 'Remove unneeded attachments or use smaller files, then try again.',
    };
  }
  return {
    description: 'A file upload failed.',
    nextStep: 'Check your connection and try again. If it continues, try a smaller file.',
  };
}

function firebaseCodeToUserCopy(code: string): {
  description: string;
  nextStep: string;
} {
  if (code.startsWith('storage/')) {
    return storageCodeToUserCopy(code);
  }
  return firestoreCodeToUserCopy(code);
}

function titleForContext(flowContext: RequestFlowErrorFlowContext): string {
  switch (flowContext) {
    case 'create_draft':
      return 'Could not create request';
    case 'submit_draft':
      return 'Could not submit request';
    case 'update_order':
      return 'Could not save changes';
    case 'finalize_submission':
      return 'Could not finalize submission';
    case 'save_layout':
      return 'Could not save layout';
    case 'checkout':
      return 'Could not open checkout';
    default:
      return 'Something went wrong';
  }
}

function defaultNextStep(flowContext: RequestFlowErrorFlowContext): string {
  switch (flowContext) {
    case 'checkout':
      return 'Try again, or allow pop-ups and ad blockers for this site.';
    case 'finalize_submission':
      return 'Your draft may already be saved. Try submitting again from My Sites → Orders.';
    default:
      return 'Try again. If the issue continues, contact support.';
  }
}

function httpToUserCopy(
  statusCode: number | undefined,
  statusMessage: string | undefined,
  flowContext: RequestFlowErrorFlowContext
): { description: string; nextStep: string; debugDetail?: string } {
  const hinted =
    statusMessage &&
    statusMessage.trim().length > 0 &&
    !/^FetchError|POST|GET/i.test(statusMessage)
      ? statusMessage.trim()
      : undefined;

  if (statusCode === 401) {
    return {
      description: hinted ?? 'Your session is invalid or expired.',
      nextStep: 'Sign in again, then retry.',
      debugDetail: hinted ? undefined : `HTTP ${statusCode}`,
    };
  }
  if (statusCode === 400) {
    return {
      description: hinted ?? 'The server rejected the request because something was missing or invalid.',
      nextStep: defaultNextStep(flowContext),
      debugDetail: hinted ? undefined : `HTTP ${statusCode}`,
    };
  }
  if (statusCode === 404) {
    return {
      description: hinted ?? 'The resource was not found.',
      nextStep:
        flowContext === 'finalize_submission'
          ? 'Refresh My Sites → Orders and try submitting again.'
          : defaultNextStep(flowContext),
      debugDetail: hinted ? undefined : `HTTP ${statusCode}`,
    };
  }
  if (statusCode === 409) {
    return {
      description:
        hinted ??
        'This action conflicts with the current state of your request (for example, it may no longer be a draft).',
      nextStep: 'Reload the page or open the order again from My Sites → Orders.',
      debugDetail: hinted ? undefined : `HTTP ${statusCode}`,
    };
  }
  if (statusCode !== undefined && statusCode >= 500) {
    return {
      description: hinted ?? 'A server error occurred while processing your request.',
      nextStep: 'Try again in a few minutes. If it continues, contact support.',
      debugDetail: `HTTP ${statusCode}`,
    };
  }
  return {
    description: hinted ?? 'The request could not be completed.',
    nextStep: defaultNextStep(flowContext),
    debugDetail: statusCode !== undefined ? `HTTP ${statusCode}` : undefined,
  };
}

/** Collect leaf causes for debug line (depth-limited) */
function deepestCodeAndMessage(err: unknown, depth = 0): { code?: string; message: string } | null {
  if (depth > 6 || err === null || err === undefined) return null;

  if (err instanceof FirestoreError) {
    return { code: err.code, message: err.message };
  }

  if (isFirebaseStyleError(err)) {
    return { code: err.code, message: err.message };
  }

  if (err instanceof Error) {
    const c = err.cause;
    const fromCause = c !== undefined ? deepestCodeAndMessage(c, depth + 1) : null;
    if (fromCause) return fromCause;
    return { message: err.message };
  }

  if (hasStringCode(err)) {
    return {
      code: err.code,
      message: typeof err.message === 'string' ? err.message : err.code,
    };
  }

  return null;
}

function domainMessageHints(message: string): boolean {
  const m = message.trim();
  if (m.length === 0) return false;
  if (m === 'Failed to update order. Please try again.') return false;
  if (m === 'Could not save changes.') return false;
  if (m === 'Failed to save order. Your files were uploaded; please try again.') return false;
  if (m === 'Failed to create request. Please try again.') return false;
  if (m === 'Failed to save layout. Please try again.') return false;
  if (m === 'One or more file uploads failed. Order was not saved.') return false;
  if (m === 'Firebase is not configured.') return true;
  if (m === 'User ID is required.' || m === 'User ID and order ID are required.') return true;
  if (m.startsWith("You've reached the daily limit")) return true;
  return m.length > 3 && m.length < 400;
}

function unwrapDomainCause(err: unknown): unknown {
  let cur: unknown = err;
  let depth = 0;
  while (cur instanceof Error && depth < 8) {
    if (cur instanceof FirestoreError) return cur;
    if (isFirebaseStyleError(cur)) return cur;
    const n = cur.name;
    if (typeof n === 'string' && DOMAIN_WRAPPER_NAMES.has(n) && cur.cause !== undefined) {
      cur = cur.cause;
      depth += 1;
      continue;
    }
    return cur;
  }
  return cur;
}

function firestoreContent(
  err: FirestoreError,
  flowContext: RequestFlowErrorFlowContext,
  title: string
): RequestFlowErrorContent {
  const copy = firestoreCodeToUserCopy(err.code);
  const deep = deepestCodeAndMessage(err);
  return {
    flowContext,
    title,
    description: copy.description,
    nextStep: copy.nextStep,
    debugDetail: deep ? `${deep.code ? `${deep.code}: ` : ''}${deep.message}`.slice(0, 500) : undefined,
  };
}

function isNetworkTypeError(err: unknown): err is TypeError {
  return (
    err instanceof TypeError &&
    typeof err.message === 'string' &&
    (err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('network'))
  );
}

/**
 * Normalize any thrown value into modal-ready content (no logging).
 */
export function normalizeRequestFlowError(
  err: unknown,
  flowContext: RequestFlowErrorFlowContext
): RequestFlowErrorContent {
  const title = titleForContext(flowContext);

  if (err instanceof FirestoreError) {
    return firestoreContent(err, flowContext, title);
  }

  if (err instanceof FinalizeDraftError) {
    const statusCode = err.statusCode;
    const statusMessage = err.statusMessage;
    if (typeof statusCode === 'number' && statusCode >= 400) {
      const http = httpToUserCopy(statusCode, statusMessage, 'finalize_submission');
      return {
        flowContext,
        title: titleForContext('finalize_submission'),
        description: http.description,
        nextStep: http.nextStep,
        debugDetail: http.debugDetail,
      };
    }
  }

  const fetchMeta = readFetchMeta(err);
  if (typeof fetchMeta.statusCode === 'number' && fetchMeta.statusCode >= 400) {
    const http = httpToUserCopy(fetchMeta.statusCode, fetchMeta.statusMessage, flowContext);
    return {
      flowContext,
      title,
      description: http.description,
      nextStep: http.nextStep,
      debugDetail: http.debugDetail,
    };
  }

  if (isNetworkTypeError(err)) {
    return {
      flowContext,
      title,
      description: 'We could not reach the server. Your network connection may be interrupted.',
      nextStep: 'Check your connection and try again.',
      debugDetail: err.message.slice(0, 200),
    };
  }

  const unwrapped = unwrapDomainCause(err);

  if (unwrapped instanceof FirestoreError) {
    return firestoreContent(unwrapped, flowContext, title);
  }

  if (isFirebaseStyleError(unwrapped)) {
    const copy = firebaseCodeToUserCopy(unwrapped.code);
    return {
      flowContext,
      title,
      description: copy.description,
      nextStep: copy.nextStep,
      debugDetail: `${unwrapped.code}: ${unwrapped.message}`.slice(0, 500),
    };
  }

  if (unwrapped instanceof Error && domainMessageHints(unwrapped.message)) {
    return {
      flowContext,
      title,
      description: unwrapped.message,
      nextStep: defaultNextStep(flowContext),
    };
  }

  const deep = deepestCodeAndMessage(err);
  if (deep?.code) {
    const copy = deep.code.startsWith('storage/')
      ? storageCodeToUserCopy(deep.code)
      : firestoreCodeToUserCopy(deep.code);
    return {
      flowContext,
      title,
      description: copy.description,
      nextStep: copy.nextStep,
      debugDetail: `${deep.code}: ${deep.message}`.slice(0, 500),
    };
  }

  if (err instanceof Error && err.message) {
    return {
      flowContext,
      title,
      description: domainMessageHints(err.message)
        ? err.message
        : 'An unexpected error occurred.',
      nextStep: defaultNextStep(flowContext),
      debugDetail: err.message.length < 200 ? err.message : undefined,
    };
  }

  return {
    flowContext,
    title,
    description: 'An unexpected error occurred.',
    nextStep: defaultNextStep(flowContext),
  };
}
