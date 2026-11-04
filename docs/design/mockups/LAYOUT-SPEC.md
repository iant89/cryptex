# Cryptex Phase 1 — Layout Spec

## Tokens
- Source of truth: ENTERPRISE-UI `src/tokens/tokens.css` + `src/themes/dark.css` / `light.css`, unmodified, plus the Cryptex amber accent override below (Ian-approved).
- Cryptex overrides (amber from brand/final; warning shift and #B45309 are PM decisions, pending Ian's confirmation). Contrast is WCAG 2.x:
  | Token | Dark | Light |
  |---|---|---|
  | primary (accent fill) | #F59E0B (7.37:1 on surface #1d232a, 8.39:1 on bg #12171c) | #F59E0B, fills only (2.15:1 on white, so never used for text) |
  | on-primary | #1C1917 (8.14:1 on #F59E0B) | #1C1917 (8.14:1) |
  | selected-text (amber text) | #FBBF24 (9.49:1 on surface) | #B45309 (5.02 white / 4.64 bg #f5f6f7 / 4.84 selected #FFFBEB / 4.51 subtle #FEF3C7) |
  | focus | #F59E0B | #B45309 (5.02:1, needs ≥3:1) |
  | primary-hover / active | #FBB43A / #D97706 | #D97706 / #B45309 |
  | primary-subtle | rgba(245,158,11,.16) | #FEF3C7 |
  | surface-selected | rgba(245,158,11,.12) | #FFFBEB |
  | warning (fill/icon/dot) | #FF6A33 (5.55 surface / 6.32 bg) | #E04F16 (3.96:1 on white; non-text ≥3:1 OK) |
  | warning-text | #FF8A5C (6.82 surface / 6.63 on subtle) | #B93C0B (5.65 white / 5.23 bg / 5.12 on subtle) |
  | warning-subtle / border | #3A1D12 / #FF6A33 | #FFF1EB / #E04F16 |
  | on-warning | #1F0A00 (6.68:1) | #000000 (5.30:1) |
  Rule: on light, #F59E0B is never used for text or thin icons. Links/info/error keep EUI defaults.
- Default theme: dark. Desktop only (min 1280).
- Colors used: `--eui-color-{background,shell,shell-border,surface,surface-alt,surface-sunken,surface-hover,surface-selected,border,border-subtle,border-strong,text,text-secondary,text-placeholder,primary,on-primary,primary-subtle,link,selected-text}`; status `--eui-color-{success,warning,error,info,neutral}` with `-subtle/-border/-text` for badges.
- Spacing: EUI 4px scale (`--eui-space-1..6`). Used: 4, 8, 12, 16.
- Type: Geist (render substitute for EUI '72' font family) 13/18 body, 11/14 labels & table headers, 17/22 bold metric values, 18/24 bold page title; Geist Mono 12 for times, hashes, amounts (tabular-nums everywhere numbers align).
- Radius 4 (controls) / 6 (cards). Status = dot + label, never color alone.

## Frame & grid (1440×900 desktop, min supported 1280)
| Region | Size | Notes |
|---|---|---|
| Header (ApplicationHeader) | full width × 48 | left: Vault Cylinder logo lockup 28h (`logo-dark.svg` / `logo-light.svg` per theme), exchange status pill, simulation status pill (state · sim clock), speed SegmentedButton; center: SearchField 300w (Ctrl K → CommandPalette); right: alerts ButtonBadge, NotificationCenter, theme toggle, UserMenu avatar |
| Sidebar (SideNavigation) | 232 × rest | 8 groups from §4, uppercase 11px group headers (28h) w/ chevron, items 26h indent 30; active = selected surface + 3px primary left bar; footer collapse control (collapsed width 56, icons only) |
| Workspace | flex | padding 14/16, vertical gap 12; breadcrumb + Title row, then page content |
| Activity panel (closed on Dashboard, open by default elsewhere; PM decision pending Ian) | 300 right | tabs Alerts / Events / Feed; dismissible; same slot is reused by DetailPanel (DynamicSideContent) — only one right panel at a time |

## Screen 01 — Shell & navigation
- Groups expanded state persisted per user; the group containing the active route is always expanded.
- Workspace loading state = Skeleton (header strip, 4 card skeletons, table rows).
- Alerts list item: severity dot, message, mono timestamp; footer link to Incident Management.

## Screen 02 — Exchange Dashboard
- Toolbar: asset/currency Select, Activity panel toggle. (No Customize widgets in Phase 1.)
- Metrics: Grid 8 cols × 2 rows, gap 8, MetricCard ~ 64h: label (ellipsis + tooltip), value, delta (success/error text) or ProgressBar (hot wallet utilization; warning > 80%, error > 95%). Network health uses StatusIndicator.
- Lower row (flex, gap 12, fills height): Live Transaction Feed (flex) | System Map (600 fixed).
- Feed (DataGrid, 28px rows): Time, Event, Asset, Amount (right, mono), USD (right), Customer (Link → customer), Status (Badge). Toolbar: Live badge, Type/Asset/Status filters, Pause. New rows insert at top with info-subtle highlight for 2 s; paused → "N new" button. Footer: count + rate. Row click → screen 03.
- System Map: two lanes. Top: Customer → Deposit Wallets → Hot Wallets → Cold Storage. Bottom: Cold → Hot → Withdrawal Processing → Mempool/Network → Customer. Node = Card (title, balance, sub-stat, optional utilization bar); edges colored by flow (success inbound, info internal, warning outbound), dashed = pending transfer, moving dots = live tx. Asset SegmentedButton filters the map. Node click → its operational page (e.g. Hot Wallets). Warning border on threshold breach.

## Screen 03 — Transaction inspect
- Filters render as FilterTokens; footer "X of Y matching".
- Selected row = surface-selected. Right DetailPanel 300: status Badge, type/asset, amount + USD + fee, ObjectIdentifier fields (customer, source wallet → links; destination, hash mono), risk badge, Timeline of lifecycle steps (SPEC §10 withdrawal / §9 deposit steps; done = success dot, current = info bold, pending = neutral), actions Open customer / View wallet / Full view (primary).
- Detail panel replaces the System Map while open (Ian-approved).

## States (all screens)
| State | Treatment |
|---|---|
| Loading | Skeleton blocks matching final layout |
| Empty feed | EmptyState "No transactions match these filters" + Clear filters |
| Error / stream lost | MessageStrip (error) above feed: "Live feed disconnected — retrying"; Live badge → neutral "Offline" |
| Simulation paused | Header pill neutral "Paused"; feed shows "Paused" badge |
| Exchange degraded | Header status pill warning/error; matching alert pushed to Activity panel |
| Hover/focus | EUI surface-hover; focus ring `--eui-color-focus` |

## Themes
Identical layout in dark and light; only `data-eui-theme` changes. Default dark (approved). Theme toggle in header + UserSettingsDialog.
