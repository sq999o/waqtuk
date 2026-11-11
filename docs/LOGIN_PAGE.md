# Login page - Dev 4 batch 3

LoginPage now contains both forms from design/reference.pdf page 2 and displays the account action errors from page 24. Controlled fields call `useData().login` or `register`, then `signIn(result.user.id)` and `navigate(homeForRole(result.user.role), { replace: true })`. A successful registration signs the new student or mentor in immediately, as the work-split agreement requires. The action owns validation; `noValidate` prevents browser-native messages replacing the agreed wording.

Form errors are separate and focusable. Editing a field clears that form's error and keeps the other values. Password fields are masked. Role selection is a labelled fieldset of two radio controls; administrator registration is not offered. Preview buttons use the exact live seed accounts m1/a1 and reject missing, wrong-role or suspended records. They are required mock-prototype features, not a production authorization mechanism.

This uses the shared Card, Input, Radio, Button and Alert components. Page-scoped styles make the existing unstyled placeholders usable without editing their owners' files. Colors use the shared tokens; `.wq-g` and `.wq-main-pad` provide the shared mobile breakpoint. No packages or global CSS changed.

Integration boundaries:

- AuthLayout (Dev 2) still owns the brand/header/theme control. The page does not duplicate that header. The current AuthLayout is only a wrapper, so the full design header is not visible yet.
- DataContext persistence (Dev 2) is not on the baseline main commit 8628509. New accounts and edits currently last only until a reload. Login with the original seed users survives reload through the session work. When persistence is merged, new accounts survive reload too; this combination was tested separately.
- ThemeContext persistence and ToastContext are still placeholders owned by Dev 1. The development-only toolbar now has a theme toggle for testing both palettes and accurate status text. It is excluded from production builds. A theme reset after reload is not a LoginPage failure.
- Other role pages are still placeholders; their title and URL are sufficient to check successful navigation.

Run `node scripts/check-account-actions.mjs`, `node scripts/check-auth-session.mjs`, `npm run check:contracts`, `npm run build` and `git diff --check`. UI behavior was also tested with a temporary jsdom harness using the actual forms, providers and router, with no added project dependency. See the delivered TEST_RESULTS.txt for coverage and visual-review limits.

Manual browser checks (`npm run dev`):

1. Sign out using the development toolbar if a saved session redirects you away from `/`. Both cards should appear.
2. Submit empty Log In, then wrong credentials, then student.e@example.com / Password1. Confirm the required-fields, invalid-credentials and suspended-account messages, respectively.
3. Login student@example.com, mentor@example.com and admin@example.com with Password1. Expect /dashboard, /mentor and /admin. Sign out between tests. Reload a seed-user session once.
4. In Create an account, try an existing email, a short password and mismatched confirmation. Correcting the values should allow creation and immediate sign-in. Create one Student and one Academic Mentor, then log out and back in without reloading on the in-memory baseline.
5. Sign out and try Mentor view and Administrator view. Expect m1's /mentor and a1's /admin.
6. Use the development toolbar's light/dark toggle. Check text, borders, inputs and errors. Resize below 820px; cards and password fields should stack. Check a 390px viewport for overflow. Use Tab/Shift+Tab and Enter to check keyboard operation and visible focus.

AI assistance: ChatGPT prepared this page, scoped CSS, toolbar update and documentation and ran automated checks. Saeed reviews and performs the local browser checks before submission; retain the conversation with the team's assistance record.
