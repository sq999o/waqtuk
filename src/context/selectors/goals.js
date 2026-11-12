
/**
 * Return goals belonging to the signed-in student.
 *
 * @param {Object} data - Complete application data.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {Array} Student's goals.
 */
export function myGoals(data, ctx) {
  const studentId = ctx.currentUser?.id;

  if (!studentId) {
    return [];
  }

  return data.goals.filter(
    (goal) => goal.studentId === studentId
  );
}

/**
 * Return feedback on the signed-in student's goals.
 *
 * Excludes removed feedback and sorts newest first.
 *
 * @param {Object} data - Complete application data.
 * @param {Object} ctx - Context containing currentUser.
 * @returns {Array} Student's visible feedback, newest first.
 */
export function myFeedback(data, ctx) {
  const studentId = ctx.currentUser?.id;

  if (!studentId) {
    return [];
  }

  // Collect the IDs of this student's goals.
  const studentGoalIds = new Set(
    data.goals
      .filter((goal) => goal.studentId === studentId)
      .map((goal) => goal.id)
  );

  // Filter creates a new array; sort only changes that copy.
  return data.feedback
    .filter(
      (item) =>
        studentGoalIds.has(item.goalId) &&
        item.removed !== true
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
