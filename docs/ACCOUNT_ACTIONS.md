# Account actions - Dev 4 batch 2

This replaces the five account action placeholders and three validators. LoginPage is still a placeholder; the next task connects its forms. Data persistence remains owned by Dev 2. Main's in-memory DataContext loses new accounts and edits on reload until that persistence change is merged.

Pages call these through `useData()`:

```js
const result = register({ name, email, password, confirmPassword, role });
// role: 'student' or 'mentor'; omitted role defaults to student.
const result = login(email, password);
// Both return { ok: true, user } or { ok: false, error }.
// After success the page calls signIn(result.user.id), then navigates homeForRole(result.user.role).
updateProfile({ name, email });
updateUser(id, { name, email }); // active admin; student/mentor targets only
setUserStatus(id, 'suspended', reason); // or 'active'; nonblank reason required
```

Actions are pure and return `{ data, result }` internally. Failed actions retain the input data reference. Login does not create a session itself. Names and email edges are trimmed; emails are compared/stored lowercase; passwords are compared exactly, without trimming. Registration only copies allowed fields and generates the ID. Profile/admin edits only copy name/email and preserve mentorName (including Student A's agreed alias). Successful mutations return the updated `user`.

Suspension updates matching student AND mentor requests: pending -> cancelled, accepted -> revoked, decidedOn -> TODAY. Terminal and unrelated requests are unchanged. Reactivation never restores old sharing. `statusReason` is an optional user field holding the latest trimmed status-change reason; the UI need not display it.

Error/success strings use `MESSAGES.account*` from the validators barrel. Prototype sources: design/reference.pdf page 24 (login/signup), 32 (student profile), 39 (mentor profile), 41 (admin users). Student and mentor profile duplicate/required messages intentionally differ. Defensive permission, missing-account, invalid-role/status and already-active messages cover cases not illustrated in the PDF. Admin management excludes admin accounts, consistent with the Student/Mentor account-management scope. This is the course's mock frontend account model; passwords remain mock data as specified by the agreement.

Validation:

```sh
node scripts/check-account-actions.mjs
node scripts/check-auth-session.mjs
npm run check:contracts
npm run build
git diff --check
```

The first command exercises active seed login, student/mentor registration, email normalization, duplicate/invalid credentials, protected fields, current admin permissions, suspension cascades, reactivation and immutability. Its fixtures are isolated in memory and never change JSON seeds or browser storage.

AI assistance: ChatGPT prepared this account logic, validators, test script and handoff documentation; Saeed reviews and tests it before committing. Keep this conversation with the team's existing assistance record.
