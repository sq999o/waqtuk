// Phase 0 no-op actions. No validation or data changes yet.
export function sendRequest(data, payload, ctx) { return { data, result: { ok: true } }; }
export function cancelRequest(data, id, ctx) { return { data, result: { ok: true } }; }
export function revokeAccess(data, id, ctx) { return { data, result: { ok: true } }; }
export function acceptRequest(data, id, ctx) { return { data, result: { ok: true } }; }
export function declineRequest(data, id, ctx) { return { data, result: { ok: true } }; }
export function endSharing(data, id, ctx) { return { data, result: { ok: true } }; }
