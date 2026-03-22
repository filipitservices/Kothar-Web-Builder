/**
 * Issue reports — Firestore writes for user-submitted feedback.
 * UI calls `submitReport`; Firestore paths and validation live here.
 */

import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { getFirebaseApp } from '~/plugins/firebase.client';
import { useAuth } from '~/composables/useAuth';
import {
  ISSUE_REPORT_CATEGORIES,
  type IssueReportCategory,
  type IssueReportFormInput,
} from '~/types/issueReport';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_ROUTE_PATH_LENGTH = 512;
const MAX_LOCALE_LENGTH = 64;

const CATEGORY_SET = new Set<string>(ISSUE_REPORT_CATEGORIES);

function isIssueReportCategory(value: string): value is IssueReportCategory {
  return CATEGORY_SET.has(value);
}

export class IssueReportError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'IssueReportError';
    if (options?.cause) this.cause = options.cause;
  }
}

function sanitizeMessage(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function truncateUtf16(str: string, maxChars: number): string {
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars);
}

function normalizeRoutePath(path: string): string {
  const t = path.trim();
  if (!t.startsWith('/')) {
    return '/';
  }
  return truncateUtf16(t, MAX_ROUTE_PATH_LENGTH);
}

function normalizeLocale(locale: string): string {
  const t = truncateUtf16(locale.trim(), MAX_LOCALE_LENGTH);
  return t.length > 0 ? t : 'und';
}

export function validateIssueReportInput(input: IssueReportFormInput): IssueReportFormInput {
  const message = sanitizeMessage(input.message);
  if (message.length === 0) {
    throw new IssueReportError('Please describe the issue.');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new IssueReportError(`Message must be at most ${MAX_MESSAGE_LENGTH} characters.`);
  }
  if (!isIssueReportCategory(input.category)) {
    throw new IssueReportError('Please choose a valid category.');
  }
  const category = input.category;
  return {
    message,
    category,
    routePath: normalizeRoutePath(input.routePath),
    locale: normalizeLocale(input.locale),
  };
}

export interface UseIssueReportReturn {
  submitReport: (input: IssueReportFormInput) => Promise<void>;
}

export function useIssueReport(): UseIssueReportReturn {
  const { currentUser } = useAuth();

  async function submitReport(input: IssueReportFormInput): Promise<void> {
    const validated = validateIssueReportInput(input);

    const app = getFirebaseApp();
    if (!app) {
      throw new IssueReportError('Application is not ready. Please try again.');
    }

    const uid = currentUser.value?.uid;
    if (!uid) {
      throw new IssueReportError('You must be signed in to submit a report.');
    }

    const db = getFirestore(app);
    const reportsRef = collection(db, 'users', uid, 'reports');

    const userEmail = currentUser.value?.email ?? null;
    const userDisplayName = currentUser.value?.displayName ?? null;

    const payload = {
      message: validated.message,
      category: validated.category,
      locale: validated.locale,
      routePath: validated.routePath,
      userEmail,
      userDisplayName,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(reportsRef, payload);
    } catch (err) {
      throw new IssueReportError('Could not send your report. Please try again.', { cause: err });
    }
  }

  return { submitReport };
}
