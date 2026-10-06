# Decarb "Monthly Summary" Route — Analysis & React Migration

> Route: Angular `/report/monthly-summary` (`#/report/monthly-summary`) → React `/report/monthly-summary`.
> Angular component: `MonthlySummaryComponent` (`InetZ Frontend/InetZ-Frontend/src/app/monitor/monthly-summary/`).
> React implementation: `InetZ React_Frontend/src/pages/report/MonthlySummaryPage.jsx` (+ helpers).
>
> Same process as `docs/DECARB_REPORT_ANALYSIS.md` (Annual Report): analyze Angular + backend,
> preserve functional parity, document bugs without fixing them. This route is a chart-heavy
> current-month-vs-previous-month emissions dashboard, not a table/report like the Annual Report.

---

## A. Current Implementation

### A.1 Angular routing & component tree

- `/report/monthly-summary` → `MonitorModule` (lazy) → `MonthlySummaryComponent`. Same
  `/report` shell (`MainLayoutComponent`) and inherited `AuthGuard` as every other `/report/**`
  route — see `DECARB_REPORT_ANALYSIS.md` A.1 for the shared routing context.
- Single self-contained component (965 lines TS, 139 lines HTML, 234 lines SCSS) — no children
  besides PrimeNG's `p-chart` (Chart.js wrapper) and `p-multiSelect`, plus one custom
  `app-general-chart` component (used once, for the plant-wise line chart).
- No route params, no query params, no year/site selector at the top of the page (unlike the
  Annual Report) — the API returns "current month vs. previous month" as a fixed pair; the only
  client-side filtering is which sites/plants are included in two of the charts.

### A.2 Page structure (3 sections, no tabs)

| Section | Contents |
|---|---|
| Top | Combined bar+line chart ("Overall tCO2e emissions and intensity", 2 months); Scope 1 / Scope 2 tCO2e current-vs-last-month comparison boxes (value, prior value, a backend-composed "±N% increase/decrease" label, a color-coded triangle); a free-text "site summary" info panel (backend-composed sentences) |
| Middle | "Site-wise tCO2e emissions" grouped bar chart (2 series: current/last month); "Plant-wise tCO2e emissions" line chart (one line per plant, 2 points); Site filter + Plant filter (multi-select, both default to "all"); a legend; a "plant summary" info panel |
| Bottom | Two doughnut charts side by side ("Equipment-Wise tCO2e Contribution" for last month and current month); a legend; an "equipment summary" info panel |

A full-page loading spinner shows until the single API call resolves (`*ngIf="!currentData"`) —
no per-chart loading states.

### A.3 Backend API used

**One endpoint**, no parameters: `GET output/monthlyReport` (`ApiService.getData` in
`loadReport()`, `MonthlySummaryComponent`). Response `{ status, data }`, `data` shape:

```jsonc
{
  "currentMonth": "April 2026",           // string label
  "lastMonth": "March 2026",
  "firstGraphOverallTco2e": { "March 2026": "6114410", "April 2026": "6192894" },       // LinkedHashMap, insertion order = [lastMonth, currentMonth]
  "firstGraphOverallTco2eIntencity": { "March 2026": "...", "April 2026": "..." },
  "overallScope1tCO2eCurrentMonth": "...", "overallScope1tCO2eLastMonth": "...",
  "overallScope2tCO2eCurrentMonth": "...", "overallScope2tCO2eLastMonth": "...",
  "overallScope1tCO2eLabel": "<b>4%</b> increase over previous month",   // backend-composed HTML
  "overallScope2tCO2e": "<b>2%</b> decrease over previous month",        // NOTE field name — not "...Label" like scope 1, see B.2
  "calculateSiteWise": ["<b>Site A</b> was the largest emitter...", "..."],     // array of backend-composed HTML sentences
  "calculatePlantWise": ["..."],
  "calculateEquipmentWise": ["..."],
  "siteModel": { "curentMonth": { "Site A": 12345, "Site B": 678 }, "lastMonth": { "Site A": 11000, "Site B": 700 } },  // NOTE "curentMonth" — real backend field name, not a typo introduced here
  "plantModel": { "curentMonth": { "Plant 1": 500, ... }, "lastMonth": { ... } },
  "equipmentWise": { "curentMonth": [{ "equipmentName": "Furnace 1", "co2e": 234 }, ...], "lastMonth": [...] }
}
```

