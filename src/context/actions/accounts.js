// Phase 0 no-op actions. No validation or data changes yet.
export function register(data, payload, ctx) { return { data, result: { ok: true } }; }
export function login(data, email, password, ctx) { return { data, result: { ok: true } }; }
export function updateProfile(data, changes, ctx) { return { data, result: { ok: true } }; }
export function updateUser(data, id, changes, ctx) { return { data, result: { ok: true } }; }
export function setUserStatus(data, id, status, reason, ctx) { return { data, result: { ok: true } }; }
