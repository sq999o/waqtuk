
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

// Future actions:
// reportFeedback(data, id, reason, details, ctx)
// decideReport(data, id, decision, reason, ctx)