### A.4 Backend controller → service trace

- `OutPutController` → `OutPutServiceImpl.monthlyReport()` (`OutPutServiceImpl.java:1441`).
- **Response is memoized in a static field** (`DecarbUtil.monthlyReportResponseModel`) —
  computed once, then every subsequent call returns the cached object without re-querying the
  database, until it's explicitly nulled out. Confirmed the invalidation path exists:
  `ApenDataLoadServiceImpl.java:174` sets it back to `null` as part of the daily calculation
  load/backfill (`apenDataLoadServiceImpl.load()`, the same path `OutPutController.runDailly()`
  triggers) — so this is a working "cache until the underlying data changes" pattern, not a
  bug, but worth knowing: **the page can show stale current/last-month data between
  recalculation runs**, and there is no user-facing way to force a refresh.
- Computes 5 sub-results in parallel (`CompletableFuture`, 5-thread pool) — `firstGraphOverallTco2e`/
  `...Intencity` (2-month totals + intensity via `ytdTco2eValuesMonthlyReport`/
  `ytdTco2eIntencityValuesMonthlyReport`), `siteModel` (`reportBarchartSiteWise(1|2, scopeAll)`),
  `plantModel` (`reportBarchartPlantWise(1|2)`), `equipmentWise` (`reportEquipmentDetails(1|2)`) —
  plus 4 sequential `getOverallTCo2e(month, scope)` calls for the Scope 1/2 totals. The
  `calculateSiteWise()`/`calculatePlantWise()`/`calculateEquipmentWise()` methods build the
  narrative HTML sentences server-side (string concatenation over the same underlying
  month-over-month comparisons) — not traced to SQL level in this pass (narrative-text builders,
  not calculation logic; same "lower risk, not worth the depth" reasoning applied to
  `general/dropdown` etc. in the Annual Report analysis).
- `1` = current month, `2` = last month throughout (`DecarbUtil.getMonthAndYearName(1|2)`) — a
  convention worth knowing before touching any of this code.

### A.5 Frontend business logic / transforms (Angular)

- **Site-wise chart dataset labels are swapped relative to their data** — see B.1. Not fixed in
  the React port; reproduced exactly (`monthlySummaryAdapters.js`'s `buildSiteWiseChart`, with an
  inline comment pointing back here).
- **Plant-wise chart's right (`y1`) axis is defined but never used** — `generateChartData()`
  builds one line series per plant and never sets a `yAxisID` on any of them, so every series
  implicitly uses the default (left) axis; the `y1.max` computation right after it
  (`this.furnaceLineOptions.scales.y1.max = Math.max(...maxVal)`) has no visible effect. Not a
  bug worth "fixing" since the chart already renders correctly as a single-axis chart — just
  dead code. The React port is single-axis by construction, so nothing to preserve here.
- **Color palette**: a fixed 22-hex array, indexed by position and re-used (cycled) once a
  series list exceeds 22 entries, with no CVD/contrast consideration. See "Deliberate
  deviations" below for what the React port does instead.
- Site/Plant filters are pure client-side re-slices of the already-fetched `siteModel`/
  `plantModel` — no refetch on filter change, matching the Annual Report's own site-filter
  pattern (`DECARB_REPORT_ANALYSIS.md` A.5).

---

## B. Current Problems and Limitations

*(Documented per the same Phase 5 instructions as the Annual Report — none fixed here.)*

**B.1 — Site-wise chart's two series are labeled with the wrong month**
- Where: `MonthlySummaryComponent.setBarChartSecond()` (monthly-summary.component.ts:451-520).
- Problem: `mainLabel` (the two dataset *labels*) is built from `firstGraphOverallTco2e`'s keys,
  whose backend insertion order is `[lastMonth, currentMonth]` (`OutPutServiceImpl.java:1458-1461`).
  But dataset 0's *data* (`labelsData`) comes from `siteModel.curentMonth` (current month's
  per-site values), and dataset 1's *data* (`labelsDataSecond`) comes from `siteModel.lastMonth`.
  So the chart legend reads "March 2026" next to the bars that are actually April's values, and
  vice versa — the two month labels and their underlying data are cross-wired.
