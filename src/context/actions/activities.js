// Phase 0 no-op actions. No validation or data changes yet.
/*
  activities.js (actions)  (Owner: Dev 1)
  Pure functions: (data, ...args, ctx) -> { data, result }. They never change the data they receive.
  result is { ok: true, ... } or { ok: false, error } and a page only shows res.error.
  ctx = { currentUser }. Every export here must be an action (DataContext binds all exports).
*/

import { makeId } from '../../utils/ids.js';
import { validateActivity } from '../../utils/validators';

// Activities of the signed-in student only
function ownActivities(data, ctx) {
  return data.activities.filter(a => a.studentId === ctx.currentUser?.id);
}

// payload = { categoryId, start, end, notes }
export function addActivity(data, payload, ctx) {
  const check = validateActivity(payload, {
    activities: ownActivities(data, ctx),
    categories: data.categories
  });

  // On error nothing changes: return the same data
  if (!check.ok) {
    return { data, result: check };
  }

  const activity = {
    id: makeId('a'),
    studentId: ctx.currentUser.id,
    categoryId: payload.categoryId,
    start: payload.start,
    end: payload.end,
    notes: payload.notes || ''
  };

  // A new array, so the old data is never changed
  return {
    data: {
      ...data,
      activities: [...data.activities, activity]
    },
    result: { ok: true, id: activity.id }
  };
}

export function updateActivity(data, id, changes, ctx) {
  const old = ownActivities(data, ctx).find(a => a.id === id);

  if (!old) {
    return {
      data,
      result: { ok: false, error: 'Activity not found.' }
    };
  }

  // The id and the owner can never be changed by an edit
  const updated = { ...old, ...changes, id: old.id, studentId: old.studentId };

  // The edited activity is left out, so it does not overlap itself
  const others = ownActivities(data, ctx).filter(a => a.id !== id);

  const check = validateActivity(updated, {
    activities: others,
    categories: data.categories
  });

  if (!check.ok) {
    return { data, result: check };
  }

  return {
    data: {
      ...data,
      activities: data.activities.map(a =>
        a.id === id ? updated : a
      )
    },
    result: { ok: true }
  };
}

export function deleteActivity(data, id, ctx) {
  const old = ownActivities(data, ctx).find(a => a.id === id);

  if (!old) {
    return {
      data,
      result: { ok: false, error: 'Activity not found.' }
    };
  }

  return {
    data: {
      ...data,
      activities: data.activities.filter(a => a.id !== id)
    },
    result: { ok: true }
  };
}
