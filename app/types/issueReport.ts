/**
 * Issue reports submitted from the app (support / feedback).
 * Documents are created server-side at users/{uid}/reports/{reportId}.
 */

export const ISSUE_REPORT_CATEGORIES = [
  'bug',
  'ux_confusion',
  'account',
  'performance',
  'feature_request',
  'other',
] as const;

export type IssueReportCategory = (typeof ISSUE_REPORT_CATEGORIES)[number];

/** Payload accepted from the client (API + form). */
export interface IssueReportCreateInput {
  category: IssueReportCategory;
  message: string;
}

/** Successful API response after persisting a report. */
export interface IssueReportSubmitResponse {
  reportId: string;
}

/** Firestore document shape (Admin-written; timestamps as stored server-side). */
export interface IssueReportDocument {
  category: IssueReportCategory;
  message: string;
  submitterEmail: string | null;
  submitterDisplayName: string | null;
  userAgent: string | null;
  source: 'web';
  createdAt: unknown;
}