- Evidence: monthly-summary.component.ts:505-519 — `datasets: [{ label: mainLabel[0], data:
  labelsData }, { label: mainLabel[1], data: labelsDataSecond }]` where `labelsData` was pushed
  from `entries` (= `siteModel.curentMonth`) and `labelsDataSecond` from `entriesLastMonth`
  (= `siteModel.lastMonth`), while `mainLabel[0]` is the *lastMonth* name and `mainLabel[1]` is
  the *currentMonth* name.
- Production impact: real — anyone reading the site-wise chart's legend to compare "this month
  vs last month" per site is looking at the swap. Preserved as-is in
  `monthlySummaryAdapters.js`'s `buildSiteWiseChart`, documented inline.

**B.2 — Inconsistent backend field naming for the Scope 2 comparison label**
- Where: `MonthlyReportResponseModel` / `report.component.html:32` (`[innerHTML]="currentData?.overallScope2tCO2e"`).
- Problem: the Scope 1 comparison label field is `overallScope1tCO2eLabel`; the equivalent Scope
  2 field is `overallScope2tCO2e` — no `Label` suffix, easy to grab the wrong field name
  (`overallScope2tCO2eLabel`, which doesn't exist) when touching this code later.
- Production impact: none currently (Angular already uses the correct, oddly-named field); flagged
  purely so a future edit doesn't "fix" it into a field that isn't there. Preserved verbatim in
  the React port's `buildScopeComparison`.

**B.3 — Monthly report is cached indefinitely between recalculation runs**
- Where: `OutPutServiceImpl.monthlyReport()`, `DecarbUtil.monthlyReportResponseModel` (a static
  field, not request- or session-scoped).
- Problem: not a bug in the sense of wrong output, but a real staleness window — the page always
  shows "current vs last month" as of whenever the backend last computed it, with no manual
  refresh affordance anywhere in the UI (Angular or this React port).
- Production impact: low urgency (the invalidation-on-recalculation path does work), but worth
  surfacing since neither app tells the user how fresh the numbers are.

**B.4 — Unbounded, cycling 22-color palette with no accessibility consideration**
- Where: the `colors`/`color` arrays repeated in `MonthlySummaryComponent` (lines 27, 598-600,
  619-621, 896-898, 959-961 — the same 22-hex list copy-pasted 5 times).
- Problem: once a chart's series count exceeds 22 (a plant or equipment list large enough),
  colors silently repeat, making two different series visually indistinguishable. No
  colorblind-safety or contrast validation went into the ordering.
- Production impact: currently unlikely to bite (would need >22 plants/equipment types at one
  site), but a real risk as the dataset grows. The React port uses a validated 8-hue categorical
  palette and folds anything past the 8th series into a summed "Other" bucket instead of cycling
  — see "Deliberate deviations" below. This is the one place this migration intentionally does
  *not* reproduce the Angular behavior bug-for-bug, since silently mislabeling data via color
  reuse is a correctness issue for a chart, not a business-logic value.

---

## C. Proposed Future Improvements

*(Documented, not implemented.)*

1. **Fix the site-wise chart's swapped labels** (B.1). Benefit: correct legend. Layer: frontend
   only — swap which array (`labelsData`/`labelsDataSecond`) each `mainLabel` index pairs with.
   Risk: low, but re-verify against the Angular screen once fixed, since anyone who has been
   reading the chart "by data, ignoring the wrong label" would see a visible change.
2. **Add a manual refresh / show a "last calculated at" timestamp** for the monthly report (B.3).
   Benefit: makes the staleness window visible instead of silent. Layer: backend (expose a
   computed-at timestamp, and/or a refresh endpoint that clears the cache on demand) + frontend
   (display it, maybe a refresh button gated to the same roles that can trigger recalculation).
3. **Rename `overallScope2tCO2e` for consistency** with `overallScope1tCO2eLabel` (B.2). Benefit:
   removes a "which field name is it again" trap. Layer: backend DTO + both frontends' consumption
   of it. Low risk, purely a rename — coordinate the frontend change with the backend change in
   the same deploy.

---

## D. Implementation Status

Legend: ✅ Implemented & verified · 🟡 Implemented, not yet verified against a live backend ·
◐ Partial · ❌ Not implemented · 🚧 Blocked

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Route `/report/monthly-summary` registered, protected | ✅ | Already existed from the earlier sidebar/topbar + auth work; content replaces the placeholder |
| 2 | `GET output/monthlyReport` data fetching | 🟡 | Single TanStack Query call, no params — matches Angular exactly |
| 3 | Overall tCO2e + intensity combined chart (dual-axis bar+line) | 🟡 | Built with Highcharts per explicit instruction (not echarts/MUI X Charts); dual-axis preserved to match Angular exactly — see "Deliberate deviations" |
| 4 | Scope 1 / Scope 2 comparison cards | 🟡 | Restyled with this app's existing `trend` tokens (decreaseGood/increaseBad) instead of Angular's raw CSS triangle classes; same underlying values/labels |
| 5 | Site-wise bar chart (with the swapped-label bug) | 🟡 | Bug B.1 reproduced intentionally, documented inline in code |
| 6 | Plant-wise line chart | 🟡 | Single-axis (matches Angular's actual behavior, not its unused `y1` axis definition) |
| 7 | Equipment-wise donut charts (×2) | 🟡 | Categorical palette + "Other" fold instead of Angular's cycling 22-color array (B.4) |
| 8 | Site / Plant multi-select filters | 🟡 | MUI `Autocomplete` (already themed), client-side re-slice only, no refetch — matches Angular |
| 9 | Backend-composed narrative info panels (site/plant/equipment summaries) | ✅ | Rendered verbatim via the same `dangerouslySetInnerHTML` pattern as the Annual Report's methodology block |
| 10 | Loading state | ◐ | Single full-page spinner until the one query resolves — matches Angular's `*ngIf="!currentData"` overlay; no per-chart loading states in either app |
| 11 | Backend SQL/controller behavior | 🚧 | Controller/service structure traced (A.4); the individual SQL queries behind `ytdTco2eValuesMonthlyReport`/`reportBarchartSiteWise`/`reportBarchartPlantWise`/`reportEquipmentDetails`/`getOverallTCo2e` were **not** traced to SQL level in this pass — same reasoning as the Annual Report's lower-risk lookups, but flagged explicitly here since this page leans on more of them |
| 12 | End-to-end verification against live data | 🚧 | **Blocked** — same as the Annual Report: no network path to the backend from this environment |

---

## Visual layer (2026-09-30, superseding the first pass)

The section below ("Deliberate deviations") describes the *first* implementation pass — built
before an approved design handoff existed for this route, so it made its own chart-color and
chart-form calls per the data-viz skill's general guidance. The user then supplied an approved
handoff (`C:\Users\gpetkar\Desktop\report page code\MonthlyGHGSummary.jsx` + `monthlyGhgData.js`
+ a static HTML reference), matching the same "Claude design, pixel-accurate, port it rather than
reinterpret it" pattern as the Annual Report's later redesign. The visual layer was rebuilt from
that handoff; **data fetching/business logic in `useMonthlySummaryData.js` was re-derived to match
the handoff's data shapes but still sources from the same real `output/monthlyReport` call** —
nothing about the backend contract changed.

- `monthlySummaryTheme.js` — the handoff's `C` color/font tokens, cross-checked against
  `componentTokens`/`tokens.js` and mapped to existing tokens throughout (no new tokens added for
  this page, unlike the Annual Report's `chrome` additions) — see that file's inline comments for
  the full mapping. Only `grid` (a chart gridline color) has no exact match anywhere in the theme;
  it uses the closest existing token (`tokens.chart.gridline`) rather than a new literal, per
  instruction to search for a similar existing token instead of inventing one.
- **Highcharts series colors deliberately left untouched** — per explicit instruction, the
  handoff's own series colors (`CHART_COLORS` in `monthlySummaryTheme.js`: teal-light for
  "previous", orange for "current", a 5-color categorical set for sites/plants/equipment) are used
  as-is, **superseding** this doc's earlier "Categorical color palette" deviation below (the
  data-viz-skill-validated 8-hue palette from the first pass). Chart *chrome* (tooltip, gridlines,
  axis colors) is still sourced through token references rather than literal hex — but every
  value is identical to the handoff's own literals, so this isn't a color change either, just a
  sourcing mechanism.
- **Sidebar/top bar**: the handoff ships its own `EmptySidebar`/`EmptyTopBar` placeholders and a
  default export that wraps the page content in them. Neither is used — this page already renders
  as a child of the app's real `DashboardLayout` (Sidebar + Header, built earlier in this project)
  via routing, so only the handoff's content export (`MonthlyGHGSummaryContent`'s equivalent) was
  ported.
