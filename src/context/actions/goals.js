// Phase 0 no-op actions. No validation or data changes yet.
export function addGoal(data, payload, ctx) { return { data, result: { ok: true } }; }
export function updateGoal(data, id, changes, ctx) { return { data, result: { ok: true } }; }
export function deleteGoal(data, id, ctx) { return { data, result: { ok: true } }; }
