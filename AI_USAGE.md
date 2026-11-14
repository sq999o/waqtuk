# AI Usage

## Phase 4 – Front-End

### Saeed Ibrahim Alorayj — 202338250 — Dev 4

**Tool:** OpenAI ChatGPT, including its coding/workspace assistant (Codex). Exact model labels for earlier sessions were not retained; consult the original conversation exports rather than assuming a model version. No other assistant or autocomplete tool is asserted on Saeed's behalf.

**Purposes:** interpreting project requirements and integration contracts; generating the initial repository skeleton and Dev 4 implementation; explaining React and Git workflows; debugging account/sharing behavior and UI integration; preparing manual tests and patches; updating final submission documentation and this disclosure.

**Affected files/areas:**

- Initial scaffold: `package.json`, `package-lock.json`, Vite setup, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/routes.jsx`, original placeholder modules/barrels, `scripts/check-contracts.mjs`, and initial handoff documentation. Later implementations by teammates are their own contributions and require their own declarations.
- Authentication/accounts/sharing: `src/context/AuthContext.jsx`, `src/context/authSession.js`, `src/context/actions/accounts.js`, `src/context/actions/sharing.js`, `src/context/selectors/accounts.js`, `src/utils/validators/account.js`, and `src/data/users.json`, `sharing.json`, `usage.json`.
- Dev 4 pages and associated CSS: `src/pages/auth/LoginPage.*`, `src/pages/student/Sharing.*`, `src/pages/mentor/MentorHome.*`, `MentorRequests.*`, `MentorStudents.*`, and `src/pages/admin/AdminUsers.*`.
- Shared Dev 4 components and CSS: `src/components/charts/DonutChart.*`, `src/components/ui/StatCard.*`, and `EmptyState.*`.
- Final integration patch: `src/context/ToastContext.jsx`, `src/components/ui/Toast.css`, and `src/utils/validators/index.js`.
- Documentation: `README.md`, this file, `docs/AI_ASSISTANCE.md`, declaration draft, submission instructions, and evidence inventory.

**Verification:** build and contract checks were used. Saeed reported that the 25 supplied manual checks passed, with a toast-background issue then identified. The final patch was checked against main commit `aed8839` on 14 November 2026; the build and contract checks passed (151 exports and 22 routes), and the ambiguous `messages` export warning was resolved. Visual verification of the final toast patch and the complete team acceptance walkthrough remain separate from those checks.

**Evidence:** full, unedited original conversations and intermediate generated artifacts must accompany the team's Blackboard evidence ZIP. The supplied artifact collection is partial and is not a substitute for conversation exports. Saeed must review this record against all his original sessions and add any omitted tools, files, or conversations before signing.

### Other team members

Each teammate must add their own actual tools, affected files, and evidence references. This section makes no declaration on their behalf. The supplied `Waqtuk_Design_Instructions.pdf` states that Claude assisted the design; the member responsible must disclose that use and provide the complete conversation. Do not attribute it to Saeed without confirmation.
