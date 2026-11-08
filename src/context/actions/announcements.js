// Phase 0 no-op actions. No validation or data changes yet.
export function saveAnnouncement(data, payload, ctx) { return { data, result: { ok: true } }; }
export function publishAnnouncement(data, id, ctx) { return { data, result: { ok: true } }; }
export function unpublishAnnouncement(data, id, ctx) { return { data, result: { ok: true } }; }
