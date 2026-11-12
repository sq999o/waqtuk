
import { TODAY, addDays, formatHours } from './time.js';

/**
 * Calculate the progress of a goal.
 *
 * @param {Object} goal
 * @param {number} loggedMinutes
 * @returns {{ logged: number, target: number, percent: number, status: string, diffMinutes: number }}
 */
export function goalProgress(goal, loggedMinutes) {
  const logged = loggedMinutes;
  const target = goal.targetMinutes;

  const percent = target > 0
    ? Math.min(100, Math.max(0, Math.round((logged / target) * 100)))
    : 0;

  const diffMinutes = Math.abs(target - logged);

  let status;

  if (goal.direction === 'atLeast') {
    if (logged >= target) {
      status = 'reached';
    } else {
      const weekEnd = addDays(goal.weekStart, 6);

      status = weekEnd >= TODAY
        ? 'inProgress'
        : 'missed';
    }
  } else {
    status = logged <= target
      ? 'withinLimit'
      : 'exceeded';
  }

  return {
    logged,
    target,
    percent,
    status,
    diffMinutes,
  };
}

/**
 * Return whether a goal is on track.
 *
 * @param {string} status
 * @returns {boolean}
 */
export function isOnTrack(status) {
  return (
    status === 'reached' ||
    status === 'inProgress' ||
    status === 'withinLimit'
  );
}

/**
 * Summarize how many goals are on track.
 *
 * @param {Array} goals
 * @param {Object} totalsByCategory
 * @returns {{ onTrack: number, total: number }}
 */
export function goalSummary(goals, totalsByCategory) {
  const onTrack = goals.filter((goal) => {
    const loggedMinutes = totalsByCategory[goal.categoryId] ?? 0;

    const progress = goalProgress(goal, loggedMinutes);

    return isOnTrack(progress.status);
  }).length;

  return {
    onTrack,
    total: goals.length,
  };
}

/**
 * Return the exact progress message displayed in the UI.
 *
 * @param {Object} goal
 * @param {number} loggedMinutes
 * @returns {string}
 */
export function goalMessage(goal, loggedMinutes) {
  const { status, diffMinutes } = goalProgress(
    goal,
    loggedMinutes
  );

  switch (status) {
    case 'reached':
      return 'Reached';

    case 'inProgress':
    case 'missed':
      return `Remaining ${formatHours(diffMinutes)}`;

    case 'withinLimit':
      return `Allowance remaining ${formatHours(diffMinutes)}`;

    case 'exceeded':
      return `Exceeded by ${formatHours(diffMinutes)}`;

    default:
      return '';
  }
}
