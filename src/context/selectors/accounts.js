const DAY_MS = 86400000;
const emptyShared = () => ({ student: undefined, activities: [], goals: [] });
const emptyUsage = () => ({ students: 0, mentors: 0, activities: 0, requests: 0, reports: 0 });
const actorFor = (data, ctx, role) => data.users.find(user =>
  user.id === ctx?.currentUser?.id && user.status === 'active' && user.role === role);

// UTC comparisons avoid DST/local-time shifts; reject normalized invalid dates.
function dayNumber(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date.getTime() / DAY_MS : NaN;
}
function dateRange(from, to) {
  const first = dayNumber(from), last = dayNumber(to);
  return Number.isFinite(first) && Number.isFinite(last) && first <= last ? { first, last } : null;
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const date = new Date(`${value}:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value ? date.getTime() : NaN;
}
function studentView(user) {
  const alias = typeof user.mentorName === 'string' && user.mentorName.trim() ? user.mentorName : 'Student';
  return { id: user.id, name: alias, mentorName: alias, email: user.email, role: user.role, status: user.status };
}
function accessFor(data, ctx, request) {
  const mentor = actorFor(data, ctx, 'mentor');
  if (!mentor || request?.mentorId !== mentor.id || request.status !== 'accepted') return null;
  const student = data.users.find(user => user.id === request.studentId && user.role === 'student' && user.status === 'active');
  const range = dateRange(request.from, request.to);
  if (!student || !range || !Array.isArray(request.scope) || !Array.isArray(request.goalIds)) return null;
  if (request.scope.some(scope => !['summary', 'reports'].includes(scope))) return null;
  const goals = data.goals.filter(goal => {
    const week = dayNumber(goal.weekStart);
    return goal.studentId === student.id && request.goalIds.includes(goal.id) &&
      Number.isFinite(week) && week <= range.last && week + 6 >= range.first;
  }).map(({ id, studentId, categoryId, weekStart, targetMinutes, direction }) =>
    ({ id, studentId, categoryId, weekStart, targetMinutes, direction }));
  return { student: studentView(student), range, goals };
}

// Keep the agreed general lookup unchanged (including login's m1/a1 previews).
export function getUser(data, ctx) { return (id) => data.users.find(user => user.id === id); }
export function myRequests(data, ctx) {
  const user = actorFor(data, ctx, 'student');
  return user ? data.sharingRequests.filter(request => request.studentId === user.id) : [];
}
export function mentorRequests(data, ctx) {
  const user = actorFor(data, ctx, 'mentor');
  return user ? data.sharingRequests.filter(request => request.mentorId === user.id) : [];
}
export function sharedStudents(data, ctx) {
  return data.sharingRequests.flatMap(request => {
    const access = accessFor(data, ctx, request);
    if (!access) return [];
    return [{ student: access.student, request: {
      ...request, scope: [...request.scope], goalIds: access.goals.map(goal => goal.id),
    } }];
  });
}
export function getSharedData(data, ctx) {
  return requestId => {
    const request = data.sharingRequests.find(item => item.id === requestId);
    const access = accessFor(data, ctx, request);
    if (!access) return emptyShared();
    const { student, range, goals } = access;
    const sharesActivity = request.scope.includes('summary') || request.scope.includes('reports');
    const activities = data.activities.filter(activity => {
      const start = timestamp(activity.start), end = timestamp(activity.end);
      const day = Math.floor(start / DAY_MS);
      return activity.studentId === student.id && end > start && day >= range.first && day <= range.last &&
        (sharesActivity || goals.some(goal => goal.categoryId === activity.categoryId &&
          day >= dayNumber(goal.weekStart) && day <= dayNumber(goal.weekStart) + 6));
    }).map(({ id, studentId, categoryId, start, end }) => ({ id, studentId, categoryId, start, end }));
    // An overnight activity belongs wholly to its start date. Private notes never leave this selector.
    return { student, activities, goals };
  };
}
export function usageFor(data, ctx) {
  return (from, to) => {
    const range = dateRange(from, to);
    if (!actorFor(data, ctx, 'admin') || !range) return emptyUsage();
    const days = range.last - range.first + 1;
    return Object.fromEntries(Object.keys(emptyUsage()).map(key => {
      const count = data.usage?.[key];
      return [key, Number.isFinite(count) && count >= 0 ? Math.round(count * days / 7) : 0];
    }));
  };
}
