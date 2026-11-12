# Sharing actions (Dev 4)

The six frozen exports in `context/actions/sharing.js` now implement request consent.
Pages call them through `useData()` and display `result.error` verbatim on failure.
Success returns `{ ok: true, request }`; failures leave the original data unchanged.

`sendRequest({ mentorId, from, to, scope, goalIds })` derives studentId from the live
signed-in student and creates a fresh pending request. Scope is an explicit array
containing only `summary` and/or `reports`; goalIds is an explicit array of that
student's goals from the Monday week containing `from`. Goals-only sharing works.
An empty selection, malformed date, unavailable mentor or invalid goal is rejected.
Duplicate selections are deduplicated; injected IDs, status and studentId are ignored.

| Action | Actor | Transition |
| --- | --- | --- |
| cancelRequest(id) | Owning student | pending → cancelled |
| revokeAccess(id) | Owning student | accepted → revoked |
| acceptRequest(id) | Addressed mentor | pending → accepted |
| declineRequest(id) | Addressed mentor | pending → declined |
| endSharing(id) | Addressed mentor | accepted → ended |

Every transition records the agreed TODAY (2026-11-07) in decidedOn. Actors are
resolved from current data; acceptance also rechecks the student's active status
and selected goals/scope. Repeated/stale actions fail. Dates do not auto-expire consent.
Only one pending/accepted request per student/mentor pair is permitted. To change
scope, cancel/revoke first, then send a NEW pending request; retain the old history.
Revoking/ending removes selector access immediately; reactivation never restores it.

Prototype messages (PDF pages 30/34) and additional defensive messages live in the
existing account validator's messages object; the frozen MESSAGES barrel picks them up.
No UI or seed changes in this batch. The agreed seed requests refer to goal IDs owned
by Dev 3; finish their mapping when those goal records exist. Tests use isolated fixtures.

Run `node scripts/check-sharing-actions.mjs`, then existing shared-access, account,
session and contract checks and `npm run build`. No new dependency is required.
