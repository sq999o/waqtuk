
import { makeId } from '../../utils/ids.js';
import { TODAY } from '../../utils/time.js';
import { MESSAGES } from '../../utils/validators';

/**
 * Add feedback to a student's goal.
 */
export function addFeedback(data, { goalId, type, text }, ctx) {
  // 1. Validate feedback text.
  const trimmedText = String(text ?? '').trim();

  if (!trimmedText) {
    const errorKey = {
      comment: 'commentEmpty',
      suggestion: 'suggestionEmpty',
      flag: 'flagEmpty',
    }[type];

    return {
      data,
      result: {
        ok: false,
        error: MESSAGES[errorKey] ?? MESSAGES.commentEmpty,
      },
    };
  }

  // 2. Verify mentor access.
  const mentorId = ctx.currentUser?.id;

  const hasAccess = data.sharingRequests.some(
    (request) =>
      request.mentorId === mentorId &&
      request.status === 'accepted' &&
      request.goalIds.includes(goalId)
  );

  if (!mentorId || !hasAccess) {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.accessWithdrawn,
      },
    };
  }

  // 3. Create feedback.
  const feedback = {
    id: makeId('f'),
    goalId,
    mentorId,
    type,
    text: trimmedText,
    date: TODAY,
    reported: false,
  };

  return {
    data: {
      ...data,
      feedback: [...data.feedback, feedback],
    },
    result: {
      ok: true,
      id: feedback.id,
    },
  };
}

/**
 * Report feedback as the signed-in student.
 */
export function reportFeedback(data, id, reason, details, ctx) {
  // 1. Validate reason.
  const trimmedReason = String(reason ?? '').trim();

  if (!trimmedReason) {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.reportReasonRequired,
      },
    };
  }

  // 2. Find feedback.
  const feedbackItem = data.feedback.find(
    (item) => item.id === id
  );

  const studentId = ctx.currentUser?.id;

  // 3. Verify goal ownership.
  const ownsGoal = data.goals.some(
    (goal) =>
      goal.id === feedbackItem?.goalId &&
      goal.studentId === studentId
  );

  if (!feedbackItem || !studentId || !ownsGoal) {
    return {
      data,
      result: {
        ok: false,
        error: 'Feedback not found or access denied.',
      },
    };
  }

  // 4. Prevent duplicate pending reports.
  const existingReport = data.contentReports.some(
    (report) =>
      report.feedbackId === id &&
      report.reporterId === studentId &&
      report.status === 'pending'
  );

  if (existingReport) {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.reportAlreadyExists,
      },
    };
  }

  // 5. Create report.
  const newReport = {
    id: makeId('c'),
    feedbackId: id,
    reporterId: studentId,
    reason: trimmedReason,
    details: String(details ?? ''),
    status: 'pending',
    decisionReason: '',
    date: TODAY,
  };

  // 6. Mark feedback as reported.
  const updatedFeedback = data.feedback.map((item) =>
    item.id === id
      ? { ...item, reported: true }
      : item
  );

  return {
    data: {
      ...data,
      contentReports: [
        ...data.contentReports,
        newReport,
      ],
      feedback: updatedFeedback,
    },
    result: {
      ok: true,
    },
  };
}

/**
 * Decide a content moderation report as an administrator.
 *
 * Dismissed:
 * - Closes only the selected report.
 *
 * Removed:
 * - Marks the feedback as removed.
 * - Closes all pending reports for the same feedback.
 *
 * @param {Object} data - Complete application data.
 * @param {string} id - Content report ID.
 * @param {'dismissed'|'removed'} decision
 * @param {string} reason - Administrator's explanation.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function decideReport(data, id, decision, reason, ctx) {
  // 1. Validate the decision reason.
  const trimmedReason = String(reason ?? '').trim();

  if (!trimmedReason) {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.decisionReasonRequired,
      },
    };
  }

  // 2. Find the report.
  const report = data.contentReports.find(
    (item) => item.id === id
  );

  if (!report) {
    return {
      data,
      result: {
        ok: false,
        error: 'Report not found.',
      },
    };
  }

  // 3. Check whether another administrator handled it.
  if (report.status !== 'pending') {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.reportAlreadyHandled,
      },
    };
  }

  // 4. Check whether content was already removed.
  const feedbackItem = data.feedback.find(
    (item) => item.id === report.feedbackId
  );

  if (
    decision === 'removed' &&
    feedbackItem?.removed === true
  ) {
    return {
      data,
      result: {
        ok: false,
        error: MESSAGES.contentAlreadyRemoved,
      },
    };
  }

  // 5. Dismiss only the selected report.
  if (decision === 'dismissed') {
    const updatedReports = data.contentReports.map(
      (item) =>
        item.id === id
          ? {
              ...item,
              status: 'dismissed',
              decisionReason: trimmedReason,
            }
          : item
    );

    return {
      data: {
        ...data,
        contentReports: updatedReports,
      },
      result: {
        ok: true,
      },
    };
  }

  // 6. Remove the content and close related pending reports.
  if (decision === 'removed') {
    const updatedFeedback = data.feedback.map(
      (item) =>
        item.id === report.feedbackId
          ? { ...item, removed: true }
          : item
    );

    const updatedReports = data.contentReports.map(
      (item) =>
        item.feedbackId === report.feedbackId &&
        item.status === 'pending'
          ? {
              ...item,
              status: 'removed',
              decisionReason: trimmedReason,
            }
          : item
    );

    return {
      data: {
        ...data,
        feedback: updatedFeedback,
        contentReports: updatedReports,
      },
      result: {
        ok: true,
      },
    };
  }

  // Reject unsupported decisions without changing data.
  return {
    data,
    result: {
      ok: false,
      error: 'Invalid report decision.',
    },
  };
}
