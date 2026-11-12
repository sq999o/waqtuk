// Announcement actions for the administrator. Owner: Dev 2.
import { makeId } from '../../utils/ids.js';
import { TODAY } from '../../utils/time.js';
import { validateAnnouncement, messages } from '../../utils/validators/category.js';
import { messages as accountMessages } from '../../utils/validators/account.js';

const fail = (data, error) => ({ data, result: { ok: false, error } });

function isAdmin(data, ctx) {
  return data.users.some((u) => u.id === ctx.currentUser?.id && u.status === 'active' && u.role === 'admin');
}

const replace = (data, id, changes) => ({
  ...data, announcements: data.announcements.map((a) => (a.id === id ? { ...a, ...changes } : a)),
});

// New items start as drafts. With an id, edits title, body and audience and keeps the status.
export function saveAnnouncement(data, payload, ctx) {
  if (!isAdmin(data, ctx)) return fail(data, accountMessages.accountNotAllowed);
  const check = validateAnnouncement(payload);
  if (!check.ok) return { data, result: check };
  const fields = { title: payload.title.trim(), body: payload.body.trim(), audience: payload.audience };
  if (payload.id) {
    if (!data.announcements.some((a) => a.id === payload.id)) return fail(data, messages.announcementUnavailable);
    return { data: replace(data, payload.id, fields), result: { ok: true, id: payload.id } };
  }
  const announcement = { id: makeId('n'), ...fields, status: 'draft', date: TODAY };
  return { data: { ...data, announcements: [...data.announcements, announcement] }, result: { ok: true, id: announcement.id } };
}

// Publishing sets the publication date to today.
export function publishAnnouncement(data, id, ctx) {
  if (!isAdmin(data, ctx)) return fail(data, accountMessages.accountNotAllowed);
  const item = data.announcements.find((a) => a.id === id);
  if (!item) return fail(data, messages.announcementUnavailable);
  if (item.status === 'published') return { data, result: { ok: true, id } };
  return { data: replace(data, id, { status: 'published', date: TODAY }), result: { ok: true, id } };
}

export function unpublishAnnouncement(data, id, ctx) {
  if (!isAdmin(data, ctx)) return fail(data, accountMessages.accountNotAllowed);
  const item = data.announcements.find((a) => a.id === id);
  if (!item || item.status !== 'published') return fail(data, messages.announcementUnavailable);
  return { data: replace(data, id, { status: 'unpublished' }), result: { ok: true, id } };
}
