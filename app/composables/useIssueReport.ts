/**
 * Submit issue reports via the server API (session auth + Admin Firestore).
 * Pages must not call Firestore directly for this domain.
 */

import type { IssueReportCreateInput, IssueReportSubmitResponse } from '~/types/issueReport';
import { validateIssueReportInput, IssueReportValidationError } from '~/utils/issueReportValidation';

export class IssueReportSubmissionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'IssueReportSubmissionError';
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

function readFetchErrorMessage(error: unknown): string | undefined {
  if (error === null || typeof error !== 'object') {
    return undefined;
  }
  const data = Reflect.get(error, 'data');
  if (data !== null && typeof data === 'object') {
    const sm = Reflect.get(data, 'statusMessage');
    if (typeof sm === 'string' && sm.length > 0) {
      return sm;
    }
    const m = Reflect.get(data, 'message');
    if (typeof m === 'string' && m.length > 0) {
      return m;
    }
  }
  const statusMessage = Reflect.get(error, 'statusMessage');
  if (typeof statusMessage === 'string' && statusMessage.length > 0) {
    return statusMessage;
  }
  const message = Reflect.get(error, 'message');
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  return undefined;
}

export interface UseIssueReportReturn {
  submitReport: (input: IssueReportCreateInput) => Promise<IssueReportSubmitResponse>;
}

export function useIssueReport(): UseIssueReportReturn {
  async function submitReport(input: IssueReportCreateInput): Promise<IssueReportSubmitResponse> {
    let body: IssueReportCreateInput;
    try {
      body = validateIssueReportInput(input);
    } catch (err: unknown) {
      if (err instanceof IssueReportValidationError) {
        throw new IssueReportSubmissionError(err.message, { cause: err });
      }
      throw err;
    }

    try {
      return await $fetch<IssueReportSubmitResponse>('/api/reports/issue', {
        method: 'POST',
        body,
      });
    } catch (err: unknown) {
      const fromFetch = readFetchErrorMessage(err);
      throw new IssueReportSubmissionError(
        fromFetch ?? 'Could not submit your report. Please try again.',
        { cause: err }
      );
    }
  }

  return { submitReport };
}
