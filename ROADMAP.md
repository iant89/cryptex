# Cryptex Roadmap — Checkpoint (2026-11-04)

Sources: `git log` / `gh pr list` on `iant89/cryptex`, `docs/SPEC.md`, `docs/PM-CHARTER.md`, `docs/phase1-plan.md`, `docs/design/`.
Anything not recorded in those sources is marked **TBD**.

## Merged to `main`

| PR | Title | Merge commit |
|---|---|---|
| #1 | docs: add CONTRIBUTING.md | `3944bde` |
| #2 | Phase 1: plan and scaffold (Batch 1) | `e968908` |
| #3 | Phase 1 Batch 5: domain model foundation (no UI) | `166ffe6` (Tech Lead approved at head `2fb937f`) |

## In progress (Front-End Developer)

| PR | Branch | Last commit | State |
|---|---|---|---|
| #4 | `phase1/batch2-app-shell` | `6e36d6a` Merge origin/main (Batch 5) into phase1/batch2-app-shell | Open, CI green |
| #5 | `phase1/batch3-theme` (depends on #4) | `f2cc5bb` Merge branch 'phase1/batch2-app-shell' into phase1/batch3-theme | Open, CI green |
| #6 | `phase1/batch4-dashboard` (depends on #4, #5) — **WIP** | `a021b35` WIP: batch 4 dashboard (pause for project switch) | Open, CI not reported |

Review/approval status of #4–#6: **TBD**.

## Decisions

Design (see `docs/design/`):
- Logo: **Option B — Vault Cylinder** (`docs/design/brand/final/`).
- Accent: amber **#F59E0B** (fills); **#B45309** for amber text/focus on the light theme (#F59E0B is never used for text on light). The `#B45309` shift is recorded in LAYOUT-SPEC as a PM decision pending Ian's confirmation.
- **Dark theme by default.**
- **Detail panel replaces the System Map** while open.
- **Desktop only** (min width 1280).
- Activity panel default (closed on Dashboard): PM decision pending Ian — **TBD**.

Tech (from SPEC / phase1-plan / `package.json`):
- React + TypeScript strict + Vite; ENTERPRISE-UI vendored tarball `0.1.0-64fcbd0` (D1 upgrade ownership: **TBD**).
- Node 22 (`.nvmrc`, CI `check`) (D8).
- `idb` is a dependency (D4); `fast-check` is a devDependency (D6).
- D2 state library, D3 router, D5 RNG, D7 E2E/Playwright, D9 mockup format: final PM answers not recorded — **TBD**.
- D10 spec clarifications (USD valuation source, operational reserves meaning, per-tier asset unlocks): **TBD**. Conversion clearing: kept in equity and reported separately per asset (phase1-plan §3.3).

## Next steps (from `docs/phase1-plan.md`)

1. Batch 2 — App shell + navigation (PR #4): every SPEC §4 route reachable, keyboard nav, 404, SIMULATION badge, RTL tests, matches mockup.
2. Batch 3 — Theme system (PR #5): `cryptex-theme.css`, persisted toggle, WCAG AA status colors, no hard-coded colors.
3. Batch 4 — Dashboard layout (PR #6, WIP): §5.1 tiles, §5.2 feed table, §5.3 system map, fixture-fed `DashboardSnapshot`, 1280/1440/1920 layouts, RTL tests.
4. Each batch: green `check` + Tech Lead approval + Repository Maintainer approval, then squash-merge. QA verifies UI batches against approved mockups.
5. Resolve open decisions D1–D10 above. Phase 2 scope/timing: **TBD**.
