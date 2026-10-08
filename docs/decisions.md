# Architecture decisions

Dated log of decisions that future sessions need to know about but that don't belong in code comments. Newest first.

## 2026-10-07 — Emission Dashboard investigated; React route namespace moved to `/dashboard/emission-dashboard`

**What happened:** the user asked for the Angular `/report/emission-dashboard` page (the app's main
"Emission Overview", plus its `/equipment` sub-route) to be investigated for porting, following the
same procedure used for the Annual Report and Monthly Summary. Full findings, API/SQL trace,
documented bugs and open questions are in `docs/EMISSION_DASHBOARD_ANALYSIS.md`. No React code
written yet.

**Decision:** React routes are `/dashboard/emission-dashboard` and
`/dashboard/emission-dashboard/equipment`, not Angular's `/report/…`. Angular only nested this page
under `/report` because it shares `MonitorModule` with the report pages; it is a dashboard.

**Open consequence (not decided here):** Angular's `/dashboard` is the *GHG Setup* module, and React's
`ROUTES.DASHBOARD` (`/dashboard`) is the post-login redirect target and still a scaffold page. See
Q1 in the analysis doc before registering these routes.

**Follow-up (same day): implemented.** Decisions are recorded in the analysis doc's Section F. Ones
other sessions must know: `/dashboard` redirects to `/dashboard/emission-dashboard` and GHG Setup
will move to `/setup`; every chart uses Highcharts (modules registered in the shared
`HighchartsChart.jsx`, with `fallbackToExportServer` forced off so chart data never leaves the
app); chart colours come from the app palette, not Angular's; the Site/Plant filter lives in the
page title row; the dashboard sidebar is chosen by route group and enforces the per-site access
check Angular only intended; loading/error states are deferred by request.

## 2026-09-30 — Monthly Summary visual layer rebuilt from an approved design handoff; MultiSelect promoted to shared components

**What happened:** same pattern as the GHG Report's redesign earlier the same day — the first
Monthly Summary implementation (built same-day, functional-parity port of Angular's
`MonthlySummaryComponent`) made its own chart-color/chart-chrome calls since no design handoff
existed yet. The user then supplied an approved handoff
(`C:\Users\gpetkar\Desktop\report page code\MonthlyGHGSummary.jsx` + `monthlyGhgData.js`) and
asked for it ported accurately, explicitly calling out two things: don't invent new colors (find
the nearest existing token when the design's hex has no exact match) and don't touch the
Highcharts series colors at all (chart-color review is a separate, later task).

**What was built:** see `docs/MONTHLY_SUMMARY_ANALYSIS.md`'s "Visual layer" section for the full
breakdown. `useMonthlySummaryData.js`/`monthlySummaryAdapters.js` were re-derived to match the
handoff's data shapes (`period`/`overall`/`scopes`/`sites`/`plants`/`equipment`) but still source
from the same real `output/monthlyReport` call — no backend contract change. New:
`monthlySummaryTheme.js` (color/font token mapping — every hex resolved to an existing token
except one chart-gridline color with no exact match, which uses the nearest existing token rather
than a new literal), `components/monthlyChartOptions.js` (Highcharts option builders, chart
*chrome* sourced through tokens but every value identical to the handoff's own literals — series
colors passed through unchanged per instruction), `components/MonthlySummaryPrimitives.jsx`
(Bullets/Legend/ChartHeader).

**A real bug caught twice in one day**: `MultiSelect` (promoted to
`src/components/common/MultiSelect/MultiSelect.jsx`, same "genuinely reusable, don't page-scope
it" reasoning as `Dropdown`/`YearPicker`/`AppTabs`) initially used MUI's `MenuItem` inside a bare
`Popover` — the exact same "MUI: MenuListContext is missing" crash already hit and fixed once
this same day in the GHG Report's `SiteSelect`. Caught and fixed the same way (swap `MenuItem` for
a plain `ButtonBase`) before it shipped, plus a full-codebase grep confirming no third instance
exists. **Any future custom Popover-based menu/list in this app must use `ButtonBase`, never
`MenuItem`, unless it's wrapped in a real `Menu`/`MenuList` (or `<Select>`/`<TextField select>`,
which provide that context automatically)** — `MenuItem` has zero standalone rendering behavior
outside that context; it doesn't fail quietly, it throws.

