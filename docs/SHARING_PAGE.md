# Sharing page and seed requests (Dev 4)

The student route /sharing now uses the shared controls, confirmation dialog and
useData actions. Active mentors are selectable; goals come from myGoals for the
week of the start date (the agreed TODAY week before a date is entered). Changing
weeks clears the old goal selection. Review Scope previews choices without mutation.
Submission displays the action's error verbatim or the prototype pending-success
message and toast. Cancel/revoke require confirmation and recheck live state.

Existing access shows pending requests first, plus accepted and terminal history.
Only pending/accepted requests expose the appropriate action. Deleted goal names
fall back to Unavailable goal; stale selection never grants access to a removed goal.
CSS is page-scoped, uses theme tokens and the shared wq-g mobile breakpoint. Layout
navigation stays in AppShell. The prototype source is design/reference.pdf pages 9/30.

Seven seed requests now match the work-split agreement: r3 uses Dev 3's actual g7/g8
for Student B's previous-week goals; r7 uses g6 for Student F. Mentor A starts with
2 pending, 3 accepted, 1 declined and 3 shared goals. Activities remain Dev 1's data.

Changing sharing.json changes DataContext's seed fingerprint: existing locally saved
mock data is reinitialized from the combined seed on reload. This is existing shared
persistence behaviour, not a new reset action or a Git data change.

Run node scripts/check-sharing-page.mjs (5 groups), the sharing-action/shared-access
checks, npm run check:contracts and npm run build. Manual browser checklist ships
with the patch; no new dependency or public API changes.
