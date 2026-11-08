// Phase 0 no-op actions. No validation or data changes yet.
export function addCategory(data, name, ctx) { return { data, result: { ok: true } }; }
export function renameCategory(data, id, name, ctx) { return { data, result: { ok: true } }; }
export function deleteCategory(data, id, reassignToId, ctx) { return { data, result: { ok: true } }; }
export function addDefaultCategory(data, name, ctx) { return { data, result: { ok: true } }; }
export function renameDefaultCategory(data, id, name, ctx) { return { data, result: { ok: true } }; }
export function setCategoryActive(data, id, active, ctx) { return { data, result: { ok: true } }; }
