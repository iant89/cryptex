# Cryptex Roadmap — Checkpoint (2026-11-04)

Sources: `git log` / `gh pr list` on `iant89/cryptex`, `docs/SPEC.md`, `docs/PM-CHARTER.md`, `docs/phase1-plan.md`, `docs/design/`.
Decisions marked "per PM, 2026-11-04" were reported by the PM.

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

Review/approval status of #4–#6: see Next steps.

## Decisions

Design (see `docs/design/`):
- Logo: **Option B — Vault Cylinder** (`docs/design/brand/final/`).
- Accent: amber **#F59E0B** (fills); #F59E0B is never used for text on light.
- **#B45309** for light-theme amber text and the focus ring — approved by Ian, as reported by the PM (2026-11-04).
- **Dark theme by default.**
- **Detail panel replaces the System Map** while open.
- **Desktop only** (min width 1280).
- Activity panel: closed on the Dashboard, open on other pages (per PM, 2026-11-04).
- Warning color shifts toward red-orange (per PM, 2026-11-04).
- "Customize widgets" button removed (per PM, 2026-11-04).

Tech (per PM, 2026-11-04):
- Stack: React + TypeScript strict + Vite.
- D1: keep ENTERPRISE-UI tarball `0.1.0-64fcbd0`; the Tech Lead owns upgrades.
- D2: custom stores.
- D3: react-router v7.
- D4: `idb`.
- D5: own seeded random generator.
- D6: `fast-check` — yes.
- D7: minimal Playwright smoke test plus an axe check in Phase 1.
- D8: Node 22.
- D9: one combined mockup set.
- D10:
  - (a) USD prices come from the simulated market engine as BigInt fixed-point at 8 decimals, displayed at 2.
  - (b) Operational reserves are exchange-owned ledger accounts and wallets, separate from customer liabilities.
  - (c) All 8 assets are modeled now; tier unlocks come later.
  - (d) A clearing account for cross-asset trades is approved (kept in equity, reported per asset — phase1-plan §3.3).

## Phase 2 scope (per SPEC §23, per PM, 2026-11-04)

Customer management, assets, internal balances, the double-entry ledger, the event bus, and transaction history.

## Next steps (per PM, 2026-11-04)

1. Tech Lead review of PRs #4 (Batch 2) and #5 (Batch 3).
2. Finish PR #6 (Batch 4 dashboard, WIP).
3. QA verifies the UI batches against the approved mockups.
4. Each batch: green `check` + Tech Lead approval + Repository Maintainer approval, then squash-merge.

Batch acceptance criteria: see `docs/phase1-plan.md` §5.

Note: the Python generator scripts in `docs/design/` are kept on purpose.
