// Activity validator: required fields, end after start, overlap and no future activities. Owner: Dev 1.

import { isFuture, formatDateLong, formatActivityRange } from '../time.js';

export const messages = {
  activityRequired: 'Category, start and end date and time are required.',
  activityFuture: 'Activities cannot be in the future.',
  activityEndBeforeStart: 'End must be later than start.',
  activityOverlap: 'This time overlaps an existing activity'
};

export function validateActivity(a, { activities = [], categories = [] } = {}) {

  if (!a || !a.categoryId || !a.start || !a.end) {
    return { ok: false, error: messages.activityRequired };
  }

  const validCategory = categories.some(c => c.id === a.categoryId);

  const startDate = new Date(a.start);
  const endDate = new Date(a.end);

  if (
    !validCategory ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return { ok: false, error: messages.activityRequired };
  }

  if (endDate <= startDate) {
    return { ok: false, error: messages.activityEndBeforeStart };
  }

  for (const other of activities) {
    if (a.start < other.end && a.end > other.start) {

      const date = formatDateLong(other.start.slice(0, 10));
      const shortDate = date.replace(/ \d{4}$/, '');
      const time = formatActivityRange(other.start, other.end);

      return {
        ok: false,
        error: `${messages.activityOverlap} (${shortDate}, ${time}).`
      };
    }
  }

  if (isFuture(a.start)) {
    return { ok: false, error: messages.activityFuture };
  }

  return { ok: true };
}