**Sidebar/top bar**: the handoff ships its own `EmptySidebar`/`EmptyTopBar` placeholders (by
design — handoffs are page-content-only). Neither is used; this page already renders inside the
app's real `DashboardLayout` via routing, same as the Annual Report and every other `/report/**`
page.

**How to apply:** when a design handoff's color object doesn't have an exact match in
`componentTokens`/`tokens.js`, default to the *nearest* existing token (documented inline, e.g.
`monthlySummaryTheme.js`'s `grid` mapping) rather than extending the theme file — that's a
narrower rule than the GHG Report pass the day before, which did add a few new tokens
(`componentTokens.chrome`) for values with no close match at all. Ask which policy applies before
assuming; this session's explicit instruction was "search for similar, don't invent," which reads
as "prefer reuse over addition" even where a value isn't byte-identical.

## 2026-09-30 — GHG Report visual layer rebuilt from an approved design handoff, replacing a first-pass generic-MUI version

## 2026-09-30 — Audited the GHG Report components for hardcoded colors outside componentTokens; added `componentTokens.chrome`

**What happened:** after promoting `Dropdown`/`YearPicker`/`AppTabs`/`TonalButton`/`FieldTrigger`
to `src/components/common/` (see the entry below), the user asked directly whether any color/font
in these — or the report page itself — was bypassing `componentTokens` (`muiTheme.js`), since the
whole point of moving them was app-wide consistency. A full grep for literal hex values across
`src/pages/report/` and the new shared components turned up two categories of problem:

1. **A real mapping bug**: `ghgReportTheme.js`'s `C.borderSoft` pointed at `componentTokens.border.divider`
   (`#F0EBE3`) with a comment claiming it equaled `#F5F1EB` — it doesn't; `border.row` is the
   token that actually equals `#F5F1EB`. Wrong value silently in use since the design was first
   ported. Fixed.
2. **~20 literal hex values** the port carried over unchanged from the design handoff's own `C`
   object, never cross-checked against `componentTokens` individually (only the *first* pass's
   handful of values got that treatment — see the entry below). Some were exact-match duplicates
   of existing tokens used as raw hex instead of a reference (`#EFE8DF`→`border.menu`,
   `#5A554E`→`text.muted`, `#FBF8F3`→`surface.hoverRow`, `#fff`→`surface.card`, `#F5F1EB`→`border.row`).
   The rest had no existing match at all (nav-button tones, a muted icon accent, disabled-year
   text, a card header border, the page's own root text color, etc.).

**Fix:** added a new `componentTokens.chrome` section in `muiTheme.js` for the values with no
existing match (each commented with what it's for), and replaced every literal hex in
`src/pages/report/` and `src/components/common/{Dropdown,YearPicker,AppTabs,TonalButton,FieldTrigger}`
with a `componentTokens`/`C` (the report page's local alias file) reference. `ghgReportTheme.js`'s
header comment now explains `C` is just readability aliasing — the shared components under
`src/components/common/` import `componentTokens` directly and don't depend on this file at all.

**How to apply:** when porting a design handoff's own color object (like this GHG Report one, or
any future one), don't stop at "the values that were obviously reusable" — grep the finished
component files for `#[0-9A-Fa-f]{3,6}` afterward and check every hit against `componentTokens`,
not just the ones that happened to look familiar during the port. A value with no existing match
still belongs in `muiTheme.js` (a clearly-labeled new section is fine, as `chrome` is here) rather
than staying a page-local literal — the goal is that `componentTokens` stays the single place to
look for "is this color already in the palette," not something sessions have to partially
reconstruct by reading component files.

## 2026-09-30 — GHG Report visual layer rebuilt from an approved design handoff, replacing a first-pass generic-MUI version

## 2026-09-30 — GHG Report visual layer rebuilt from an approved design handoff, replacing a first-pass generic-MUI version

**What happened:** the first Annual Report (`/report/report`) implementation (see the
2026-09-29 entry below) reproduced Angular's functionality correctly but styled it with plain,
generic MUI `Card`/`Table` components — a defensible reading of "use the existing design system"
for an unstyled migration task, but the user judged it "not looking professional" for a
production app. Rather than have Claude freehand a second attempt at "better," the user supplied
an actual approved design handoff — a Claude-generated design (`GHGReport.jsx` + `ghgData.js` +
a static HTML reference), pixel-accurate to specific colors/sizes/spacing, with its own already-
designed dropdown, tab, and year-picker components — and asked for it to be ported accurately
with real API data appended in place of its mocks.

**What was built:** see `docs/DECARB_REPORT_ANALYSIS.md`'s A.6 "Visual layer" section for the
full breakdown. Short version: `useAnnualReportData.js` (data-fetching + Angular business-logic
port, bugs and all) was **not touched** — only the rendering layer changed. New files:
`ghgReportTheme.js` (color/font tokens, cross-checked against `componentTokens` — nearly every
hex in the handoff turned out to already have an exact-match token in this project's theme),
`components/GhgPrimitives.jsx` (custom `ReadField`/`Card`/`MainTabs`/`SubTabs`/`SiteSelect`/
`YearPicker`, built with `ButtonBase`+`Popover` per the handoff's own design rather than
restyled MUI `Select`/`Tabs`), `components/ExpandableTable.jsx` (the one tree-table component
that now powers the Facilities table and all three emissions tables), and `reportAdapters.js`
(pure shape-translation from the real data to what `ExpandableTable` expects — no business
logic). The old generic `ReportSections.jsx`/`ScopeYearTable.jsx`/`OverallEmissionsTable.jsx`
were deleted, fully superseded.

**A real bug caught mid-port:** the handoff's `SubTabs` (used for Tab B's two sub-sections and
Tab D's four) are interactive-only — only the active sub-tab exists in the DOM. The existing PDF/
print machinery (a hidden full-report clone, forced to fully expand every tree table before
`jsPDF`+`html2canvas` render it — see A.5) would have silently exported only whichever sub-tab
happened to be selected on screen, dropping the rest of the report. Fixed by giving
`BoundaryPanel`/`EmissionsPanel` a `forcePdf` mode that stacks every sub-section in full (with a
new `PrintSubHeading` primitive) instead of using the `SubTabs` selector, only for the hidden
clone instance.

**How to apply:** when a design handoff like this arrives (a working `.jsx` + data file + static
HTML reference, explicitly marked "production-ready" / "high fidelity"), treat it as the
authoritative visual spec and port it close to verbatim rather than reinterpreting it — the
earlier entry below (2026-09-28, MUI adoption) still governs when *no* such handoff exists.
Cross-check its literal color hexes against `componentTokens` before assuming a new token is
needed; this project's theme and this handoff turned out to already share almost every value.
When a design's interactive components (tabs, accordions, sub-navigation) get reused inside a
"export everything at once" flow (PDF, print, a "select all" view), check whether the design's
own DOM-presence assumptions (only the active branch is mounted) will silently drop content in
that flow — it won't show up as an error, just a quietly incomplete export.

## 2026-09-29 — Real login/logout implemented against the current (interim) backend contract

## 2026-09-29 — Real login/logout implemented against the current (interim) backend contract

**What happened:** the user asked for login/logout to actually work, matching Angular's real
auth mechanism (not the scaffold's invented `/auth/*` access/refresh-token pattern), and for
`/report/report` + `/report/monthly-summary` to go back behind route protection (they'd been
made temporarily public in the prior sidebar/topbar session so the shell could be previewed
without a backend round-trip — see that entry below).

**What was built:** full detail lives in `docs/auth-implementation.md` (read that before touching
any auth code) — short version:
- Storage switched from `localStorage` to `sessionStorage` (tab-scoped, matching Angular), token
  key literally named `token` to match Angular's for easy cross-app DevTools comparison.
- `src/api/axios.js` / `endpoints.js` / `authService.js` repointed at the real endpoints
  (`/user/login`, `/user/logout` (DELETE), `/user/forgot`, `/user/dtls`) and stripped of the
  refresh-token machinery the scaffold had (mutex/retry-queue, `/auth/refresh` call) — there is
  no refresh token on this backend, so that code was deleted, not just unused.
- `useAuth().login()` hand-checks the response body's own `status` field, because
  `POST /user/login` **always returns HTTP 200** even on bad credentials — the real result is
  `{ status: 200|401|409, data }` inside a 200 response. This is the one quirk most likely to get
  silently broken by a future "cleanup" — see the doc for why.
- `authSlice`'s `user` shape is now `{ userName, id, role, userSiteAccessDetails }` — matching
  what the backend actually returns. There's no `name` or `email` field (backend doesn't have
  one), so `Sidebar.jsx`'s profile block and `DashboardPage.jsx`'s greeting were updated to use
  `user.userName`, and the sidebar's second profile line now shows `user.role` instead of a
  nonexistent email.
- `LoginPage.jsx` was rebuilt in MUI (`TextField`/`Button`/`Alert`, all picking up styling from
  `muiTheme.js` with no extra overrides needed) per explicit request, replacing the old
  shadcn/react-hook-form-wrapper version. `AuthLayout.jsx` (the split-panel wrapper Login and
  Forgot-Password both render inside) was rebuilt alongside it in MUI too, now showing the real
  iNetZ logo instead of a hardcoded "Ienerz" text wordmark. `ForgotPasswordPage.jsx` was
  deliberately **not** rebuilt — it's wired to the real `/user/forgot` endpoint (works), but its
  UI is still the old scaffold; out of scope for this pass (login only, per the request).
- `ROUTES.REPORT_REPORT` / `ROUTES.REPORT_MONTHLY_SUMMARY` moved back under `<ProtectedRoute>` in
  `src/routes/index.jsx`, removing the temporary public route block from the prior session.

**Explicitly deferred (see `docs/auth-implementation.md` for the full list):** no refresh token
(none exists), no role-based route/UI gating (selectors/helpers exist and work but nothing calls
them yet — neither does Angular, server-side), no 10-minute inactivity auto-logout, no 9-second
role-polling. These are real Angular behaviors that were consciously not ported — don't add them
speculatively; do them as their own piece of work if the product asks for them.

**How to apply:** before changing anything auth-related, read `docs/auth-implementation.md`
first — it has the endpoint table, the exact quirk to preserve, and a "when the backend team
upgrades auth" checklist of files to revisit.

## 2026-09-29 — App shell (sidebar + topbar) built from a decoded reference mockup; Angular supplies nav content

## 2026-09-29 — App shell (sidebar + topbar) built from a decoded reference mockup; Angular supplies nav content

**What happened:** the user supplied a "SideBar and TopBar.html" mockup to copy the CSS from, plus an instruction to take the sidebar/topbar *content* from the Angular app (`D:\InetZ\InetZ Frontend\InetZ-Frontend`). The mockup file is a self-executing "bundler" artifact (`<script type="__bundler/manifest">` of base64+gzip blobs unpacked into blob URLs at runtime) — the actual `<ienerz-shell>` web-component implementation (CSS, DOM template, behavior) is not present as plain text anywhere in the file; it's inside one opaque compressed JS asset in the manifest. A first pass at reading the file (before a context compaction) missed this and nearly proceeded on the mistaken belief that no more CSS than the page background/link colors was recoverable.

**Fix:** wrote a small Node script (`zlib.gunzipSync` on the base64-decoded manifest entries) to decompress every JS asset in the manifest and grepped the results for `ienerz-shell`. The manifest asset `64289e42-4d85-4941-9b73-ce53b1e891d4` (185KB decompressed, 2 of its 234 lines are giant base64 PNG data URIs for the iEnerZ/Ingenero logos) is the entire shell source — CSS template literal, DOM-building `render()`, and event wiring, unminified and commented. Both embedded logos were extracted out of that blob into real PNG files at `src/assets/brand/{ienerz,ingenero}-logo.png` instead of staying as inline base64.

**What was built, matching the decoded source exactly (colors, sizes, transitions):**
- `src/layouts/DashboardLayout/{DashboardLayout,Header,Sidebar}.jsx` — rewritten from the old shadcn/CSS-Modules scaffold to MUI `Box`/`sx`, per this repo's MUI standard (see the 2026-09-28 MUI-adoption entry below). Layout is a flex-column shell (50px gradient header, flex-row body of a 165px collapsible rail + scrollable main), not the old Angular fixed-position layout — the mockup's flex-column structure was used since that's the CSS source of truth here.
- `src/layouts/DashboardLayout/shellIcons.jsx` / `shellNav.js` — shell-chrome-specific icons/data that don't belong in the general `src/components/icons` library (Angular's exact Annual-Report/Monthly-Summary sidebar SVGs, the topbar apps-launcher glyph set).
- `src/theme/muiTheme.js` — added a `componentTokens.shell` block (topbar accent teal, rail active-row color, main content bg, launcher panel bg, header height, rail width) for the handful of shell-only colors not already covered by existing tokens. Notably `componentTokens.gradient.header` (`linear-gradient(100deg,#ED9850,#F2A056,#F5AE6A)`) and `componentTokens.brand.gray` (`#666666`) already matched the decoded shell's header gradient and rail background **exactly**, confirming the user's claim that the mockup shares this project's existing theme.
- Sidebar nav content is Angular's `src/assets/side-menu/report_single.json` ("Annual Report" / "Monthly Summary") — the menu Angular's `side-bar.component.ts` loads when `_api.isReportPage` is true — not the mockup's own generic placeholder `NAV` array (Settings/Energy Master/etc.), per the user's explicit instruction to source content from Angular. The mockup's topbar apps-launcher grid has no Angular equivalent, so that one list was kept verbatim from the mockup.
- `ROUTES.REPORT_REPORT` (`/report/report`) and `ROUTES.REPORT_MONTHLY_SUMMARY` (`/report/monthly-summary`) registered as `DashboardLayout` children in `src/routes/index.jsx`, backed by placeholder page components (`src/pages/report/{AnnualReportPage,MonthlySummaryPage}.jsx`) — page content itself was explicitly deferred by the user; only the shell needed a real route to render against.

**How to apply:** if a future session gets another packed/bundled mockup file from this user and can't find the real CSS/markup as plain text, don't assume it isn't there — check for a `__bundler/manifest` (or similar) script tag first and decode its assets (base64 → gzip/inflate/brotli) before asking the user to re-supply anything. Other Angular menu JSON variants (`dashbaord.json`, `report.json`, `user.json`) exist for other routes and should be wired into `shellNav.js` the same way as those routes get built.

**Follow-up (same day):** `ROUTES.REPORT_REPORT` / `ROUTES.REPORT_MONTHLY_SUMMARY` were temporarily pulled out of the `<ProtectedRoute>` block in `src/routes/index.jsx` and given their own unguarded `<DashboardLayout>` route, so the shell can be previewed without a working backend login round-trip (`ProtectedRoute` redirects to `/login` otherwise, and real login isn't wired up yet — see `docs/backend-context.md`). **This is temporary** — move them back under `<ProtectedRoute>` once auth is functional, matching how the Angular app gates these same routes behind a logged-in session. There's a `TODO` comment at that route block in `src/routes/index.jsx` as the in-code marker.

## 2026-09-29 — Icon set rebuilt as tree-shakeable components; static files removed from `public/`

**What happened:** the icon set went through two earlier forms in the same day — first a hand-transcribed path-data object rendered through a generic `<Icon name="..." />` component (`dangerouslySetInnerHTML`), then a copy of the user's actual generated static SVG files (228 files, one bare/light/dark variant × 76 icons) into `public/icons/`, referenced by the same generic renderer. The user pointed out the `public/` copy always ships in full in the production build regardless of which icons a page actually uses (files under `public/` are copied as-is, not processed or tree-shaken), and supplied a third version — `icons.jsx` — with each icon as its own named `React.forwardRef` component built through a shared `createIcon()` factory.

**Fix:** adopted `icons.jsx` as `src/components/icons/icons.jsx` (76 named exports: `SiteIcon`, `DownloadIcon`, etc.), deleted the old generic `Icon.jsx` and `iconData.js`, and deleted `public/icons/` entirely (was ~230 files; `dist/` after this change no longer contains an `icons/` folder at all). Grouping/usage metadata needed only by the `/` showcase page moved to `src/components/icons/iconRegistry.js`, which imports all 76 for that one purpose — real feature code should import from `./icons` (or the `index.js` barrel) directly so unused icons get dropped per-route.

**How to apply:** when adding icon usage to a real page, `import { XyzIcon } from '@/components/icons'` — never `import { iconGroups } from '@/components/icons/iconRegistry'` outside the showcase page, since that import alone forces all 76 icon components into that page's bundle.

## 2026-09-29 — Replaced `muiTheme.js` with the user-supplied production theme

**What happened:** the user generated their own `theme.js` (from the same design-system mockup, via Claude) covering substantially more ground than the first-pass `muiTheme.js` — full component coverage (Card/CardActionArea, Accordion, Autocomplete, LinearProgress, Badge, ToggleButtonGroup/ToggleButton segmented+enclosed, custom Checkbox/Radio tick/dot SVG icons replacing MUI's defaults, Chip `metric`/`count`/`status`/`trend` variants, Tabs `pill` variant via `tabsPillSx`, a full 25-slot `shadows` elevation array, per-status chip colors via `statusChipSx`/`StatusDot`, Pickers overrides for future `@mui/x-date-pickers` use) plus tighter production values throughout (e.g. real `focus`/`error` box-shadow rings, `Mui-disabled`/`Mui-selected` states on nearly every component). Adopted this wholesale as the new `src/theme/muiTheme.js`, replacing the first-pass version.

**Adjustments made while adopting (not blind copy-paste):**
- Renamed the file's internal `tokens` export to `componentTokens` — this project's own dashboard/data-viz tokens (`utility`, `status.meaning`, `hierarchy`, `domain`, `dashboardLevel` tint ramps, `cardGradient`, `chart`, `threshold`, `neutral` 50–900 scale) already live in `src/theme/tokens.js` and are still the source of truth for those; `componentTokens` is purely the internal palette the component `styleOverrides` are built from. Both are re-exported from `src/theme/index.js` under their own names — don't conflate them.
- Fixed `font.body`/`font.ui`: the supplied file used plain `'Noto Sans'`/`'DM Sans'` (assuming a Google Fonts CDN load per its own header comment), but this project self-hosts via `@fontsource-variable/*` (see `main.jsx`), which registers the family names as `'Noto Sans Variable'`/`'DM Sans Variable'`. Left as plain names, every themed component would have silently rendered in the browser's default sans-serif instead of the brand fonts. Repointed to `"'Noto Sans Variable', 'Noto Sans', sans-serif"` / `"'DM Sans Variable', 'DM Sans', sans-serif"`.
- Fixed two MUI-version deprecations that only surface as runtime console warnings (not build errors) on this project's MUI 9.3.1: `MuiTextField`'s `InputLabelProps` defaultProp → `slotProps: { inputLabel }`; `MuiAutocomplete`'s `ChipProps` defaultProp → `slotProps: { chip }`. The legacy `XxxProps` API was removed in this MUI version; passing it now leaks through as a raw (invalid) DOM attribute instead of configuring the sub-component. Caught by watching the dev server console after wiring up live demos of every component on `/` — a build-only check (`npm run build`) would not have caught this, since MUI doesn't validate defaultProps shapes at theme-creation time.

**How to apply:** if the user supplies another generated theme file in the future, don't assume it's drop-in — check the font-family strings against what's actually loaded in this project, and exercise every themed component live in the dev server (not just `npm run build`) to catch prop-API drift between the MUI version the theme was written against and the one actually installed here.

## 2026-09-28 — Filled in missed dashboard/data-viz color tokens from the source mockup

**What happened:** the first pass at `tokens.js` (same day, see entry below) only transcribed the "core UI" color groups (brand, action, teal, surface, text, border, semantic) and missed a large second layer the mockup defines: `utilityColors`, `statusColors`(+halo/text/meaning), `trendColors`/`trendChips`, `hierarchyLevels` ("dashboard hierarchy"), `engineeringUI` (per-domain section colors), `dashboardThemes` (Site/Plant/Unit/Asset tint ramps), `gradients`/`cardGradients`/`featureGradients`, and chart-specific surface colors. Also missed one shadow value (`shadow.drag`) and used an invented marketing-style h1–h6 type scale instead of the mockup's actual dense dashboard type scale.

**Why it was missed:** the original HTML mockup was pasted directly into a chat and never saved as a repo file (see the "Not yet decided" note in the entry below); the first pass read it once for the "core" sections and didn't verify full coverage against the source before writing `tokens.js`.

**Fix:** re-extracted the mockup's raw data arrays directly from this session's conversation transcript (the JSONL log Claude Code keeps locally still had the full pasted HTML even though the live conversation context had summarized it away), diffed every `const xxx = [...]` block in it against `tokens.js`, and added everything that was missing. See `docs/design-system.md`'s expanded "Color system" section for the full list of what was added and why each group is exposed as raw token data (for composed components to consume) rather than baked into `muiTheme.js` overrides.

**How to apply:** if the user provides more mockup content in the future, don't treat a first pass as complete — the mockup is large (1000+ lines / 40+ data arrays) and easy to under-read in one pass. Before declaring token coverage done, grep the source for `const ` declarations and check each one landed somewhere in `tokens.js` or was consciously deferred in `docs/design-system.md`.

## 2026-09-28 — Adopt Material UI as the standard component library

**Decision:** Material UI (`@mui/material` + `@mui/icons-material` + `@emotion/react`/`@emotion/styled`) is now the standard component library for this app. Tailwind CSS (already present, v4) is kept but scoped strictly to layout/utility classes (`flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`) — never used to restyle MUI component internals (color/border/shadow/typography utilities on an MUI component are off-limits; use the `sx` prop or extend `src/theme/muiTheme.js` instead). MUI X DataGrid, **Community/free edition** (`@mui/x-data-grid`), is the standard table component for all routes — not the plain MUI `<Table>` or a hand-rolled table.

**Why:** User request, driven by a pasted "Design System.html" mockup (iEnerZ Design System v1.0) that specifies exact colors/typography/spacing/shadows/component states the app should match. The user explicitly delegated the theme-setup architecture to this session ("take the decision on you own how do setup this theme so we can reuse that is up to you").

**Why MUI over continuing with the existing shadcn/Radix scaffold:** the project already had an unthemed shadcn/Radix + Tailwind v4 scaffold in place before this decision. Rather than hand-rolling every documented component variant on top of Radix primitives, MUI provides the full component surface (DataGrid included) out of the box, themeable from one `createTheme()` call. This is a bigger surface-area library than the task strictly needs on day one, but the user asked for "all the components from Material UI" as the going-forward standard, not a minimal subset.

**What happens to the existing shadcn/Radix components:** kept, not deleted (`src/components/ui/*`, `src/components/forms/*`). They're legacy/superseded — don't extend them for new work, but no route currently using them needs an urgent migration; migrate opportunistically when a route is touched for other reasons.

**Theme architecture chosen:**
- `src/theme/tokens.js` — single source of truth for raw design values (color, font family, spacing, radius, shadow), transcribed from the mockup.
- `src/theme/muiTheme.js` — `createTheme()` consuming `tokens.js`; palette/typography/shape + `components.styleOverrides`/`variants` for the highest-value primitives (see `docs/design-system.md` for the full coverage list).
- `src/theme/index.js` — barrel export.
- `src/styles/globals.css` — a bounded subset of shadcn's Tailwind-mapped CSS variables (the ones Tailwind's `bg-primary`/`bg-accent`/etc. utilities actually read) were repointed to HSL equivalents of the same brand tokens, so Tailwind utilities and MUI don't visually drift apart. Not a full shadcn repaint — `.dark` and `--sidebar-*` untouched, since the mockup defines no dark mode.
- Component style overrides were scoped to the most-reused primitives in one pass (Button, inputs, Select/Menu, Checkbox/Radio/Switch, Tabs-underline-only, Chip, Dialog/Alert/Tooltip, Pagination, Table, DataGrid) rather than transcribing all 40+ documented component states at once; the rest are logged as deferred in `docs/design-system.md` and should be built as composed patterns when the route needing them is developed.

**How to apply going forward:** new UI work imports from `@mui/material` and styles via `sx`/theme, not Tailwind color utilities or new shadcn components. Table UIs use `@mui/x-data-grid`. If the brand palette changes, update `tokens.js` first, then re-derive the `globals.css` HSL values from it (see that file's header comment for which variables are in scope).

**Not yet decided / open follow-up:** the original "Design System.html" mockup itself was not committed into the repo (it was pasted directly into a chat), so if a future session needs to re-check an exact undocumented state, it has to be requested from the user again or reconstructed from `docs/design-system.md`'s "deferred" list.
