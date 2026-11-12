
import { makeId } from '../../utils/ids.js';
import { TODAY } from '../../utils/time.js';
import { MESSAGES } from '../../utils/validators';

/**
 * Add feedback to a student's goal.
 *
 * Only a mentor with an accepted sharing request
 * that includes the goal can add feedback.
 *
 * @param {Object} data - Complete application data.
 * @param {Object} payload - { goalId, type, text }
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function addFeedback(data, { goalId, type, text }, ctx) {
  // 1. Validate the feedback text.
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

  // 2. Verify that the mentor has permission.
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

  // 3. Create the feedback record.
  const feedback = {
    id: makeId('f'),
    goalId,
    mentorId,
    type,
    text: trimmedText,
    date: TODAY,
    reported: false,
  };

  // 4. Return a new data object without mutation.
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
 * Report a feedback item as the signed-in student.
 *
 * @param {Object} data - Complete application data.
 * @param {string} id - Feedback ID.
 * @param {string} reason - Report reason.
 * @param {string} details - Optional explanation.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {{ data: Object, result: Object }}
 */
export function reportFeedback(data, id, reason, details, ctx) {
  // 1. Validate the report reason.
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

  // 2. Find the feedback item.
  const feedbackItem = data.feedback.find(
    (item) => item.id === id
  );

  const studentId = ctx.currentUser?.id;

  // 3. Verify that its goal belongs to this student.
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

  // 4. Prevent duplicate unresolved reports.
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

  // 5. Create the new content report.
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

  // 6. Mark the reported feedback item.
  const updatedFeedback = data.feedback.map((item) =>
    item.id === id
      ? { ...item, reported: true }
      : item
  );

  // 7. Return new data without changing the old data.
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

// Future action:
// decideReport(data, id, decision, reason, ctx)
