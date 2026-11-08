# Integration notes for all four developers

Scope: the Phase 0 skeleton from the 7 Nov 2026 agreement. The latest developer agreement takes priority over the older Phase 3 division of roles.

## Ownership and replacement

| Developer | First replacement work after cloning |
|---|---|
| Dev 1 — Hammad | theme/global CSS; ThemeContext and ToastContext; time/stats helpers |
| Dev 2 — Fahad | DataContext persistence; ids; form controls; Sidebar/AuthLayout; component gallery |
| Dev 3 — Abdallah | Modal/dialog/table/segmented controls; Topbar/AppShell; goal helpers |
| Dev 4 — Saeed | Complete auth/login; shared cards/chart; account/sharing seeds, actions and selectors |

Each existing file remains owned by the person in the agreement. Do not interpret a placeholder written for Phase 0 as ownership of that person's feature. All CSS is intentionally empty; the development toolbar is intentionally unstyled.

The frozen UI/chart barrels use named exports. Pages and layouts use default exports. Contexts export their named Provider and hook. New exports in action/selector modules must be functions: DataContext binds every export automatically.

## Multi-argument actions

The public APIs in section 4 contain `updateUser(id, changes)`, `reportFeedback(id, reason, details)`, etc. The one-argument wrapper in the document's example would discard arguments. This scaffold preserves the public calls:

```js
// Page (unchanged public API)
updateUser(id, changes);

// context/actions/accounts.js
export function updateUser(data, id, changes, ctx) {
  // Return { data: nextData, result: { ok: true } } or an error result.
}

// DataContext: retain this calling convention when replacing the scaffold.
const out = fn(currentData, ...args, ctx);
```

An action always receives data first and ctx last. The ordinary single-payload example still works as `(data, payload, ctx)`. Keep internal-only helpers unexported, because the action barrel automatically exposes all exports. Dev 2 should retain the synchronous data reference when implementing updates so consecutive calls do not overwrite one another with stale state.

All actions are currently no-ops, including login and register. Their `{ ok: true }` is only the agreement's scaffold response. Login/register will need `{ ok: true, user }` in Phase 1 before LoginPage is connected.

## Validators and MESSAGES

Every validator file exports its own `messages`. `index.js` keeps the `export *` lines and explicitly combines those four objects into `MESSAGES`, as section 5.6 requires. Import `MESSAGES` from the barrel, or `messages` directly from its owning validator file; do not import an ambiguous `messages` from the barrel. Coordinate distinct keys between owners so one text does not overwrite another.

## Sessions and temporary users

Provider order is BrowserRouter → ThemeProvider → ToastProvider → AuthProvider → DataProvider → App. Auth stores only `{ userId, role }` under `waqtuk.session`. DataContext derives currentUser from its users and useAuth().userId. Guards verify that this current user exists, is active and has the requested role.

The three temporary preview records in `src/dev/previewUsers.js` are enabled only in development and only when users.json is empty. They use the agreed s1/m1/a1 IDs, but are not the complete seed. DevelopmentTools and `/components` are excluded from production builds. A fresh production build therefore shows only the title-only LoginPage until the team implements the feature.

Phase 0 Auth.signIn resolves seed/preview IDs only. When implementing Phase 1, Dev 4 and Dev 2 must connect lookup to current users, including a newly registered account, without introducing a circular Auth/Data provider dependency. Do not infer completion of real login, registration or suspension from the development preview.

DataContext intentionally does not persist business data yet, so it cannot save empty Phase 0 seeds over the later real dataset. Dev 2 adds `waqtuk.data.v1` persistence and reset behavior. Theme persistence and toast delivery are Dev 1's work.

## Private data and usage placeholders

`getSharedData(requestId)` returns `{ student: undefined, activities: [], goals: [] }`. Check for `student` before rendering details. It does not grant access while the actual permission rule is missing. `sharedStudents` is empty. Dev 4 implements accepted-request, mentor, date, scope and selected-goal restrictions in Phase 1.

`usageFor(from,to)` returns `{ students:0, mentors:0, activities:0, requests:0, reports:0 }`. Dev 4 replaces it using the seven-day base counts and inclusive range scaling in section 10.1. AdminDashboard can use the return shape immediately.

## Prototype

`design/reference.pdf` is the final attached design, not recreated HTML. The actual `Waqtuk_Prototype_Site.zip` was not supplied. Place its files in `design/` when available. The original documents used for the scaffold are in `docs/reference/`.