- **`MultiSelect` promoted to `src/components/common/`**, same reasoning as `Dropdown`/
  `YearPicker`/`AppTabs` (see that section of `docs/decisions.md`): custom `Popover`+`ButtonBase`
  markup, not MUI's `<Select multiple>`, so it belongs in the shared component library rather than
  page-scoped — the Dashboard or any other page can reuse this exact multi-select.
- **Plant filter is independent of the Site filter**, unlike the handoff's mock (which nests each
  plant under a `site` so the plant list narrows to the selected sites). The real `plantModel` has
  no site association per plant at all (see A.5/A.3) — Angular's own plant filter is independent
  for the same reason, so this isn't a new deviation, just carried forward from the data-shape
  reality already documented below.
- **Equipment donuts share one unified category list** (`getEquipment` in
  `monthlySummaryAdapters.js`) instead of each donut independently ordering/coloring its own
  month's equipment list — the real `equipmentWise.curentMonth`/`.lastMonth` are two independent
  arrays (an item present one month isn't guaranteed in the other), unlike the handoff's paired
  mock `EQUIPMENT` array. Unioned by name so both donuts stay visually consistent (same color per
  equipment name in both charts).
- **Scope 1/2 comparison cards reuse the backend's own comparison label** (`overallScope1tCO2eLabel`/
  `overallScope2tCO2e`, HTML already containing the exact percentage + "increase"/"decrease"
  wording) instead of the handoff's client-side `decPct()` recomputation — same "don't recalculate
  what the backend already computed" principle as the Annual Report. The handoff's mock data also
  only ever showed a decrease (hardcoded red ▼ badge, no increase treatment at all); since real
  data can show either direction, an increase now renders a ▲ in the same red/`errorHalo` styling
  the handoff specified for decreases — reusing the handoff's own colors for both directions
  rather than inventing a separate "good" color for one of them.
