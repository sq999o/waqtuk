# Waqtuk — Phase 4 Front-End

Waqtuk is a React front-end prototype for tracking time, managing weekly goals, and sharing selected progress with a mentor. It provides student, mentor, and administrator interfaces, with light/dark themes and responsive layouts.

**SWE 363 · Team 15 · Section 2 · Milestone 4 (Front-End)**

Repository: https://github.com/sq999o/waqtuk

## Requirements and installation

Use Node.js 24 (or a version satisfying `^20.19.0 || >=22.12.0`) and npm.

```bash
git clone https://github.com/sq999o/waqtuk.git
cd waqtuk
npm ci
npm run dev
```

Open the local address printed by Vite, normally http://localhost:5173/.
No API keys, environment variables, database installation, or backend service are required for this prototype.

## Demo accounts

These are public demonstration credentials only. Do not enter real passwords or sensitive information.

| Role | Email | Password | Home |
|---|---|---|---|
| Student | student@example.com | Password1 | /dashboard |
| Mentor | mentor@example.com | Password1 | /mentor |
| Administrator | admin@example.com | Password1 | /admin |

Additional seed users support sharing and account-status scenarios. The third mentor is `mentor.c@example.com`, with password `Password1`.

## Usage

- **Student:** sign in or register; record/edit/delete activities; manage categories and weekly goals; inspect the dashboard, calendar, and reports; use the report print action to save a PDF; request or revoke mentor sharing; read/report mentor feedback; update a profile and read announcements.
- **Mentor:** accept or decline sharing requests; search shared students; view data within the approved scope and dates; provide goal feedback; end sharing; read announcements and update a profile.
- **Administrator:** inspect usage; search/edit/suspend/reactivate accounts; manage default categories; moderate reported feedback; manage announcements.

For example, sign in as the student, request sharing with Mentor C, sign out, then sign in as Mentor C in the **same browser and origin** to accept the request. Return to the student account to inspect the updated status.

Switch the theme using the interface theme control. Development-only tools and the `/components` gallery are available under `npm run dev`; they are excluded from production builds.

## Data and prototype boundaries

Data is initialized from `src/data/*.json` and persisted in browser `localStorage`. Account switching within the same browser/origin uses the same saved dataset. This is a client-side academic prototype, not production authentication, server authorization, or cross-device synchronization. Seed passwords are demo data.

Changes survive reloads when storage is available. A changed seed dataset resets saved data. For a fresh demonstration, use a new browser profile or clear this application's site data (this removes local edits and the session). The reference dataset uses the week **2–8 November 2026**; choose that date range when comparing reference totals.

## Validation and production preview

```bash
npm run check:contracts
npm run build
npm run preview
```

The contract check validates exports, routes, provider ordering, data shapes, IDs, and selected UI rendering. It is not a substitute for manually testing all user journeys. Preview serves the generated `dist/` build locally; run the build first. Static hosting must fall back to `index.html` for client-side routes.

## Frameworks and dependencies

| Dependency | Declared version | Purpose |
|---|---|---|
| React / React DOM | ^19.2.0 | Components and rendering |
| React Router DOM | 6.30.6 | Role-based client routing |
| Vite | 8.3.6 | Development server and production build |
| @vitejs/plugin-react | 6.2.1 | React build integration |

Styling uses CSS. The committed `package-lock.json` determines installed dependency versions; use `npm ci`.

## Repository organization

- `src/pages/`: student, mentor, administrator, authentication, and development pages.
- `src/components/`: reusable UI and chart components.
- `src/context/`: authentication, data, theme, toast providers, actions, and selectors.
- `src/layouts/`: navigation and page shells.
- `src/utils/`: dates, statistics, goals, IDs, and validation.
- `src/data/`: demonstration seed data.
- `src/styles/`: shared styles and theme tokens.
- `scripts/check-contracts.mjs`: integration contract checks.
- `design/reference.pdf`: supplied visual reference.
- `docs/`: integration notes and original team agreements.
- `AI_USAGE.md`: Phase 4 AI assistance disclosure.

`.gitignore` excludes dependency installations, build outputs, logs, and local environment files.

## Team and responsibilities

| Developer | Member | Responsibilities |
|---|---|---|
| Dev 1 | Hammad Albalawi (team leader) | Activities, calendar, dashboard, reports, admin usage dashboard, time/statistics helpers, shared theme and toast components |
| Dev 2 | Fahad Altuwayjiri | Categories, announcements, profiles, data provider, form controls, sidebar |
| Dev 3 | Abdallah Al-Mogbel | Goals, feedback, moderation, mentor student/goal views, dialogs, table, app shell |
| Dev 4 | Saeed Ibrahim Alorayj | Initial repository scaffold, authentication and routing, accounts and sharing logic, login/sharing/mentor request and student-list pages, admin users, donut chart, stat card, empty state, integration documentation |

Each member contributes through their own GitHub account and task branch (`dev1/`, `dev2/`, `dev3/`, `dev4/`). Changes are reviewed and merged through pull requests. Original Phase 0 handoff documents are historical references, not the current application status.

## Design reference and submission

The supplied visual reference is [design/reference.pdf](design/reference.pdf). The course additionally requires a **reference Figma file**; the team must include its view-only URL in the Blackboard submission. An interactive Figma prototype is optional. The PDF does not replace the reference Figma requirement.

Submit the repository URL, the signed team AI declaration, and the complete AI evidence archive through Blackboard. The declaration and evidence include every member's actual AI use; `AI_USAGE.md` does not replace these attachments.
