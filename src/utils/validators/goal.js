
/**
 * Goal, feedback, and moderation validation messages.
 *
 * These keys are unique to Dev 3 and do not conflict
 * with the account or sharing message keys.
 */
export const messages = {
  // Goal validation
  goalRequired:
    'Category, week start and target are required.',

  goalTarget:
    'Target must be greater than 0 and no more than 168 hours.',

  goalDuplicate:
    'A goal for this category and week already exists.',

  // Feedback validation
  commentEmpty:
    'Comment cannot be empty.',

  suggestionEmpty:
    'Message is required.',

  flagEmpty:
    'Explanation is required.',

  accessWithdrawn:
    'Permission withdrawn: you no longer have access to this goal.',

  // Content reporting
  reportReasonRequired:
    'A reason is required before submitting.',

  reportAlreadyExists:
    'You already have an unresolved report for this content.',

  // Administration and moderation
  decisionReasonRequired:
    'A decision reason is required.',

  reportAlreadyHandled:
    'Already handled: another administrator closed this report.',

  contentAlreadyRemoved:
    'Content unavailable: it was already removed.',
};

/**
 * Validate a goal before adding or updating it.
 *
 * @param {Object} g - Goal data to validate.
 * @param {Object} options - Validation context.
 * @param {Array} options.goals - Goals belonging to the same student.
 * @param {string} [options.exceptId] - Goal ID to ignore when editing.
 *
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateGoal(
  g,
  { goals = [], exceptId } = {}
) {
  // 1. Required fields
  if (
    !g?.categoryId ||
    !g?.weekStart ||
    g?.targetMinutes === undefined ||
    g?.targetMinutes === null ||
    g?.targetMinutes === ''
  ) {
    return {
      ok: false,
      error: messages.goalRequired,
    };
  }

  // 2. Target must be greater than 0 and at most 168 hours.
  const target = Number(g.targetMinutes);
  const MAX_TARGET_MINUTES = 168 * 60;

  if (
    !Number.isFinite(target) ||
    target <= 0 ||
    target > MAX_TARGET_MINUTES
  ) {
    return {
      ok: false,
      error: messages.goalTarget,
    };
  }

  // 3. Prevent duplicate category/week combinations.
  const duplicate = goals.some((goal) => {
    if (goal.id === exceptId) {
      return false;
    }

    return (
      goal.categoryId === g.categoryId &&
      goal.weekStart === g.weekStart
    );
  });

  if (duplicate) {
    return {
      ok: false,
      error: messages.goalDuplicate,
    };
  }

  return { ok: true };
}
