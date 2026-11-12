import { makeId } from '../../utils/ids.js';
import { TODAY, startOfWeek } from '../../utils/time.js';
import { messages as M } from '../../utils/validators/account.js';

const fail = (data, error) => ({ data, result: { ok: false, error } });
const activeUser = (data, id, role) => data.users.find(user =>
  user.id === id && user.role === role && user.status === 'active');
const isDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function selectionError(data, payload, studentId) {
  if (!isDate(payload?.from) || !isDate(payload?.to)) return M.sharingDatesRequired;
  if (payload.to < payload.from) return M.sharingInvalidRange;
  if (!Array.isArray(payload.scope) || payload.scope.some(scope => !['summary', 'reports'].includes(scope)) ||
      !Array.isArray(payload.goalIds)) return M.sharingInvalidSelection;
  const week = startOfWeek(payload.from);
  if (payload.goalIds.some(id => typeof id !== 'string' || !data.goals.some(goal =>
    goal.id === id && goal.studentId === studentId && goal.weekStart === week))) return M.sharingInvalidGoals;
  if (!payload.scope.length && !payload.goalIds.length) return M.sharingEmptySelection;
  return null;
}

export function sendRequest(data, payload, ctx) {
  const student = activeUser(data, ctx?.currentUser?.id, 'student');
  if (!student) return fail(data, M.accountNotAllowed);
  if (!activeUser(data, payload?.mentorId, 'mentor')) return fail(data, M.sharingMentorUnavailable);
  const error = selectionError(data, payload, student.id);
  if (error) return fail(data, error);
  if (data.sharingRequests.some(request => request.studentId === student.id &&
      request.mentorId === payload.mentorId && ['pending', 'accepted'].includes(request.status)))
    return fail(data, M.sharingDuplicate);
  // Include persisted requests in collision checking, not just IDs made during this visit.
  let id;
  do { id = makeId('r'); } while (data.sharingRequests.some(request => request.id === id));
  const request = {
    id, studentId: student.id, mentorId: payload.mentorId, from: payload.from, to: payload.to,
    scope: [...new Set(payload.scope)], goalIds: [...new Set(payload.goalIds)], status: 'pending',
  };
  return { data: { ...data, sharingRequests: [...data.sharingRequests, request] }, result: { ok: true, request } };
}

function transition(data, id, ctx, role, before, after) {
  const actor = activeUser(data, ctx?.currentUser?.id, role);
  if (!actor) return fail(data, M.accountNotAllowed);
  const ownerKey = role === 'student' ? 'studentId' : 'mentorId';
  const request = data.sharingRequests.find(item => item.id === id);
  if (!request || request[ownerKey] !== actor.id || request.status !== before)
    return fail(data, M.sharingUnavailable);
  // Recheck live consent and participants when granting access, including stale UI clicks.
  if (after === 'accepted' && (!activeUser(data, request.studentId, 'student') ||
      selectionError(data, request, request.studentId) || data.sharingRequests.some(item =>
        item.id !== id && item.studentId === request.studentId && item.mentorId === actor.id &&
        ['pending', 'accepted'].includes(item.status)))) return fail(data, M.sharingUnavailable);
  const updated = { ...request, status: after, decidedOn: TODAY };
  return {
    data: { ...data, sharingRequests: data.sharingRequests.map(item => item.id === id ? updated : item) },
    result: { ok: true, request: updated },
  };
}

export function cancelRequest(data, id, ctx) { return transition(data, id, ctx, 'student', 'pending', 'cancelled'); }
export function revokeAccess(data, id, ctx) { return transition(data, id, ctx, 'student', 'accepted', 'revoked'); }
export function acceptRequest(data, id, ctx) { return transition(data, id, ctx, 'mentor', 'pending', 'accepted'); }
export function declineRequest(data, id, ctx) { return transition(data, id, ctx, 'mentor', 'pending', 'declined'); }
export function endSharing(data, id, ctx) { return transition(data, id, ctx, 'mentor', 'accepted', 'ended'); }
