# Cryptex — Phase 1 UI mockups (APPROVED by Ian, 2026-11-04)

Scope (PM): app shell + navigation (SPEC §4), Exchange Operations Dashboard (§5.1–5.3), dark + light themes (§18).
All frames 1440×900, rendered from real HTML using ENTERPRISE-UI `tokens.css`, `light.css`, `dark.css` (copied unchanged from `ENTERPRISE-UI/src/{tokens,themes}`) plus a small Cryptex **amber accent override** (`#F59E0B`, from `brand/final` logo), theme switched via `data-eui-theme`. Header logo = final Vault Cylinder lockup: `brand/final/logo-dark.svg` on dark, `logo-light.svg` on light (copied into `src/`). Sample data is illustrative.

Rebuild: `python3 src/build.py` (headless google-chrome). Layout details: `LAYOUT-SPEC.md`.

| Screen | Dark | Light | What it shows | ENTERPRISE-UI components / patterns |
|---|---|---|---|---|
| 01 App shell & navigation | `01-app-shell-navigation-dark.png` | `01-app-shell-navigation-light.png` | Header (status, simulation status, speed, search, notifications, profile); sidebar with all 8 §4 groups (4 expanded / 4 collapsed), active route (Hot Wallets); workspace in loading state; Activity panel open (Alerts tab) | AppShell, ApplicationHeader, SideNavigation + NavigationItem, SegmentedButton, SearchField (+ CommandPalette on Ctrl K), ButtonBadge, NotificationCenter, UserMenu, Avatar, StatusIndicator, Breadcrumbs, Title, Skeleton, Panel, ActivityFeed pattern |
| 02 Exchange Dashboard | `02-dashboard-dark.png` | `02-dashboard-light.png` | All 16 §5.1 metrics, Live Transaction Feed (§5.2) with filters/pause/new-row highlight, Exchange System Map (§5.3) with balances, utilization, pending (dashed) and live-tx dots | Dashboard pattern, Grid, MetricCard, ProgressBar, Card/CardHeader, DataGrid, Badge/StatusIndicator, Select/FilterBar, Button, SegmentedButton, Link (customer) |
| 03 Dashboard — tx inspect (interaction state) | `03-dashboard-transaction-detail-dark.png` | `03-dashboard-transaction-detail-light.png` | Feed filtered (FilterTokens), row selected, DetailPanel with tx facts, links to customer/wallet, lifecycle "follow through the system"; map hides while panel is open | FilterToken, DataGrid (selected row), DetailPanel / DynamicSideContent, ObjectIdentifier, Timeline, Badge, Link, Button |

## App-level components (approved by Ian, built in Cryptex, not in EUI)
- **System-map / flow-diagram component** (nodes + animated directed edges). Mocked with SVG; proposed as an app-level component composed from Card + ProgressBar + SVG, not a framework addition, unless Ian wants it in EUI.
- Live-row "flash" highlight for streaming DataGrid rows (small DataGrid extension or app CSS).

## Decisions (Ian, 2026-11-04)
1. Accent: amber **#F59E0B** (logo amber). Resolved.
2. Default theme: dark. Resolved.
3. Activity panel default: see PM decision 1 (pending Ian).
4. Transaction detail panel replaces the System Map (as in 03). Resolved.
5. Configurable widgets: later phase, not Phase 1. Resolved.
6. Speed steps Pause/1×/5×/20×/100×: approved. Resolved.
7. Desktop only; no mobile/tablet mockups. Resolved.
8. App-level flow-diagram (System Map) and flashing-row components: approved.

## PM decisions, pending Ian's confirmation (2026-11-04)
1. Activity panel: closed on the Dashboard and open by default on all other pages (01 shows it open; 02/03 closed). This resolves Q3, pending Ian.
2. Light theme: amber text and focus ring use **#B45309** (5.02:1 on white); #F59E0B is used only as a fill.
3. Warning moved to red-orange so it reads differently from the amber accent: dark **#FF6A33** (text #FF8A5C), light **#E04F16** (text #B93C0B). Contrast ratios are in LAYOUT-SPEC.
4. "Customize widgets" button removed (configurable widgets are a later phase).

## Open questions for Ian
- Please confirm PM decisions 1–4 above.
