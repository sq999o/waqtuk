// Category actions. Students manage their own categories; the administrator manages defaults. Owner: Dev 2.
import { makeId } from '../../utils/ids.js';
import { validateCategoryName, categoryInUseMessage, messages } from '../../utils/validators/category.js';
import { messages as accountMessages } from '../../utils/validators/account.js';
import { messages as goalMessages } from '../../utils/validators/goal.js';

const COLORS = ['#8FB3D9', '#E58FB0', '#6CC3D6', '#F29E6D', '#7FC8A9', '#C59FE0', '#E2C35B', '#9AA7F0'];

const fail = (data, error) => ({ data, result: { ok: false, error } });
const notAllowed = (data) => fail(data, accountMessages.accountNotAllowed);

// The signed-in user, only if active and of the given role.
function actor(data, ctx, role) {
  return data.users.find((u) => u.id === ctx.currentUser?.id && u.status === 'active' && u.role === role);
}

// First palette colour not used yet, so new categories look different in charts.
function nextColor(categories) {
  const used = new Set(categories.map((c) => c.color));
  return COLORS.find((color) => !used.has(color)) ?? COLORS[categories.length % COLORS.length];
}

function ownCategory(data, id, studentId) {
  return data.categories.find((c) => c.id === id && c.type === 'custom' && c.ownerId === studentId);
}

const defaultCategory = (data, id) => data.categories.find((c) => c.id === id && c.type === 'default');

const replaceCategory = (data, id, changes) => ({
  ...data, categories: data.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
});

export function addCategory(data, name, ctx) {
  const student = actor(data, ctx, 'student');
  if (!student) return notAllowed(data);
  const check = validateCategoryName(name, { categories: data.categories, ownerId: student.id });
  if (!check.ok) return { data, result: check };
  const visible = data.categories.filter((c) => c.type === 'default' || c.ownerId === student.id);
  const category = { id: makeId('cat'), name: name.trim(), color: nextColor(visible), type: 'custom', active: true, ownerId: student.id };
  return { data: { ...data, categories: [...data.categories, category] }, result: { ok: true, id: category.id } };
}

export function renameCategory(data, id, name, ctx) {
  const student = actor(data, ctx, 'student');
  if (!student) return notAllowed(data);
  if (!ownCategory(data, id, student.id)) return fail(data, messages.categoryUnavailable);
  const check = validateCategoryName(name, { categories: data.categories, ownerId: student.id, exceptId: id });
  if (!check.ok) return { data, result: check };
  return { data: replaceCategory(data, id, { name: name.trim() }), result: { ok: true, id } };
}

// A used category needs reassignToId: its activities and goals move there, then it is deleted.
export function deleteCategory(data, id, reassignToId, ctx) {
  const student = actor(data, ctx, 'student');
  if (!student) return notAllowed(data);
  if (!ownCategory(data, id, student.id)) return fail(data, messages.categoryUnavailable);

  const mine = (record) => record.studentId === student.id && record.categoryId === id;
  const activityCount = data.activities.filter(mine).length;
  const goalCount = data.goals.filter(mine).length;
  const remaining = { ...data, categories: data.categories.filter((c) => c.id !== id) };
  if (!activityCount && !goalCount) return { data: remaining, result: { ok: true } };
  if (!reassignToId) return fail(data, categoryInUseMessage(activityCount, goalCount));

  const target = data.categories.find((c) => c.id === reassignToId && c.id !== id && c.active &&
    (c.type === 'default' || c.ownerId === student.id));
  if (!target) return fail(data, messages.categoryInvalidReassign);

  // Two goals for the same category and week are not allowed.
  const clash = data.goals.some((g) => mine(g) && data.goals.some((other) =>
    other.studentId === student.id && other.categoryId === target.id && other.weekStart === g.weekStart));
  if (clash) return fail(data, goalMessages.goalDuplicate);

  const move = (record) => (mine(record) ? { ...record, categoryId: target.id } : record);
  return {
    data: { ...remaining, activities: data.activities.map(move), goals: data.goals.map(move) },
    result: { ok: true },
  };
}

export function addDefaultCategory(data, name, ctx) {
  if (!actor(data, ctx, 'admin')) return notAllowed(data);
  const check = validateCategoryName(name, { categories: data.categories, ownerId: null });
  if (!check.ok) return { data, result: check };
  const defaults = data.categories.filter((c) => c.type === 'default');
  const category = { id: makeId('cat'), name: name.trim(), color: nextColor(defaults), type: 'default', active: true, ownerId: null };
  return { data: { ...data, categories: [...data.categories, category] }, result: { ok: true, id: category.id } };
}

export function renameDefaultCategory(data, id, name, ctx) {
  if (!actor(data, ctx, 'admin')) return notAllowed(data);
  if (!defaultCategory(data, id)) return fail(data, messages.categoryUnavailable);
  const check = validateCategoryName(name, { categories: data.categories, ownerId: null, exceptId: id });
  if (!check.ok) return { data, result: check };
  return { data: replaceCategory(data, id, { name: name.trim() }), result: { ok: true, id } };
}

// Existing records keep an inactive category; it just cannot be chosen for new ones.
export function setCategoryActive(data, id, active, ctx) {
  if (!actor(data, ctx, 'admin')) return notAllowed(data);
  const category = defaultCategory(data, id);
  if (!category) return fail(data, messages.categoryUnavailable);
  if (category.active === Boolean(active)) return { data, result: { ok: true, id } };
  return { data: replaceCategory(data, id, { active: Boolean(active) }), result: { ok: true, id } };
}