- **Insight bullets render real backend HTML directly** instead of the handoff's `**bold**`/
  `++green++` markdown-style parser (`RichText`) — that parser exists because the handoff's mock
  insight strings were written in that markup; the real `calculateSiteWise`/`calculatePlantWise`/
  `calculateEquipmentWise` fields are actual HTML (`<b>...</b>`) straight from the backend, so
  `Bullets` renders them via the same `dangerouslySetInnerHTML` pattern already used for the
  Annual Report's backend-composed text.

## Deliberate deviations from Angular — first pass (2026-09-29, partly superseded above)

- **Chart library: Highcharts** (`highcharts` + `highcharts-react-official`), per explicit
  instruction — not Chart.js (Angular's library, via PrimeNG's `p-chart`), not echarts, not
  MUI X Charts. New dependency, no prior charting library existed in this project. *(Still
  current.)*
- **Categorical color palette**: replaced Angular's 22-color cycling array with the data-viz
  skill's validated 8-hue reference palette. *(Superseded by the design handoff above — series
  colors now come from the handoff's own 5-color set, used as-is per instruction.)*
- **Dual-axis combined chart kept as-is**: the data-viz skill's general guidance is "never a
  dual-axis chart — two measures of different scale become two charts or small multiples
  instead." The Angular page's "Overall tCO2e emissions and intensity" chart is exactly that
  anti-pattern (tCO2e on the left axis, intensity on the right). Kept dual-axis anyway — the
  design handoff also renders it dual-axis, confirming this call. *(Still current.)*
- **Trend/comparison styling**: *(Superseded — see "Scope 1/2 comparison cards" above; now uses
  the handoff's own red/`errorHalo` styling instead of the first pass's `trend.decreaseGood`/
  `trend.increaseBad` tokens.)*

## Verification performed

- `npm run lint` — clean on all new/changed files (one pre-existing warning elsewhere in the
  report folder, unrelated to this route).
- `npm run build` — production build succeeds.
- **Not performed (blocked, same as the Annual Report)**: loading the route against the real
  backend, visually confirming chart output, or confirming the exact JSON field names assumed
  here match what's actually serialized live. This environment has no network route to the
  backend. Recommend a manual pass against a real environment before treating this route as done.
