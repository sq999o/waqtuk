// Phase 0 no-op actions. No validation or data changes yet.
export function addFeedback(data, payload, ctx) { return { data, result: { ok: true } }; }
export function reportFeedback(data, id, reason, details, ctx) { return { data, result: { ok: true } }; }
export function decideReport(data, id, decision, reason, ctx) { return { data, result: { ok: true } }; }
