# Waqtuk — Phase 0 skeleton

This handoff completes Saeed's **initial dependency that unblocks parallel development**. It is not the completed Dev 4 feature set or a finished application.

Start with **START_HERE_AR.md** for Arabic setup and GitHub handoff steps.

## Run

Use Node 24, or another version accepted by package.json (`^20.19.0 || >=22.12.0`).

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. Use **Preview student**, **Preview mentor**, or **Preview admin** in the development toolbar, then open your route. These buttons appear only under `npm run dev` and do not implement the final login page.

```bash
npm run check:contracts
npm run build
```

The 22 agreed application routes, four providers in the agreed order, all component barrels, helpers, actions, selectors, validators and JSON files are present. CSS files are intentionally empty. The runtime is React + Vite + React Router **6.30.6**, with plain CSS and no chart library.

## What is intentionally unfinished

- All 22 application pages are title-only placeholders.
- The 20 UI components and two chart components are plain, unstyled placeholders; modal focus/Esc/backdrop behavior and real charts are not implemented.
- Business actions return `{ data, result: { ok: true } }` without changing data; validators return `{ ok: true }`. This means **placeholder success, not a completed operation**.
- In particular, the login/register stubs do not return `res.user`. Do not connect the real login UI until Dev 4 replaces those stubs.
- Lists are empty and calculations are placeholder values. `getSharedData()` intentionally reveals no records. `usageFor()` returns five zero counts.
- DataContext is an in-memory scaffold, not Dev 2's completed persistent data layer. Auth resolves seed/preview IDs only, not newly registered users.
- The only temporary users are three development-only fixtures; all production JSON seed arrays remain empty as Phase 0 specifies.
- Final design, real authentication flows, seeds, permissions and feature logic belong to Phases 1 and 2.

## Team handoff

1. Saeed pushes this initial skeleton to `main` using his own Git identity.
2. Every developer clones/pulls it and creates their own `dev1/`, `dev2/`, `dev3/` or `dev4/` task branch.
3. Each owner replaces only their files. Keep exports and public signatures stable.
4. Read `docs/INTEGRATION.md` before implementing actions or DataContext.
5. Run the checks and build before every PR. Use a merge commit after review, as the team agreement requires.

The actual prototype HTML ZIP was not attached. `design/reference.pdf` is the supplied final visual reference; add the original prototype HTML files to `design/` when available.

Reference contracts: `docs/reference/Developer_Work_Split.pdf` §§2–5, §9 Phase 0 and §11; `docs/reference/Developer_Dependencies.pdf`.
Vite runtime requirements: https://vite.dev/guide/
