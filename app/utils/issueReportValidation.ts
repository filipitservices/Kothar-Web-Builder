import { ISSUE_REPORT_CATEGORIES, type IssueReportCategory, type IssueReportCreateInput } from '~/types/issueReport';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isIssueReportCategory(value: string): value is IssueReportCategory {
  for (const c of ISSUE_REPORT_CATEGORIES) {
    if (c === value) return true;
  }
  return false;
}

export class IssueReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IssueReportValidationError';
  }
}

function stripUnsafeControlChars(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) {
      out += input[i];
      continue;
    }
    if (code < 32) {
      continue;
    }
    out += input[i];
  }
  return out;
}

/**
 * Validates and normalizes issue report input from API or UI.
 * Throws IssueReportValidationError when invalid.
 */
export function validateIssueReportInput(raw: unknown): IssueReportCreateInput {
  if (!isRecord(raw)) {
    throw new IssueReportValidationError('Invalid request body.');
  }

  const categoryRaw = raw.category;
  const messageRaw = raw.message;

  if (typeof categoryRaw !== 'string' || !isIssueReportCategory(categoryRaw)) {
    throw new IssueReportValidationError('Please choose a valid category.');
  }
  const category = categoryRaw;

  if (typeof messageRaw !== 'string') {
    throw new IssueReportValidationError('Please enter a description of the issue.');
  }

  const trimmed = stripUnsafeControlChars(messageRaw).trim();
  if (trimmed.length < MESSAGE_MIN) {
    throw new IssueReportValidationError(
      `Please enter at least ${MESSAGE_MIN} characters so we can understand the issue.`
    );
  }
  if (trimmed.length > MESSAGE_MAX) {
    throw new IssueReportValidationError(`Description is too long (max ${MESSAGE_MAX} characters).`);
  }

  return { category, message: trimmed };
}

export function issueReportCategoryLabel(category: IssueReportCategory): string {
  const labels: Record<IssueReportCategory, string> = {
    bug: 'Bug or broken behavior',
    ux_confusion: 'Confusing flow or wording',
    account: 'Account or sign-in',
    performance: 'Slow or unreliable',
    feature_request: 'Feature request',
    other: 'Other',
  };
  return labels[category];
}
