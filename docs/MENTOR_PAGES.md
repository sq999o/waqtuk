# Mentor pages

`MentorHome`, `MentorRequests` and `MentorStudents` use only the current mentor's
`mentorRequests` and `sharedStudents` selectors. Request decisions call the existing
sharing actions, so stale or unauthorized clicks return the action's exact error.

The home page shows the first pending request and the next queued request, supports
student search and selection, and links accepted access to the existing overview route.
Announcements use `announcementsFor('mentors')`; until announcement data is available,
the prototype empty state is shown.

The requests page counts live statuses, lists every pending request and displays accepted
or declined decisions with `decidedOn`. The students page filters accepted access by name
and scope and calculates shared goals and ending-soon access from the live rows.

Decline and end-sharing operations require confirmation. Successful acceptance and ending
use the prototype messages. All three pages wrap at the shared mobile breakpoint, use
theme tokens, and expose no passwords or activity notes.

Run `node scripts/check-mentor-pages.mjs`, `node scripts/check-sharing-actions.mjs`,
`node scripts/check-shared-access.mjs`, `npm run check:contracts` and `npm run build`.
