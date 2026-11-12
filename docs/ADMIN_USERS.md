# User management

Route: `/admin/users`. Implements name/email search, role/status filters, account
selection, name/email editing and status management through the existing actions.
Only student and mentor accounts are manageable; role and status detail fields are
read-only. Passwords are never rendered. The page also checks the live admin actor.

Status dialogs are bound to an account ID and intended next status. Reasons are
required by the action; failures remain visible in the dialog. Cancelling never
changes data. Suspension cancels pending sharing and revokes accepted access;
reactivation permits login but does not restore consent. The existing DataProvider
persists changes. No seed, provider, action or dependency changes are included.

Reference: design/reference.pdf pages 20 and 41. Seed agreements take precedence
over the example names/statuses in the prototype. New status-success and reactivation
copy covers states not illustrated there. Table actions do not bubble to row selection.

Validation: `node scripts/check-admin-users.mjs`, `node scripts/check-account-actions.mjs`,
`node scripts/check-shared-access.mjs`, `npm run check:contracts`, `npm run build`.
Browser acceptance: filters combine, selected details follow the row, validation
errors preserve input, cancel has no effect, reload retains edits/status, and
light/dark 390px layout keeps table scrolling inside its card.
