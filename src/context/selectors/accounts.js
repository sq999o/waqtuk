// Phase 0 selectors. Empty results are intentional; implement in Phase 1.
export function getUser(data, ctx) { return (id) => data.users.find(user => user.id === id); }
export function myRequests(data, ctx) { return []; }
export function mentorRequests(data, ctx) { return []; }
export function sharedStudents(data, ctx) { return []; }
export function getSharedData(data, ctx) { return (requestId) => ({ student: undefined, activities: [], goals: [] }); }
export function usageFor(data, ctx) { return (from, to) => ({ students: 0, mentors: 0, activities: 0, requests: 0, reports: 0 }); }
