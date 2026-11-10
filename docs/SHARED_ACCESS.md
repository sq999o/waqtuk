# Shared access and usage - Dev 4 batch 4

This implements the selectors consumed by Dev 3's MentorStudent/MentorGoal and Dev 1's AdminDashboard. Public names and return shapes are unchanged; use the functions/values from `useData()`:

```js
const { myRequests, mentorRequests, sharedStudents, getSharedData, usageFor } = useData();
const { student, activities, goals } = getSharedData(requestId);
const counts = usageFor('2026-11-02', '2026-11-08');
// counts: { students: 14, mentors: 3, activities: 412, requests: 27, reports: 5 }
```

Request lists contain all statuses for the current active student/mentor only. `sharedStudents` contains accessible accepted requests and sanitized student records. It keeps only existing, owned, in-range goal IDs in each returned request, so stale or foreign IDs cannot inflate the shared-goals count. Suspended or missing participants, another mentor, a non-accepted request, invalid dates and malformed scope/goalIds deny access.

`getSharedData` returns `{ student: undefined, activities: [], goals: [] }` when access is unavailable. Authorized results enforce the following:

- Activities belong to this student and start inside the inclusive approved range. An overnight activity counts wholly on its starting day, even if it ends outside the range. Invalid or reversed timestamps are omitted.
- Goals must belong to the student, be explicitly selected and have a week overlapping the range. Partial-week requests remain useful; never fetch the rest of a goal's week from raw activities to calculate progress.
- Returned activities have only id/studentId/categoryId/start/end. Returned goals have only the agreed goal fields. Private notes/extra fields and passwords are omitted. Student `name` and `mentorName` both contain the mentor alias (or 'Student' if unavailable), never the private account name.
- Summary or Reports scope permits the approved activity data used for aggregate calculations. A goals-only request (empty scope, selected goals) returns only activity in those goals' categories and weeks, still clipped by START DATE to the approved range. With neither scope nor selected goals, there are no activities/goals.
- Expired calendar ranges are NOT automatically revoked: accepted historical sharing remains readable until its status changes, as required by the historical seed request.

Page owners must use the matching request's scope to decide which panels to show: `request.scope.includes('reports')` gates Weekly reports; `includes('summary')` gates summary panels. The common activities array supports the permitted calculations; it does not itself grant both panels. Find the request through `sharedStudents` using requestId. Keep the existing getSharedData return shape. `getUser` stays the general record lookup for account/previews/author names; it is not a substitute for the approved student-data selector.

`usage.json` supplies the agreed aggregate seven-day base, not counts of the live seed arrays. Only a current active admin receives totals; each value is `Math.round(base * inclusiveDays / 7)`. Invalid/reversed dates or missing/invalid counts return zeros. UTC arithmetic makes these results independent of local time and daylight saving. Usage dates are scaled as requested (including the agreed 2-8 Nov range); the admin page owns its date-input error messages.

Integration status: sharing actions, sharing seeds and the remaining pages are separate upcoming tasks. Until their real records exist, main correctly shows empty sharing lists. This batch does not invent other owners' goal IDs or modify their data files. DataContext persistence remains Dev 2's separate work. This is access filtering for the agreed mock frontend; future backend authorization must enforce it server-side.

Validation: `node scripts/check-shared-access.mjs` (12 groups), existing account/session checks, contracts, production build and whitespace checks. Fixtures are isolated and frozen; tests do not modify JSON seeds or browser storage. AI assistance: ChatGPT prepared and tested these selectors, usage seed, tests and documentation; Saeed reviews and reruns checks before submission.
