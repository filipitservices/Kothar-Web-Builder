import type { Timestamp } from 'firebase/firestore';

/** Allowed issue categories; kept in sync with Firestore security rules. */
export const ISSUE_REPORT_CATEGORIES = [
  'bug',
  'ui',
  'account',
  'billing',
  'other',
] as const;

export type IssueReportCategory = (typeof ISSUE_REPORT_CATEGORIES)[number];

/** Input collected in the UI before validation. */
export interface IssueReportFormInput {
  message: string;
  category: IssueReportCategory;
  /** Current app route path (e.g. /gallery); supplied by the page, not user-editable. */
  routePath: string;
  /** BCP 47 language tag from the browser (e.g. en-US). */
  locale: string;
}

/**
 * Firestore document shape at `users/{userId}/reports/{reportId}`.
 * `createdAt` is set with `serverTimestamp()` on write.
 */
export interface IssueReportDocument {
  message: string;
  category: IssueReportCategory;
  createdAt: Timestamp;
  locale: string;
  routePath: string;
  userEmail: string | null;
  userDisplayName: string | null;
}
