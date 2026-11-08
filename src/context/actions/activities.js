// Phase 0 no-op actions. No validation or data changes yet.
export function addActivity(data, payload, ctx) { return { data, result: { ok: true } }; }
export function updateActivity(data, id, changes, ctx) { return { data, result: { ok: true } }; }
export function deleteActivity(data, id, ctx) { return { data, result: { ok: true } }; }
