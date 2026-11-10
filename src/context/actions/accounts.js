import { makeId } from '../../utils/ids.js';
import { TODAY } from '../../utils/time.js';
import { messages as M, validateEmail, validateRegistration } from '../../utils/validators/account.js';

const fail = (data, error) => ({ data, result: { ok: false, error } });
const normalizeEmail = email => email.trim().toLowerCase();
// Resolve authorization from the current data, including a just-suspended account.
const actorFor = (data, ctx) => data.users.find(user => user.id === ctx?.currentUser?.id && user.status === 'active');
const canManage = (data, ctx) => actorFor(data, ctx)?.role === 'admin';
const manageable = user => user && ['student', 'mentor'].includes(user.role);
const saveUser = (data, user) => ({
  data: { ...data, users: data.users.map(item => item.id === user.id ? user : item) },
  result: { ok: true, user },
});

export function register(data, payload, ctx) {
  const check = validateRegistration(payload, { users: data.users });
  if (!check.ok) return { data, result: check };
  const role = payload.role === undefined ? 'student' : payload.role;
  const name = payload.name.trim();
  const user = {
    id: makeId(role === 'student' ? 's' : 'm'), name,
    ...(role === 'student' ? { mentorName: name } : {}),
    email: normalizeEmail(payload.email), password: payload.password, role, status: 'active',
  };
  return { data: { ...data, users: [...data.users, user] }, result: { ok: true, user } };
}

export function login(data, email, password, ctx) {
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password)
    return fail(data, M.accountLoginRequired);
  const user = data.users.find(item => normalizeEmail(item.email) === normalizeEmail(email));
  if (!validateEmail(email).ok || !user || user.password !== password)
    return fail(data, M.accountInvalidCredentials);
  if (user.status !== 'active') return fail(data, M.accountSuspended);
  return { data, result: { ok: true, user } };
}

function editDetails(data, user, changes, studentProfile) {
  // Only name and email may be edited. Never spread the submitted fields into a user.
  const name = changes?.name === undefined ? user.name : changes.name;
  const email = changes?.email === undefined ? user.email : changes.email;
  if (typeof name !== 'string' || !name.trim() || (studentProfile && (typeof email !== 'string' || !email.trim())))
    return fail(data, studentProfile ? M.accountProfileRequired : M.accountNameRequired);
  const check = validateEmail(email);
  if (!check.ok) return { data, result: check };
  if (data.users.some(item => item.id !== user.id && normalizeEmail(item.email) === normalizeEmail(email)))
    return fail(data, studentProfile ? M.accountEmailUsed : M.accountDuplicateEmail);
  return saveUser(data, { ...user, name: name.trim(), email: normalizeEmail(email) });
}

export function updateProfile(data, changes, ctx) {
  const user = actorFor(data, ctx);
  if (!user) return fail(data, M.accountNotAllowed);
  return editDetails(data, user, changes, user.role === 'student');
}

export function updateUser(data, id, changes, ctx) {
  if (!canManage(data, ctx)) return fail(data, M.accountNotAllowed);
  const user = data.users.find(item => item.id === id);
  if (!user) return fail(data, M.accountUnavailable);
  if (!manageable(user)) return fail(data, M.accountNotAllowed);
  return editDetails(data, user, changes, false);
}

export function setUserStatus(data, id, status, reason, ctx) {
  if (!canManage(data, ctx)) return fail(data, M.accountNotAllowed);
  const user = data.users.find(item => item.id === id);
  if (!user) return fail(data, M.accountUnavailable);
  if (!manageable(user)) return fail(data, M.accountNotAllowed);
  if (!['active', 'suspended'].includes(status)) return fail(data, M.accountInvalidStatus);
  if (user.status === status)
    return fail(data, status === 'suspended' ? M.accountAlreadySuspended : M.accountAlreadyActive);
  if (typeof reason !== 'string' || !reason.trim()) return fail(data, M.accountReasonRequired);
  const updated = saveUser(data, { ...user, status, statusReason: reason.trim() });
  if (status === 'suspended') {
    updated.data.sharingRequests = data.sharingRequests.map(request => {
      if (request.studentId !== id && request.mentorId !== id) return request;
      if (!['pending', 'accepted'].includes(request.status)) return request;
      return { ...request, status: request.status === 'pending' ? 'cancelled' : 'revoked', decidedOn: TODAY };
    });
  }
  return updated;
}
