# Cryptex — Phase 1 Plan (Application Foundation)

Owner: Technical Lead · Reports to: Project Manager · Status: Draft for PM review
Sources: SPEC.md §19 (architecture), §20 (financial integrity), §22 (testing), §23 Phase 1; PM-CHARTER §2.2, §5, §6, §12, Devyard addendum.

## 1. Scope

Phase 1 (SPEC §23): React + TS setup, ENTERPRISE-UI integration, app shell, navigation, theme system, dashboard layout, domain model foundation.
Out of scope: live simulation, workers, matching, blockchain, IndexedDB persistence (only the interfaces are defined here), Solidity IDE.

UI rule (CHARTER §5): Batches 2–4 change the UI, so they **do not start until the UX/UI mockups are approved by Ian** (through the PM). Batches 1 and 5 have no UI and can run now.

## 2. Architecture

- **Runtime:** Static SPA, Vite 8 + React 19 + TypeScript (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`). No backend, no network calls. Simulation only (SPEC §2.4).
- **UI:** `@enterprise-ui/react` 0.1.0 from the vendored, pinned tarball `vendor/enterprise-ui-react-0.1.0-64fcbd0.tgz` (same file and method Devyard uses: `"file:vendor/…tgz"`). No second component library (SPEC §18). Gaps go to the PM as ENTERPRISE-UI addition requests. Cryptex never patches the vendored package.
- **Layering** (SPEC §19 structure; dependencies point inward only, enforced by an ESLint `no-restricted-imports` rule in Batch 5):

| Layer | Path | May import | Notes |
|---|---|---|---|
| models | `src/models/*` | nothing | Pure types + value objects (Money, ids) |
| engines | `src/engines/*` (accounting, matching, wallet, blockchain, market, evm) | models | Pure, deterministic, no I/O, no React |
| core | `src/core/{events,state,simulation,persistence,configuration}` | models, engines | Event bus, stores, clock/RNG, repository ports |
| services | `src/services/*` | core, engines, models | Use cases that emit events and post ledger transactions |
| workers | `src/workers/*.worker.ts` | services and below | Phase 7. Same code as on the main thread, behind a message port |
| modules/components/app | `src/modules/*`, `src/components/*`, `src/app/*` | services (read via selectors), models | React only; no domain logic in components |

- **State (SPEC §19.1):** Domain state lives in plain TS stores outside React (`core/state`). React subscribes through `useSyncExternalStore` selectors with batched notifications (one flush per tick or animation frame). UI-only state stays in React. Library choice: see D2.
- **Events (SPEC §19.2):** Typed discriminated-union `DomainEvent { id, type, occurredAt, correlationId, causationId?, payload }`. In-process bus with synchronous dispatch. Handlers are idempotent and keyed by `event.id` through a processed-ids set, so a duplicate deposit notification is a no-op (SPEC §9, §20.6).
- **Persistence (SPEC §19.4):** `Repository` ports in `core/persistence` with an in-memory implementation for tests. The IndexedDB adapter (through `idb`, see D4) comes later, with a `schemaVersion` and an ordered migration list from day one. Export/import is a versioned JSON envelope (BigInt serialized as decimal strings).
- **Determinism:** All time comes from an injected `Clock` (`SimClock`, manual or tick-driven; never `Date.now()` in domain code). All randomness comes from an injected seeded `Rng` (e.g. mulberry32/xoshiro, see D5). Ids come from an injected `IdGenerator` (seeded counter/hash). Given the same seed and inputs, a simulation is bit-for-bit reproducible. Lint bans `Date.now`, `Math.random`, and `crypto.randomUUID` outside `core/simulation`.

## 3. Domain model foundation (SPEC §11, §20)

### 3.1 Money
- `Asset { code: 'BTC'|'ETH'|'USDT'|'USDC'|'SOL'|'LTC'|'XRP'|'DOGE'; decimals }`. Decimals: BTC 8, ETH 18, USDT/USDC 6, SOL 9, LTC 8, XRP 6, DOGE 8.
- `Amount = { asset, units: bigint }`. Integer base units only, never `number` (SPEC §20.1–2). Arithmetic rejects mixed assets. Parse/format goes through decimal strings with explicit rounding rules.

### 3.2 Chart of accounts (per asset)
| Type | Normal side | Examples | SPEC §11 category |
|---|---|---|---|
| Asset | Debit | `asset:wallet:deposit:<walletId>`, `asset:wallet:hot:<id>`, `asset:wallet:cold:<id>`, `asset:in-transit:<transferId>` | Exchange-controlled blockchain assets |
| Liability | Credit | `liability:customer:<custId>:available`, `liability:customer:<custId>:reserved` | Customer liabilities |
| Revenue | Credit | `revenue:trading-fees`, `revenue:withdrawal-fees` | Exchange revenue |
| Expense | Debit | `expense:network-fees` | Network fee expenses |
| Equity | Credit | `equity:operational-reserves`, `equity:opening-capital` | Operational reserves |

### 3.3 Journal
- `JournalTransaction { id, occurredAt, kind, correlationId, sourceEventId, memo, entries[] }`, `Entry { accountId, asset, side: 'debit'|'credit', units: bigint > 0 }`.
- **Invariant:** For every transaction and every asset, Σdebits = Σcredits. `post()` rejects anything unbalanced, empty, zero, or negative. Trades and conversions balance per asset leg; cross-asset legs use a `equity:conversion-clearing` account.
- The journal is **append-only**. Corrections are reversing transactions, never edits (audit trail, SPEC §20.11).
- `post()` is idempotent on `sourceEventId`, so a second post with the same id returns the existing transaction.

### 3.4 Derived balances and reconciliation
- **No stored balances are authoritative.** `balanceOf(account, asset)` = fold over entries (normal-side signed). Read models and caches can be rebuilt from the journal at any time, and a test asserts cache == fold.
- Customer "available/reserved" = the two liability sub-accounts. A withdrawal reserve moves available→reserved. A failed withdrawal moves it back (SPEC §20.7–8).
- On-chain wallet balances live in the blockchain simulator (Phase 5), separate from the ledger (SPEC §11 "never confuse").
- **Reconciliation report** (pure function, per asset): (a) trial balance = 0; (b) Σ ledger wallet-asset accounts vs Σ simulated on-chain balances (Phase 5+); (c) assets − customer liabilities − revenue + expenses − equity = 0; (d) per-wallet ledger vs chain. Discrepancies are **reported, never auto-corrected** (SPEC §20, last line).
- Wallet transfers are asset→asset (or asset→in-transit→asset for on-chain moves), so total assets are unchanged except for a separate network-fee expense entry (SPEC §20.9–10).

## 4. Testability strategy (SPEC §22)
- **Vitest** (jsdom for components, node for engines). `@testing-library/react` for UI.
- **Unit:** Money arithmetic, posting validation, balance folding, reconciliation, event-bus idempotency, Clock/Rng determinism. Engines are pure, so they get table tests and property tests (fast-check, D6) for "every transaction balances" and "sum of all accounts is zero".
- **Integration:** Services wired with the in-memory repo, fixed seed, and manual clock. Scenario scripts (e.g. deposit credited exactly once despite a duplicate event) assert the ledger, events, and reconciliation together.
- **UI tests:** Shell, navigation, and dashboard rendering from Batch 2 onward. E2E (Playwright) is deferred, see D7.
- CI job **`check`**: `npm ci` → typecheck → lint → test → build, on every PR and on pushes to main.

## 5. Batches

| # | Batch | UI? | Depends on |
|---|---|---|---|
| 1 | Scaffold + CI | No | — |
| 2 | App shell + navigation | Yes (mockup approval) | 1 |
| 3 | Theme system | Yes (mockup approval) | 2 |
| 4 | Dashboard layout | Yes (mockup approval) | 2, 3 |
| 5 | Domain model foundation | No | 1 (parallel with 2–4) |

### Batch 1 — Scaffold + CI (this PR)
Tasks: Vite + React + TS strict, vendored ENTERPRISE-UI tarball, ESLint (typescript-eslint + react-hooks), Vitest + RTL, `.nvmrc` (22), GitHub Actions `check`, this plan.
Acceptance: `npm ci && npm run check` passes locally and in CI. `@enterprise-ui/react/styles.css` is bundled. Placeholder page shows the simulation-only notice. No domain or UI beyond the placeholder.

### Batch 2 — App shell + navigation (FE Developer, after mockup approval)
Tasks: `src/app/{router,layouts,providers}`, ENTERPRISE-UI shell (header, side nav, content area, status bar), all §4 nav groups/routes as placeholder pages, `react-router` (D3), 404 route, persistent "SIMULATION" badge.
Acceptance: Every SPEC §4 entry is routable and reachable by keyboard. Active route is highlighted. Deep links work under Vite preview. RTL tests cover nav rendering and route switching. Matches the approved mockup. Only ENTERPRISE-UI components are used.

### Batch 3 — Theme system (FE Developer, after mockup approval)
Tasks: `cryptex-theme.css` overriding `--eui-*` tokens on the ENTERPRISE-UI dark/light theme, theme provider + toggle (UI state, persisted in localStorage), semantic status colors (confirmed/pending/failed/warning).
Acceptance: Theme switch applies without reload and persists. Status colors meet WCAG AA contrast. No hard-coded colors in components (lint/grep check). Matches the approved mockup.

### Batch 4 — Dashboard layout (FE Developer, after mockup approval)
Tasks: `modules/dashboard` grid with placeholders for the §5.1 metric tiles, §5.2 live-feed table (filters disabled), and the §5.3 system-map panel. Tiles read from a typed `DashboardSnapshot` selector fed by a static fixture.
Acceptance: Layout matches the mockup at 1280/1440/1920 widths. Every §5.1 metric has a slot. The feed table uses an ENTERPRISE-UI table. The fixture is swappable for live selectors without component changes. Includes RTL tests.

### Batch 5 — Domain model foundation (FE Developer / TL-reviewed, no UI)
Tasks: `models/` (Asset, Amount, ids), `engines/accounting` (chart of accounts, `post`, `balanceOf`, `trialBalance`, `reconcile`), `core/events` (typed bus, idempotent handler wrapper), `core/simulation` (Clock, seeded Rng, IdGenerator), `core/persistence` ports + in-memory repo + schema-version constant, layer-boundary lint rule, Date/Math.random ban.
Acceptance: 100% of Amount/ledger public functions are unit-tested. Property test: N random balanced transfers give trial balance 0 and stored-cache == fold. Unbalanced, mixed-asset, zero, or negative postings are rejected. A duplicate `sourceEventId` posts once. Reconciliation reports an injected discrepancy without changing data. The same seed gives identical outputs. No `number` is used for money (lint/type test).

## 6. Process (per charter)
- Each batch gets its own branch `phase1/<batch>`, one PR to `main`. Merging needs green `check` + Tech Lead approval comment + Repository Maintainer approval comment, then the Maintainer squash-merges. No force-push.
- Developers work in sustained batches with self-verification. The TL reviews at batch completion (CHARTER §6, §7.2). QA verifies UI batches against the approved mockups.
- All reporting goes through the PM (CHARTER §12).

## 7. Open tech decisions for PM
1. **D1 ENTERPRISE-UI pin:** Reuse Devyard's `0.1.0-64fcbd0` tarball (done here) or rebuild from a newer ENTERPRISE-UI commit? Who owns upgrades?
2. **D2 State library:** Hand-rolled external stores + `useSyncExternalStore` (recommended, fewer deps) vs Zustand.
3. **D3 Router:** `react-router` v7 (matches Devyard) vs TanStack Router.
4. **D4 IndexedDB wrapper:** `idb` (tiny, recommended) vs Dexie. Phase 2+.
5. **D5 RNG:** Own seeded PRNG (xoshiro128**, ~20 lines, recommended) vs `seedrandom`.
6. **D6 Property testing:** Add `fast-check` as a devDependency in Batch 5?
7. **D7 E2E:** Add Playwright + axe in Phase 1 (like Devyard) or defer to Phase 2.
8. **D8 Node version:** CI on Node 22 (`.nvmrc`). Confirm, or move to 24.
9. **D9 Mockups:** Batches 2–4 are blocked on UX/UI mockups and Ian's approval. Does the PM want one combined mockup (shell + theme + dashboard)?
10. **D10 Spec clarifications:** (a) USD valuation source and precision (price oracle in base units?); (b) does "operational reserves" mean exchange equity or a segregated wallet set?; (c) per-tier asset unlocks (§17) vs all 8 assets in §6.1 from the start; (d) cross-asset conversion clearing account (proposed in §3.3).
