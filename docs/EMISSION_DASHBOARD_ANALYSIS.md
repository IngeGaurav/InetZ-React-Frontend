# Decarb "Emission Dashboard" Routes — Analysis & React Migration

> Angular routes: `/report/emission-dashboard` and `/report/emission-dashboard/equipment`
> (hash-routed in Angular: `#/report/emission-dashboard`).
> React routes (corrected naming, see A.1): `/dashboard/emission-dashboard` and
> `/dashboard/emission-dashboard/equipment`.
> Angular components: `EmissionDashboardComponent` + `EquipmentEmissionComponent`
> (`InetZ Frontend/InetZ-Frontend/src/app/monitor/emission-dashboard/`).
> React implementation: `src/pages/dashboard/emission/` (+ `DashboardNav.jsx`, `emissionDashboardService.js`).
> Section D tracks status; **Section F records the decisions made and every deviation from Angular.**
>
> This is the app's main "Emission Overview" dashboard — the page the landing-page **Dashboard**
> tile opens. One component serves three *layouts* chosen by URL query params (Organisation /
> Site / Plant), plus a second, separate route (Equipment Overview). It is read-only against
> existing calculation data; nothing on either route writes to the backend.
>
> Companion docs already in `D:\InetZ\`: `emission-dashboard-debug-summary.md` (why the page was
> once empty) and `emission-dashboard-fix-summary.md` (the `formatAspen` Locale fix that got data
> flowing again). Those are about the **data pipeline**; this doc is about the **page**.
> Read `docs/auth-implementation.md` before wiring any of the API calls below.

---

## A. Current Implementation

### A.1 Angular routing, naming, and the React route rename

**Angular route tree**

- `app-routing.module.ts`: `/report` → `MainLayoutComponent` (shell shared with `/dashboard`),
  `canActivate: [AuthGuard]`, `data: { page: 'report', permissions: { only: [SUPER_ADMIN, ADMIN, USER] } }`
  → `loadChildren: MonitorModule` at path `''`.
- `monitor-routing.module.ts` registers (relevant entries only):

  | Angular path | Component | Notes |
  |---|---|---|
  | `emission-dashboard` | `EmissionDashboardComponent` | Org / Site / Plant layouts (query-param driven) |
  | `emission-dashboard/equipment` | `EquipmentEmissionComponent` | "Equipment Overview" |
  | `''` and `equipment` | `EquipmentComponent` | **The older, pre-ECharts dashboard** — out of scope here (see B.20) |
  | `equipment-details` | `EquipmentsComponent` | Older "Equipment Overview" page — out of scope |

- No route params. No resolvers. `AuthGuard` only checks `sessionStorage.token` exists (and
  redirects to `/` if `sessionStorage.rl` is missing) — it does **not** check the `permissions.only`
  role list (already documented as dead `ngx-permissions` wiring, `docs/backend-context.md` /
  `ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md` §9; cross-cutting, see B.18).
- All page state (which layout, which site, which plant) is carried in **query params**, not path
  segments: `?siteId=&siteName=&showDetail=&details=` and (never produced by any UI, see B.2)
  `&plantId=&plantName=`.

**Why the rename (per user instruction)**: in Angular this page lives under `/report/…` only
because it shares the `MonitorModule` with the report pages — it is semantically a *dashboard*
page. The React app corrects that:

| Concern | Angular | React |
|---|---|---|
| Org/Site/Plant dashboard | `/report/emission-dashboard` | **`/dashboard/emission-dashboard`** |
| Equipment Overview | `/report/emission-dashboard/equipment` | **`/dashboard/emission-dashboard/equipment`** |
| Query params | `?siteId=&siteName=&showDetail=&details=` (+ plant) | keep the same names/semantics (frontend-only contract; no backend dependency) |

**Namespace collision to resolve** (flagged, not decided — see Section E, Q1): in Angular, `/dashboard`
is **GHG Setup** (`dashboard.module`, `emission-scope-one`, `emission-scope-two`, `customize`; sidebar
`dashbaord.json`; landing tile "GHG Setup" → `/dashboard`). In React, `ROUTES.DASHBOARD = '/dashboard'`
currently points at the scaffold `DashboardPage` and is also the post-login redirect target
(`useAuth.js:50`, `PublicRoute.jsx:21`). Putting this page at `/dashboard/emission-dashboard` is what
was asked for and works, but means (a) a future GHG Setup port can't also own `/dashboard/*` without a
sub-prefix decision, and (b) `/dashboard` itself needs a decision (redirect to the emission dashboard?
keep the scaffold?).

### A.2 Sidebar configuration

The sidebar content is **data-driven** from JSON in `src/assets/side-menu/`, chosen in
`side-bar.component.ts`:

| Condition | Menu file |
|---|---|
| route `data.page === 'dashboard'` | `dashbaord.json` (GHG Setup — not this page) |
| route `data.page === 'report'` and `sessionStorage['report']` is **unset** and `['us']` unset | **`report.json`** ← *this page* |
| …and `sessionStorage['us']` set | `user.json` (User Management) |
| `_api.isReportPage` event fired (Annual Report / Monthly Summary pages emit it) | `report_single.json` (already ported — `shellNav.js`) |

`report.json` (the menu this page uses) — verbatim:

```json
[
  { "name": "Monitor", "route": "/report/emission-dashboard", "src": "Left Ribbon Dashboard - Monitor Icon.png",
    "hasEquipment": true, "breadcrumbTitle": "Emission Overview",
    "nestedRoute": "/report/emission-dashboard/equipment",
    "subMenu": [ { "name": "Site 1", "route": "/report/emission-dashboard/equipment", "showDetail": true, "details": true },
                 { "name": "Site 2", "route": "" } ] },
  { "name": "Target Setting",  "route": "/report/target-setting",  "src": "target.png",
    "breadcrumbTitle": "Organization - Decarbonization Target" },
  { "name": "Edit/Enter Data", "route": "/report/edit-enter-data", "src": "editor.png",
    "breadcrumbTitle": "Edit GHG Data" }
]
```

How it is rendered/behaves (`side-bar.component.ts` + `.html`):

1. **"Site 1 / Site 2" in the JSON are placeholders.** `getSiteList()` calls `GET general/site` and
   `mapSideMenu()` **replaces** the whole `subMenu` of every menu item that has one with one entry
   per real site: `{ name: site.name, route: <parent route>, queryParams: { showDetail, siteId: site.id,
   siteName: site.name, details } }`. `showDetail`/`details` are copied from the *first* placeholder
   entry's `showDetail` (`true` here). So each site link navigates to
   `/report/emission-dashboard?showDetail=true&siteId=<id>&siteName=<name>&details=true`.
2. **Monitor row** (`onParentClick`) → navigates to `/report/emission-dashboard` with **empty**
   query params (Organisation layout) and expands its children. It does *not* auto-select a site,
   because `hasEquipment` is true (the auto-pick-first-writable-site branch is skipped for it —
   it only applies to menus with `subMenu` and no `hasEquipment`).
3. **Children list** = one row per site (from `general/site`) **plus a synthetic "Equipment" row**
   (shown because `hasEquipment && nestedRoute`) → `navigateTo('/report/emission-dashboard/equipment', 11, index, 11)`.
   Note the literal `11` is passed as `queryParams` (a number, not an object) — it is a leftover
   sentinel; Angular ignores it, so Equipment is navigated with **no** query string (B.7).
4. **Per-site access check on click**: `if (route !== '/report/emission-dashboard' && !mainMenuClicked
   && queryParams.siteId && !isWriteAccess(siteId))` → toast `"You don't have access to this site."`
   and abort. Since site rows use `route = menu.route = '/report/emission-dashboard'` the
   `route !== …` guard is **false for site rows**, so **this check never fires for them** — the
   sidebar *always* lets the user click any site (B.3). (It is effective only for other menus.)
5. `activeSubMenu` bookkeeping: derived from `Number(siteId) - 1` (assumes site ids are 1-based
   contiguous = array index — B.8); set to `NaN` when going to the org route.
6. **Role filtering** of the menu: `hasUserManagemtnAccess()` (SUPER_ADMIN only) strips
   "User Management" (not in this JSON); `hasDashboardAccess()` (anything except role `USER`) —
   `USER` role gets **"Edit/Enter Data" removed**. Re-applied when `isRoleRefreshed` fires.
7. Expanded-state: `expandedIndex` (one tree node open at a time; Monitor open on first load),
   chevron toggles without navigating; `activeTab` highlight by `menu.name`.
8. `sideMenuClicked.next(siteId)` (BreadcrumbService) fires on site click — no subscriber found in
   the dashboard components.
9. Menu icons: `assets/<src>` PNGs (`Left Ribbon Dashboard - Monitor Icon.png`, `target.png`,
   `editor.png`) and a bottom-pinned Ingenero logo.

**Top-bar coupling** (`nav-bar.component.ts/html`): title text is `{{siteName}} {{breadcrumbTitle}}
{{orgName}}`.
- `breadcrumbTitle` = `"Emission Overview"` — set by the dashboard itself (`setBreadcrumb(['Emission Overview'])`
  on every query-param emission).
- `siteName` = the `siteName` query param, **only while** `breadcrumbTitle == 'Emission Overview'`.
  So a site view reads **"Axxon Oil Company Emission Overview"**; org view reads **"Emission Overview"**.
- A circular chevron button (`fa-chevron-circle-right`) appears when query param `showDetail === 'true'`
  (always the case for site links). Clicking it runs `router.navigate([], { queryParams: { details: true },
  queryParamsHandling: 'merge', replaceUrl: true })`. Nothing on this page reads `details` — but
  because the dashboard subscribes to **all** query-param emissions, the click makes it **re-run
  `ngOnInit`'s whole handler: reset every pie filter and refetch everything** (B.9). In effect the
  chevron is a "refresh and clear filter" button that was probably meant to open a details view.
- Equipment page sets `hideShowOrgName('')`.

**React today**: `shellNav.js` has only `REPORT_SINGLE_NAV` (Annual Report / Monthly Summary), and
`Sidebar.jsx` renders that flat list unconditionally (no site sub-menu, no expand/collapse, no role
filtering). The `/dashboard/*` group needs a second nav definition driven by `general/site` — see
Section C (implementation plan) and Q2/Q3.

### A.3 Page structure — `/report/emission-dashboard` (3 layouts, no tabs)

Layout is a Bootstrap grid (`row g-2`) inside `.dashboard`. **Layout selection** (from query params,
re-evaluated on every query-param emission):

```
hasSite  = !!siteId        hasPlant = !!plantId
hasPlant            → Plant layout   (100% hardcoded dummy data — B.2)
else hasSite        → Site layout
else                → Organisation layout
```

**Row 1 — gauge strip (all layouts, 5 equal columns, 20% each, card height 132px)**

| # | Panel | Title (org / site) | Source field | Notes |
|---|---|---|---|---|
| 1 | Gauge | `Overall tCO2e Emission` / `Overall tCO2e Emissions` | `topGraphFirst` | |
| 2 | Gauge | `Overall Scope 1 tCO2e` | `topGraphThird` | |
| 3 | Gauge | `Overall Scope 2 tCO2e` | `topGraphFourth` | |
| 4 | Gauge | `Overall Emission Intensity tCO2e/T` (2 decimals) | `topGraphSecond` | |
| 5 | KPI card, two linear gauges | `Monthly Overall tCO2e`, `Daily Overall tCO2e` | `topGraphFifth` + client math | see A.5 |

Each gauge shows: title, a flat-semicircle "temperature"-style progress arc (grey track, one solid
colour fill = good/warning/critical zone), centre value, and two small tick markers for **Target**
(green `#3ca653`) and **Baseline** (orange `#f2a056`) with hover tooltips. The gauge's max scale is
`max(value, target, baseline, 1) × 1.2`; zone colour = good (`#34A853`) if value ≤ target stop,
warning (`#F2A056`) if ≤ max(baseline, target), else critical (`#D9534F`).

**Organisation layout** (`!hasSite`)

| Row | Panel | Width | Content |
|---|---|---|---|
| 2 | **Site-wise tCO2e Contribution** | col-lg-3 | Donut pie, one slice per site; **slice click filters the page** (A.6); filter chip "Showing: <site> ✕" when filtered; palette = `CHART_PALETTE` |
| 2 | **Monthly tCO2e Emission** | col-lg-6 | Combo: Scope 1 bars + Scope 2 bars + Total line; colours `#81dbe7 / #69a0e2 / #F2A056`; **Location ⟷ Market toggle** rendered in the card header (slot) |
| 2 | **Top Contributors** | col-lg-3 | Horizontal bars, top-5 equipment by tCO2e, value label at bar end, chart height 160px |
| 3 | **Emission Target Vs Actual tCO2e Emission – {curSiteName}** | col-lg-7 | Combo with 6 series (Target/Actual × Total/Scope 1/Scope 2: bars=target, lines=actual) + **scope filter dropdown** (All/Total/Scope 1/Scope 2, multi-select, default **Total** only) |
| 3 | **Scope 1 & Scope 2 Emission Breakdown – {curSiteName}** | col-lg-5 | One table, two stacked header bars ("Scope 1" then "Scope 2"), columns = `Total` + one column per site; sticky first column; "Data not available" row when empty |

**Site layout** (`hasSite && !hasPlant`)

| Row | Panel | Width | Content |
|---|---|---|---|
| 2 | Scope 1 table | col-lg-6 | `Scope 1` / `Total` / one column per **plant** |
| 2 | Scope 2 table | col-lg-6 | Same, with the **Location ⟷ Market toggle inside the header cell** |
| 3 | **Plant-Wise tCO2e Contribution** | col-lg-3 | Donut, slices = plants; click filters to a plant; palette = `["#FED966","#F2A056"]` (only two colours — a 3rd+ plant cycles) |
| 3 | **Monthly tCO2e Emission – {site or filtered plant}** | col-lg-4 | Stacked **area** chart (Scope 1 stacked on Scope 2) |
| 3 | **Historical tCO2e Emission Progression – {site or plant}** | col-lg-5 | Line chart, 3 lines (Total/Scope 1/Scope 2) |

The site layout **drops** the org's Top Contributors and Target-vs-Actual panels (no such panels in
the template — verified; the code comment says the same).

**Plant layout** (`hasPlant`) — mirrors the site layout but with fixed `OSBL`/`ISBL` columns, an
"Equipment-Wise" pie, and **all numbers hardcoded** in the component. Unreachable from the UI (B.2).

Every chart card has a header with **Download PNG** and **Expand** (modal, 80vw × 78vh, max 1100px)
icons, and renders a "Data not available" placeholder when its category/label array is empty.
Both are shared infrastructure — see A.7.

### A.4 Page structure — `/report/emission-dashboard/equipment` ("Equipment Overview")

| Row | Panel | Width | Content |
|---|---|---|---|
| 1 | Equipment table | col-lg-8 | Columns: `Equipment`, `Total`, one column per site; rows clickable (active highlight); `–` for null cells; sticky first column |
| 1 | **Sitewise {equipment} tCO2e Emission** | col-lg-4 | Donut: one slice per site that has a non-null value for the selected row; colours = `CHART_PALETTE[siteIndex]` (the same colour each site has in the table's column order) |
| 2 | **{equipment} tCO2e Emission Progression** | col-12 | Single orange (`#F2A056`) line, month-year x-axis |

Row 0 is auto-selected once data arrives. No Location/Market toggle and no filters; no query params
(the sidebar's `11` sentinel is ignored, B.7).

### A.5 Backend APIs used

All via `ApiService.getData(url)` → `GET environment.apiUrl + url`, all wrapped `{ status, data }`
(`ResponseModel` — handled in React by the existing `unwrapResponseModel`). **Every call is a
GET. Nothing on either route mutates data.**

**Common query param**: `?marketBased=<bool>` is appended to almost every call. In the Angular code
the variable driving it is called **`isLocationBased`** — but it is passed straight into
`marketBased=`. Combined with the toggle UI (unchecked = "Location" highlighted, checked = "Market"
highlighted), `isLocationBased === true` actually means **Market** is selected. The name is
inverted (B.4); React must pass `marketBased = (toggle === 'market')` and name its state accordingly.
Backend: `DecarbUtil.getColumn(Boolean)` → `co2e` (null/false = location) or `co2e_market` (true).
Only **Scope 2** types (`electricity`, `steam`) ever read the chosen column; Scope 1 always uses `co2e`.

**Org-layout calls** (fired in parallel from `fetchLiveData()` unless noted):

| # | Path | Called from | Used for |
|---|---|---|---|
| 1 | `GET general/site` | `fetchSiteMeta()` | Org-pie click-through: array of `{id,name,…}`, **filtered client-side by `isWriteAccess(id)`**, mapped to `siteMeta[{id,name}]`; also pushes the full list to `MonitorSharedService` |
| 2 | `GET output/organisation/pieChart?marketBased=` | `fetchPieChart()` | `{label:[siteName], value:[co2e]}` → Site-wise pie |
| 3 | `GET output/organisation/topGraphFirst?marketBased=` | `fetchGauges()` (forkJoin of 4) | Gauge 1 (overall) |
| 4 | `GET output/organisation/topGraphSecond?marketBased=` | ″ | Gauge 4 (intensity) |
| 5 | `GET output/organisation/topGraphThird?marketBased=` | ″ | Gauge 2 (Scope 1) — *endpoint takes no `marketBased`; the param is ignored* |
| 6 | `GET output/organisation/topGraphFourth?marketBased=` | ″ | Gauge 3 (Scope 2) |
| 7 | `GET output/organisation/topGraphFifth?marketBased=` | `fetchMonthlyDaily(baseline)` — **only after #3 succeeds with `baseline > 0`** | `{monthCo2e, daillyCo2e}` → Monthly/Daily linear gauges |
| 8 | `GET output/organisation/tableMonthlyEmission?marketBased=` | `fetchMonthlyEmission()` | `{labels, scope1, scope2, total, scope2Ration}` → combo chart |
| 9 | `GET output/equipmentTable/0?marketBased=` | `fetchTopContributors()` | `Record<equipmentName, [{siteId,siteName,equipmentName,co2e}]>` → top-5 by summed co2e |
| 10 | `GET output/organisation/overallGraph?marketBased=` | `fetchTargetVsActual()` | `{label, targetTotal/Scope1/Scope2, actualTotal/Scope1/Scope2, scope2Ratio, scope2RatioTarget}` |
| 11 | `GET output/organisation/overallTable?marketBased=` | `fetchOverallTable()` | `Record<type, [{siteId,type,plantName(=site name),co2e,scope}]>` → Scope tables |

**Org layout with a pie-slice filter active** (site chosen): calls 3–7 switch to `output/site/<name>/{siteId}`,
8 → `output/site/tableMonthlyEmission/{siteId}`, 9 → `output/equipmentTable/{siteId}`, 10 →
`output/site/overallGraph/{siteId}`, 11 → `output/site/overallTable/{siteId}`. The pie (2) and
site meta (1) are **not** refetched on a filter change (only on layout load / Market-Location toggle).

**Site-layout calls** (`siteId` from query param; `scope = output/siteLevel`):

| # | Path | Used for |
|---|---|---|
| 1 | `GET general/site` | (same as org; only used for `MonitorSharedService`) |
| 2 | `GET emissions/plant/{siteId}` | `plantMeta[{id,name}]` for plant-pie click-through. **Not** access-filtered |
| 3 | `GET output/siteLevel/pieChart/{siteId}/0?marketBased=` | Plant-wise pie `{label,value}` (always plantId=0 — unfiltered) |
| 4–7 | `GET output/siteLevel/topGraphFirst|Second|Third|Fourth/{siteId}/{plantId or 0}?marketBased=` | 4 gauges |
| 8 | `GET output/siteLevel/topGraphFifth/{siteId}/{plantId or 0}?marketBased=` | Monthly/Daily gauges — *endpoint ignores `marketBased`* |
| 9 | `GET output/siteLevel/tableMonthlyEmission/{siteId}/0?marketBased=` | Stacked-area: `[{name:"Scope1"\|"Scope2", label:[DD-MM], value:[…]}]` |
| 10 | `GET output/siteLevel/overallTable/{siteId}?marketBased=` | Scope tables (**no plantId variant exists** — hence the plant-filter exception below) |
| 11 | `GET output/siteLevel/yearlyGraph/{siteId}/{plantId or 0}?marketBased=` | Historical line chart: `[{name:"Total/Scope1/Scope2" (by group), label:[MM-YYYY], value:[…]}]` |

**Site layout with a plant-slice filter** (`plantId` set): gauges/monthly/daily/historical use the
plantId in the path; `tableMonthlyEmission` → `…/{siteId}/{plantId}`; **the Scope 1/2 tables are
not refetched** (the code skips `fetchOverallTable()` — "no confirmed plant-scoped endpoint" — so
they keep showing every plant while everything else narrows, B.10).

**Equipment route calls**:

| # | Path | Used for |
|---|---|---|
| 1 | `GET output/equipmentTable/0` | Table rows + per-row site pie (no `marketBased` → location basis always) |
| 2 | `GET output/equipmentGraphBar` | Progression line, by equipment name; **no params at all** |

**Plant layout (`hasPlant`)**: zero API calls (guarded by `if (!this.hasPlant) fetchLiveData()`).

### A.6 Backend controller → service → SQL trace

All under `OutPutController` (`@RequestMapping("output")`), `OutPutServiceImpl`, SQL builders in
`DecarbUtil`. **Read from `calculation_history` only** (plus `target_setting_target_value` for
targets/baselines and `organisation` for `baselineYear`). The data pipeline that fills
`calculation_history` is documented in the two companion docs; it is out of scope here.

Time windows (all computed server-side, server clock):
- **YTD** = `LocalDate.now().withDayOfYear(1)` (`getStartYear()`): gauges, pie, tables, equipment table.
  There is **no year selector** anywhere on this page — it is always the current calendar year.
- **Monthly chart** = from `today.minusMonths(1)` (rolling last-month window of *daily* points,
  labelled `DD-MM`) — the card is titled "Monthly" but plots daily values.
- **Monthly gauge** = from first day of the current month; **Daily gauge** = from the latest
  `max(timestamp)` in `calculation_history` (i.e. the last calculated day, not "today").
- **Historical / Target-vs-Actual** = from `organisation.baselineYear` (to 2030 for targets).

Scope definitions (hardcoded type lists): **Scope 1** = `stationary, mobile, process_emision,
fugitive`; **Scope 2** = `electricity, steam`; overall = both.

Shared de-dup rule used in almost every query (also documented for the Annual Report, A.4 there):
rows are taken at site level (`plant_id IS NULL`), plus plant-level rows **only for
type×site combinations that have no site-level row** in the window
(`CONCAT(type,'_',site.name) NOT IN (… plant_id IS NULL …)`), so site+plant entries aren't double counted.

Per endpoint:

- **`topGraphFirst`** (`topGraphFirstGraph`): `value = scope1Ytd + scope2Ytd`;
  `scope2BaseYearValue = base-year total` (scope1+scope2 for `baselineYear`; the "type=1" branch of
  `scope2BaseYearValue` includes all six types); `scope2TargetPresetYearValues = Σ target_setting_target_value
  for key=<current year>` (**all scopes** — `…All` variants), optionally `site_id=`; also returns
  `percentage` and `pointer` (unused by the React-relevant frontend).
- **`topGraphThird`** = Scope 1 only (value, base-year Scope 1, target `scope_type='Scope1'`).
- **`topGraphFourth`** = Scope 2 only (market-column aware).
- **`topGraphSecond`** = emission **intensity** = `YTD(co2e col) ÷ YTD "HVC"` (`topGraphSecondGraphSqlHvc`,
  production total); `scope2BaseYearValue` and `scope2TargetPresetYearValues` are **hard-coded 0**,
  so intensity gauges always have target=0, baseline=0 → gauge uses its fallback stops (0.6 / 0.85 of max).
  `indicator` is hard-coded `"Red"`.
- **`topGraphFifth`** → `{monthCo2e, daillyCo2e}` (see windows above). Org/site variants share one service
  method; `siteLevel/topGraphFifth` is a separate method with a plant branch and **no market column**
  (location only).
- **`organisation/pieChart`**: sites by name, Scope 1 + Scope 2, YTD, de-dup rule; **no ORDER BY**
  (`GROUP BY site_name` → arbitrary order). **No access filtering.**
- **`siteLevel/pieChart/{siteId}/{plantId}`**: plant names (`COALESCE(plant.name, site.name)`) — scope 1+2.
- **`tableMonthlyEmission`** / **`siteLevel/tableMonthlyEmission`**: three queries (scope1, scope2, total)
  + the **scope-2 scaling** described next.
- **`overallGraph`**: three target queries from `target_setting_target_value` (values for years ≤ current
  year are forced to **0** by `CASE WHEN key::int <= current year THEN 0`), three actual queries
  (`DecarbUtil.overallGraph…`), + **scope-2 scaling**.
- **`overallTable`** (org/site): scope1 + scope2 rows grouped `type → [rows]` (LinkedHashMap, sorted by
  `siteId`); for the **org** variant `plantName` carries the **site** name; Scope 2 co2e values are **not**
  `ROUND`ed in SQL (Scope 1 is).
- **`siteLevel/overallTable/{siteId}`** (`overallTableSiteLevel`): scope 1 rows joined to `plant`
  (real plant names, **only plant-level rows**), scope 2 rows via `overallTableScope2Sql(siteId, 0, …)` where
  `plantName` = **site** name (site-level + plant-fallback rows). That is why the Angular code does
  `excludeName = curSiteName` — it drops the "site-name" column but keeps its value in each row's Total.
- **`equipmentTable/{siteId}`**: per `(site, equipment_type)` YTD co2e (Scope 1 types use `co2e`, Scope 2
  types use the market-aware column), `co2e > 0` filter, grouped by equipment name, **sorted by total
  descending** in Java, each list sorted by `siteId`. (Top-5 contributors = first five keys.)
- **`equipmentGraphBar`**: per `(equipment_type, site, MM-YYYY)` **all-time** co2e (no year filter),
  then grouped by equipment into `{name, label:[MM-YYYY…], value:[…]}` → see B.12 (duplicate months).
- **`siteLevel/yearlyGraph/{siteId}/{plantId}`**: Scope 1 / Scope 2 / Total series by month from
  `organisation.baselineYear` + scope-2 scaling.

**The scope-2 scaling ("ratio") behavior** — easily missed, and affects the numbers users see:
`tableMonthlyEmission`, `overallGraph`, `tableMonthlyEmissionSiteLevel` and `yearlyGraph` all multiply
**every Scope 2 value by `ratio = 10^(digits(avg(Scope1) ÷ avg(Scope2>0)) − 1)`** before returning it
(so a Scope 2 series ~100× smaller than Scope 1 is plotted ~100× larger to be visible alongside it).
The ratio is returned in the payload (`scope2Ration`/`scope2Ratio`/`scope2RatioTarget`) but **the
frontend never reads it**: the chart tooltips/axis show the scaled number as if it were real tCO2e,
while the Total line/series is **not** scaled (B.5).

### A.7 Frontend business logic / transforms (all client-side)

**Query-param lifecycle** (`ngOnInit` subscribes to `route.queryParams`, runs on **every** emission):
set `hasSite`/`hasPlant`/`curSiteId`/`curSiteName`/`curPlantName`; **reset all four filter fields**;
set breadcrumb; if `!hasPlant` → `fetchLiveData()` = `fetchSiteMeta()` + `fetchPieChart()` +
`refetchFilteredPanels()` + (`hasSite` ? `fetchPlantMeta()`).

**`currentDataScope()`** → `{base, suffix}` used by gauges, monthly/daily and historical:
- `hasSite`: `output/siteLevel` + `/{curSiteId}/{filterPlantId ?? 0}`
- else filtered site: `output/site` + `/{filterSiteId}`
- else `output/organisation` + `""`.

**`refetchFilteredPanels()`** (everything except pie + site/plant meta): gauges, monthly emission;
org-only: top contributors + target-vs-actual; scope tables **unless** (`hasSite && filterPlantId != null`);
site-only: historical.

**Gauge assembly** (`fetchGauges`): four requests in `forkJoin` — **any single failure aborts all four
silently** (`error: () => {}`; old gauges were already cleared to `[]`). Result order is deliberately
`[first, third, fourth, second]` mapped onto titles `[Overall, Scope 1, Scope 2, Intensity]`.
`buildGaugeMetric`: requires `status===200 && data`; `value = Number(data.value)`,
`target = Number(data.scope2TargetPresetYearValues)`, `baseline = Number(data.scope2BaseYearValue)`
(**the field names are misleading — they hold the *selected scope's* target/baseline**, B.13). The
usable-number check (`isFinite && > 0`) is **commented out**, so zero/NaN gauges now render. Intensity gets `decimals=2`.
Per-gauge `gaugeType` (`stage-speed`/`temperature`) is passed on the org layout but the shared
`GaugeChartsComponent` has no such `@Input` and always renders the **temperature** style — the
other two gauge skins in that file are dead code (B.14). **React needs only the temperature skin.**

**Monthly/Daily KPI math** (`fetchMonthlyDaily`, runs only if the *first* gauge's `baseline > 0`, else
all eight KPI fields reset to 0):
```
monthlyActual = Number(monthCo2e) || 0      monthlyBaseline = firstGauge.baseline / 12
dailyActual   = Number(daillyCo2e) || 0     dailyBaseline   = firstGauge.baseline / 365
linear-gauge max = baseline × 1.2           tick = baseline
```
Linear gauge: grey pill track; fill = gradient `#FCE0BD → #F2A056` (value ≤ baseline) or
`#FCE0BD → #F2A056 → #C0392B` (overshoot, pivot at `baseline/value − 0.2`); value clamped to `[0,max]`;
black baseline tick; number printed to the right.

**Monthly chart (org)**: categories = `labels`; series `Scope 1` bar (`scope1`), `Scope 2` bar (`scope2`),
`Total` line (`total`). **Site monthly (stacked area)**: categories = `data[0].label`, one series per array
entry (`name === 'Scope1' ? 'Scope 1' : 'Scope 2'`), colours by index (`#C7E8F3` first, `#5B9BD5` second).
There is an **operator-precedence bug** in the response guard (B.15).

**Top contributors**: sum `co2e` per equipment key → sort desc → first 5 → labels/values.

**Target vs Actual**: per scope (`Total #80E5E8`, `Scope 1 #F2A056`, `Scope 2 #5B9BD5`) emit a **Target** bar
series (`target<Key>`) and an **Actual** line series (`actual<Key>`); **every `0` becomes `null`** (gap) via
`toNullable`; each series tagged with its scope for the dropdown filter (default shows only `Total`;
"All" toggles the rest — `createScopeFilterList`). The expanded (modal) view gets its own copy of the filter state.

**Scope tables** (`buildScopeRows`): flatten response, drop items missing `scope`/`type`/`plantName`; group
`scope → type → plantName → Σco2e`; columns = unique `plantName` list sorted by `siteId`
(`MonitorSharedService.getSiteList`) minus `excludeName` (site layout drops the site's own name);
row per type: `total = Σ all plantName values` (including the excluded column), `bySite = columns.map(→ value || 0)`.
Row labels are the **raw backend type strings** (`stationary`, `process_emision` — sic —, `electricity`…), **not**
prettified — the header just says "Scope 1"/"Scope 2" and rows print `row.label` as returned. Numbers
render via Angular `number:'1.0-0'` (thousands separators, 0 decimals).

> The `DUMMY_DATA_DISABLED.md` sample (`'Stationary','Mobile','Process Emission'…`) shows *pretty* labels
> from the old dummy data; the live path prints whatever the API's `type` is. **Verify the actual casing
> against a live response before building the display-label mapping** (Section E, Q7).

**Pie click behavior** (org: `onSiteSliceClick`, site: `onPlantSliceClick`) — **sets a filter, does not
navigate**: `filterSiteId/Name` (or plant), swaps `curSiteName`/`curPlantName` (so titles read the filtered
name), refetches `refetchFilteredPanels()`. ✕ on the chip clears and resets names. Layout stays put.
Org slice → `siteMeta[event.index]` (**index only**, B.6); site slice → match by **name** first, then index.

**Shared chart-card chrome** (`ChartHeader`, `ChartNoData`, `ChartExpandService`, `chart-download.util`): title
left; optional filter/toggle slot; Download icon (`getDataURL({type:'png', pixelRatio:2, backgroundColor:'#fff'})`,
file name = slugified title, falls back to `chart`); Expand icon (MUI Dialog 80vw × 78vh, max 1100px, renders the
same chart options larger; horizontal-bar passes its custom HTML legend through; bar-line passes a copy of
the filter). Pie: bottom legend, labels truncated to 10 chars + `…` (full name in tooltip), tooltip =
`title / marker name: 1,234 (45%) / <clickHint>`. Gauges have **no** download/expand.

**Palette** (`chart-palette.ts`) — fixed categorical order `#91cad1, #F2A056, #69a0e2, #9be0c9, #b6b6b6, #69da9e, #4cccdd`;
status colours good `#34A853` / warning `#F2A056` / serious `#ec835a` / critical `#D9534F`; ink `#0b0b0b / #52514e / #898781`,
gridline `#e1e0d9`. Do **not** treat these as final React tokens — `docs/decisions.md` (2026-09-30) says
chart-color review is a separate, later task; port Angular's literal series colours unchanged and flag them.

**Equipment page logic**: build `columns = getSiteList(data,'siteName')` (unique site names sorted by `siteId`);
per equipment key `bySite = columns.map(col → items.find(siteName===col)?.co2e ?? null)`, `total = Σ`;
`siteColors = columns.map(i → CHART_PALETTE[i % 7])`. Selecting a row (`selectRow`) rebuilds the pie from the non-null
cells and the progression from `equipmentGraphBar[name]` (**empty chart if that name has no live data** — dummy
fallback was removed). `selectRow(0)` runs after the table resolves; the progression map arriving later re-selects the
current row.

**Access control**: only `siteMeta` is access-filtered (`isWriteAccess`: SUPER_ADMIN always true; others need
`accesDetails.find(id===siteId && access)` from `user/dtls`). All `output/*` calls are un-filtered server-side (B.3).

### A.8 React implementation status

Nothing implemented. Existing building blocks that can be **reused as-is** (verified present):
`DashboardLayout`/`Header`/`Sidebar` shell (needs a nav model for this group), `HighchartsChart` wrapper
(`src/pages/report/components/HighchartsChart.jsx`), `unwrapResponseModel` (`api/helpers.js`), TanStack Query
conventions (`queryKeys.js`, `reportService.js`), `selectUserRole`/`selectUserSiteAccess` (`authSlice.js`),
`componentTokens` (including `chrome`), MUI theme, `MultiSelect` common component (candidate for the
Target-vs-Actual scope filter), `Dropdown`.

Not present and needed: ECharts-equivalent chart option builders (Highcharts — see C), gauge components,
`/dashboard/*` routes + nav model, dashboard service/hooks. `echarts` is **not** a React dependency
(only `highcharts` + `highcharts-react-official`).

---

## B. Current Problems and Limitations

*(Documented only — none fixed in the parity pass, per CLAUDE.md.)*

**B.1 — Whole page is silently-failing by design.** Every `subscribe` has `error: () => {}` and there is no loading
or error UI. A failed/empty call just leaves an empty array → the card shows "Data not available" (charts) or an
empty table row — indistinguishable from "no data this year". `forkJoin` means one failed gauge call also wipes the other
three. Only the global `LoaderInterceptor` spinner (if any) reflects request state.

**B.2 — The Plant layout is dead code with fake numbers.** `hasPlant` needs a `plantId` query param, but nothing in
the app produces one (sidebar emits only `siteId`/`siteName`; the pie click sets an in-page *filter*, not a route). If someone
hand-types `?siteId=1&plantId=2` they get a page with **hardcoded** gauges, tables (`OSBL`/`ISBL` fixed columns), pie and charts
that look real but aren't — in a production compliance dashboard. Documented in `DUMMY_DATA_DISABLED.md` as intentionally
left (no endpoint wired). **Recommendation in Q4**: do not port.

**B.3 — Access control is client-side only, and the sidebar's own check is ineffective.**
(a) `isWriteAccess` is the only per-site gate and the sidebar guard `route !== '/report/emission-dashboard'` is always false for
site links (they carry that exact route), so a user without access to a site can still click into it and every `output/*` call
returns that site's data — the backend does not filter by user's `userSiteAccessDetails`. (b) The org-level aggregates
(`pieChart`, gauges, tables) include **all** sites regardless of the viewer's access (the pie doesn't filter either; `siteMeta`
does, causing B.6). (c) Role gating of `/report` is declared-but-not-enforced (B.18). *Security-relevant.*

**B.4 — `isLocationBased` is inverted.** True means **Market** is selected (it feeds `marketBased=`). Anyone "fixing" it by
passing `!isLocationBased` would flip every Scope 2 number.

**B.5 — Scope 2 values are rescaled by a hidden power-of-10 ratio and the ratio is never shown.** See A.6. Affects:
org Monthly (Scope 2 bars), Target-vs-Actual (Scope 2 target & actual), site Monthly stacked area, site Historical. The Total
line/series is **not** scaled, so on the org monthly chart `Scope 1 bar + Scope 2 bar ≠ Total line` (e.g. Scope 2 ×100 or ×1000),
and tooltips present the inflated figure as real tCO2e. Likely a visibility hack for charts sharing a y-axis, but it is
a data-correctness/UX issue in a GHG dashboard. React must **replicate the API as-is** (or the numbers will differ from
Angular) and flag this; changing it is a backend/product decision (Section C, item 2).

**B.6 — Org pie click maps slice → site by array index.** `siteMeta[event.index]`, where `siteMeta` is `general/site`
(access-filtered, in site order) but pie slice order comes from `output/organisation/pieChart` (`GROUP BY site_name`,
**no ORDER BY**, not access-filtered). Any ordering difference or any site the user can't access shifts the index →
**the page filters to the wrong site** (and the chip "Showing: <wrong site>"). The site-layout plant pie already matches
by name first (`event.name`) — the org one does not. Real data-correctness bug.

**B.7 — Equipment sidebar link passes `11` as queryParams.** Sentinel leftover; harmless today (ignored). Also the navigate
string is built as `'/' + route` where `route` already starts with `/` → `//report/…` (Angular tolerates it).

**B.8 — `activeSubMenu = Number(siteId) − 1`.** Assumes site ids are 1-based, contiguous and equal to array index. If a site
is deleted/ids are sparse, the **wrong sidebar row is highlighted** (`NaN` for the org route is handled explicitly). Also
sets `activeSubMenu = NaN` when no `siteId` (both branches of the `if/else` do the same thing).

**B.9 — Any query-param change re-runs the entire page and resets filters.** The nav-bar chevron (`details=true`) is the
visible trigger. Not harmful, but the chevron does nothing useful and refetches ~12 endpoints.

**B.10 — Plant filter leaves the Scope tables unfiltered** (no plant-scoped table endpoint) while every other panel narrows.
Mixed scope on one screen with no indicator.

**B.11 — Rolling "monthly" window and "latest-day" daily window are server-clock, not calendar-aligned.**
`tableMonthlyEmission` uses `now − 1 month` (so the number of plotted days varies and straddles two months); the Daily gauge
uses `max(timestamp)` of the whole table, not "yesterday/today". On Jan 1 all YTD gauges are 0 until data lands (no year
selector, no "previous year" fallback).

**B.12 — `equipmentGraphBar` emits one point per (site × month), grouped only by equipment.** For an equipment at 3 sites the
x-axis gets 3 entries per month (`['01-2026','01-2026','01-2026', …]`) and the line zig-zags between sites' values. The
frontend consumes it verbatim. Also no year/`marketBased` filter and not ordered by site within a month.

**B.13 — Misleading backend field names.** Gauges read `scope2BaseYearValue` / `scope2TargetPresetYearValues` for **every**
gauge (overall, scope 1, scope 2); they hold the selected scope's baseline/target. Intensity returns `0` for both.

**B.14 — Dead code / unreachable branches** (don't port): two of three gauge skins (`grade`, `stage-speed`), `gaugeType`,
`GaugeChartsComponent` inputs `percent/pointer/typeNameIndex/unit/height`, `topGraphFirst/Second…` `percentage`/`pointer`
fields (server computes, frontend ignores), `view-all-link` CSS, `buildDayLabels`/`buildMonthlySeries`/…
dummy generators, `plantGaugeMetrics`/`plant*` fields, `site/pieChart`, `top3Cotributor`, `plantWiseTable`,
`equipmentGraphPie`, `siteLevel/overallTableTotal`, `overallTable?year=`.

**B.15 — Operator-precedence bug in `fetchMonthlyEmission`'s guard.**
`response?.status !== 200 || this.hasSite ? A : B` parses as `(status!==200 || hasSite) ? A : B`. On the **org** layout with a non-200
status the "site" check (`!Array.isArray(data) || !data.length`) runs instead of the org check (`!data?.labels?.length`); if that
body happens to be an array it proceeds, then `data.labels` is `undefined` and the chart is fed `undefined`. Low likelihood today
(non-200 bodies are not arrays), real latent bug.

**B.16 — Server crashes / `NaN` / `Infinity` on empty or degenerate data (500 → silently swallowed by B.1).**
`tableMonthlyEmission`: `average.getAsDouble()` throws `NoSuchElementException` when Scope 1 is empty. `tableMonthlyEmissionSiteLevel`
and `yearlyGraph`: `cp1`/`cp2` `findAny().get()` + `getAsDouble()` throw when Scope 1 or Scope 2 has no rows (e.g. a site with no
electricity/steam in the window). Division by zero in the ratio or the gauges (`percentage = target / baseline × 100`,
intensity `÷ HVC`, `÷ scope1Base`) yields `NaN`/`Infinity` (Jackson serialises these as the *strings* `"NaN"`/`"Infinity"` by default) —
`debug summary` already recorded `Long.MAX_VALUE` in `percentage`. React must defend: coerce with `Number()`, treat
non-finite as "no data" for display (without changing the contract).

**B.17 — SQL via string concatenation** (`siteId`, `plantId` are `int` path vars — low risk; `year` on `overallTable` is a `String` —
unused here). Same class as Annual Report B.1. The org baseline year is also string-concatenated.

**B.18 — Role gating declared, not enforced** (`/report`: SUPER_ADMIN/ADMIN/USER) — cross-cutting, see `docs/backend-context.md`.
The `USER` role is only handled in the *sidebar* (hides Edit/Enter Data). React should keep that sidebar behavior; do not add route gating
(CLAUDE.md: no extending auth beyond the current contract).

**B.19 — Pie palette for plants has two colours.** `sitePieColors = ["#FED966", "#F2A056"]` — a site with 3+ plants repeats colours.
Org pie uses the 7-colour palette (also wraps beyond 7 sites). Equipment page colours sites by `siteIndex % 7`.

**B.20 — Two overlapping legacy dashboards still exist in Angular** (`/report` & `/report/equipment` → `EquipmentComponent`;
`/report/equipment-details` → `EquipmentsComponent`). The `emission-dashboard` pair is a revamp of them
("Mirrors equipments.component.ts…"). Out of scope; do not port the old ones unless asked.

**B.21 — Stale sidebar state via `sessionStorage['report']`.** `landing-page.navigate()` sets `report=true` when the **Report** tile is
used; the sidebar then takes the `report_single` path. If a user lands on `/report/emission-dashboard` while that flag is stuck
(deep-link/refresh after having used the Report tile), `sideMenuData` stays **undefined** in `ngOnInit` (the `if (sessionStorage.getItem('report')) {}` branch is empty) —
the sidebar can render empty until something re-triggers it. React sidesteps this by deriving the menu from the *route group*, not a session flag.

**B.22 — Performance.** ~12 requests fan out on every load / toggle / filter change with no cancellation (Angular) — stale responses can overwrite
newer ones if the user clicks fast. Heavy per-request SQL with repeated NOT-IN subqueries. TanStack Query's keyed cache/abort covers the client side in React.

---

## C. Proposed Future Improvements

*(Documented, not implemented.)*

1. **Fix the org pie → site mapping** (B.6): return site ids from `pieChart` (or match by name). Frontend-only match-by-name is a one-line, low-risk fix. *Priority: high (wrong data on screen).*
2. **Remove or surface the Scope 2 ratio** (B.5): either drop the scaling server-side (and let charts use a secondary axis) or show "Scope 2 ×N" in tooltip/legend using the already-returned ratio. *Product decision first; medium risk (changes every number).*
3. **Give every panel real loading/empty/error states** (B.1) instead of a silent "Data not available". Layer: frontend; low risk. Independent panel states instead of `forkJoin`.
4. **Enforce per-site access server-side** (B.3) and filter `pieChart`/aggregates by the caller's accessible sites. *Backend; security-relevant; medium risk.*
5. **Delete the dead Plant layout** or wire a real plant endpoint set (B.2). 
6. **Fix `equipmentGraphBar`** to aggregate by month across sites (or by site series) and add a year filter (B.12).
7. **Add a year selector / "previous period" fallback** (B.11) and align the "monthly" window to a calendar month.
8. **Guard zero/empty arithmetic server-side** (B.16): return `0`/omit instead of throwing.
9. **Rename the misleading fields** (`scope2BaseYearValue` → `baselineValue`, …) and the inverted `isLocationBased` (B.4, B.13).
10. **Add a plant-scoped overall-table endpoint** so the plant filter is consistent (B.10).
11. **Derive the sidebar from the route group, not `sessionStorage` flags** (B.21) — already how React will do it.
12. **Unify chart libs** — Angular ECharts vs React Highcharts is a parity risk in itself (see Section D notes).

---

## D. Implementation Status

Legend: ✅ done · 🟡 implemented, unverified · ◐ partial · ❌ not started · 🚧 blocked · ⏸ deferred by recommendation

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Investigation / this doc | ✅ | Angular routes, sidebar JSON, ~30 distinct endpoint variants, SQL, business logic traced |
| 2 | Route `/dashboard/emission-dashboard` registered, protected | 🟡 | + `ROUTES` constants; see Q1 for `/dashboard` itself |
| 3 | Route `/dashboard/emission-dashboard/equipment` registered | 🟡 | |
| 4 | Sidebar for the dashboard group (Monitor + site sub-menu + Equipment, role-filtered) | 🟡 | Needs `general/site`; see Q2/Q3 |
| 5 | Page title row (`{site} Emission Overview`) with Site/Plant filter dropdown | 🟡 | Chevron dropped; filter dropdown replaces click-the-pie discovery (Q5) |
| 6 | Data layer: `dashboardService` + `useEmissionDashboardData` (TanStack Query, per-panel queries, `marketBased` threading) | 🟡 | Business logic ported bug-for-bug where it affects output (B.4/B.5/B.12 consumed as-is) |
| 7 | Gauge strip (4 temperature-style gauges + KPI card with 2 linear gauges) | 🟡 | |
| 8 | Org layout: site pie (+ click filter + chip), monthly combo (+ toggle), top contributors, target-vs-actual (+ scope filter), scope table | 🟡 | |
| 9 | Site layout: 2 scope tables (+ toggle in Scope 2 header), plant pie (+ click filter), monthly stacked area, historical line | 🟡 | |
| 10 | Plant layout (`?plantId=`) | ⏸ | Not ported — decided (Q4): hardcoded dummy, unreachable |
| 11 | Location ⟷ Market toggle (3 locations) | 🟡 | Correct inverted-name semantics (B.4) |
| 12 | Chart card chrome: Download PNG, Expand modal, "Data not available" | 🟡 | |
| 13 | Equipment Overview route: table + row-select + site pie + progression | 🟡 | |
| 14 | Loading/error UX | ⏸ | Deferred by decision (Q6); only "Data not available" empty states exist |
| 15 | Highcharts chart option builders + chart colours | 🟡 | Port ECharts literal colours unchanged; palette review is a later task (decisions.md 2026-09-30) |
| 16 | Backend changes | ⏸ | None — contract preserved |
| 17 | End-to-end verification against live data | 🚧 | Same blocker as other routes unless backend reachable; `calculation_history` must also have data (see companion docs) |

**Implementation checklist (to tick during build)**: layout selection from query params ▢ filter reset on any param change ▢ forkJoin-equivalent
gauge gating (first gauge baseline>0 → monthly/daily) ▢ monthly/daily math (÷12, ÷365, ×1.2) ▢ scope-table builder (`excludeName`) ▢ top-5 builder ▢ target-vs-actual
`0→null` + default `Total` filter ▢ pie click filter by index (org, **flag B.6**) / by name (site) ▢ Scope 2 rows labelled as returned ▢ equipment row-select ▢ `marketBased` flag
inversion respected ▢ non-finite numbers don't render `NaN` ▢ page re-fetches on toggle but not on filter for pies/meta.

---

## E. Open questions for approval (answers needed before building)

| Q | Question | Recommendation |
|---|---|---|
| **Q1** | `/dashboard` namespace: Angular's `/dashboard` is **GHG Setup**. What should React `/dashboard` itself do, and where will GHG Setup go later? | Make `/dashboard` redirect to `/dashboard/emission-dashboard`; when GHG Setup is ported give it its own prefix (e.g. `/setup`) |
| **Q2** | Sidebar for this group: include **Target Setting** and **Edit/Enter Data** (they're in `report.json` but have no React routes yet)? | Render only Monitor now; add the others when their routes exist (dead links in production are worse than a short menu) |
| **Q3** | Sidebar per-site entries: gate on `isWriteAccess` (what Angular *intended*) or leave every site clickable (what Angular *does*, B.3)? | Show all sites but gate click-through with the toast, matching intent; flag it in the doc (not a redesign, fixes an obvious guard typo). Needs your OK since it deviates from literal Angular behavior |
| **Q4** | Port the Plant layout (`?plantId=`)? | **No** — unreachable, dummy data (B.2) |
| **Q5** | Port the top-bar chevron (`showDetail` → `details=true`)? | No — no destination; it only causes a refetch (B.9) |
| **Q6** | Loading/error states: parity (silent) or minimal per-panel skeleton + "Failed to load" text? | Minimal per-panel states; zero change to data/contract. Strictly beyond parity — your call |
| **Q7** | Scope-table row labels: print backend `type` as-is (`process_emision`) or map to pretty names ("Process Emission")? | Need a live response to check actual casing; recommend a display-only mapping |
| **Q8** | Tables: use MUI X DataGrid (CLAUDE.md default) or plain MUI `Table` (Annual Report precedent)? | DataGrid for the Equipment table (clickable-row selection fits); DataGrid with dynamic columns + `hideFooter` for scope tables (Scope 1 and Scope 2 as two grids, since DataGrid can't render two header bars in one grid). Deviate only if sticky-column/design fidelity can't be met |
| **Q9** | Chart colours: port Angular literals unchanged (incl. `CHART_PALETTE`)? | Yes, unchanged; palette review stays a separate task |
| **Q10** | Is there an approved **design handoff** (like the GHG Report / Monthly Summary ones)? | `decisions.md` shows handoff-first for visual layer; without one, build parity with existing tokens and re-skin later |
| **Q11** | Chart library: Highcharts (already used by Monthly Summary, no new dependency except `highcharts-more`+`solid-gauge` modules) vs adding ECharts to match Angular? | Highcharts — one chart stack in the app; gauges via `highcharts-more`, linear gauge via a small SVG/MUI component, PNG download via `exporting`+`offline-exporting` modules |
| **Q12** | Download/Expand: implement on all chart cards as Angular does? | Yes (parity) — MUI Dialog for expand |

---

## Verification performed (investigation phase)

- Read in full: `emission-dashboard.component.{ts,html,scss}`, `equipment-emission.component.{ts,html}`, `monitor-routing.module.ts`,
  `app-routing.module.ts`, `side-bar.component.{ts,html}`, `nav-bar.component.{ts,html}`, `landing-page.component.ts` (nav logic),
  `report.json`, `monitor-shared.service.ts`, `breadcrumb.service.ts`, `emission-api.service.ts` (role/access), `auth.guard.ts`,
  all `shared-component/e-charts/*` used by this page (gauge, linear gauge, pie, bar-line, stacked-area, horizontal-bar, header, no-data,
  expand/download/filter utils), `DUMMY_DATA_DISABLED.md`.
- Backend: `OutPutController` (all routes), `OutPutServiceImpl` (equipment, pie, monthly, overall graph/table, topGraph 1–5, yearly,
  site-level variants), `DecarbUtil` SQL builders for pie / monthly / overallTable / topGraphFifth / pieChartSiteLevel / equipment table.
- **Not performed**: live-response capture (field casing, `type` strings, empty-data behavior — Q7), visual comparison with the running
  Angular page, backend reachability from this environment. Claims in A.5–A.7 about response shapes come from the Java model classes
  (`OrgPieResponse`, `OutputPlantResponse`, `OutputEquipmentResponse`) and service code, not from an observed response.
- Not traced to SQL level (low value, shared with other routes): `general/site`, `emissions/plant/{siteId}`, `topGraphSecondGraphSqlHvc`,
  base-year/YTD helper SQL (`scope*YtdValuesSql`, `scope*BaseYearValueSql`), `overallGraphSql*`, `yearlyGraphSql*`.


---

## F. Decisions made and implementation notes (2026-10-07)

**Answers to Section E**

| Q | Decision |
|---|---|
| Q1 | `/dashboard` redirects to `/dashboard/emission-dashboard`; GHG Setup will use `/setup` later |
| Q2 | Sidebar has Monitor (+ sites + Equipment), Target Setting, Edit/Enter Data. The last two are dead links until built. React paths: `/dashboard/target-setting`, `/dashboard/edit-enter-data` (Angular: `/report/*`; same rename logic) |
| Q3 | Working per-site access check (toast "You don't have access to this site.", no navigation) |
| Q4 | Plant layout not ported. Site and Organisation layouts only |
| Q5 | Pie-click discovery replaced by a **Site / Plant dropdown in the title row** (Overall + the pie's entries). Pie click still sets the same filter. Chevron button dropped |
| Q6 | Loading/error states deferred |
| Q7 | Decided from the SQL, not a live response (backend not reachable from the build environment): `type` strings are lower-case SQL literals (`process_emision` [sic]) → display-only mapping to Stationary / Mobile / Process Emission / Fugitive / Electricity / Steam. Unknown types fall back to Title Case. Equipment names are shown as returned |
| Q8 | DataGrid for the Equipment table; plain MUI `Table` for the Scope tables (Community DataGrid has no column pinning and can't hold two header bars) |
| Q9 | App palette (`emissionTheme.js`), not Angular's hexes |
| Q10 | Design handoff to come later; built on existing tokens |
| Q11 | Highcharts everywhere (added `highcharts-more`, `solid-gauge`, `exporting`, `offline-exporting` module imports in the shared `HighchartsChart.jsx`) |
| Q12 | Download PNG + Expand implemented on chart cards (gauges have neither, as in Angular) |

**Deviations from Angular (intentional)**

1. Filter dropdown in the title row (Q5); options = pie entries that resolve to an accessible site (org) / a plant (site), matched **by name**, which also removes the B.6 index-mapping bug.
2. Sidebar site check actually works (B.3 / Q3). Sidebar links drop the unused `showDetail`/`details` params. Nav chosen by route group, not a `sessionStorage` flag (B.21).
3. Gauges load as four independent queries instead of `forkJoin`, so one failed call no longer blanks all four; a gauge whose value is non-finite shows "Data not available" instead of `NaN` (B.16).
4. Series names/colours for the site stacked-area and historical charts are matched on the response's own scope name (falling back to array index) instead of index only (backend groups through a HashMap).
5. Gauge draws only the "temperature" skin (the only one Angular renders), target/baseline as tick marks with a text caption underneath (no hover tooltips on the ticks; Angular had them). No arc percentage labels.
6. Intensity gauge (target = baseline = 0) draws no tick marks (Angular drew both at 0).
7. Scope-table row labels prettified (Q7).
8. Page titles use `tCO₂e` (matches the other React pages) instead of `tCO2e`.
9. Highcharts' global defaults set `exporting.enabled=false` and **`fallbackToExportServer=false`** so chart data can never be posted to Highcharts' public export server.

**Consumed as-is (documented bugs, not fixed)** — B.4 inverted flag (React state is `market`, passes `marketBased=` correctly), B.5 hidden Scope 2 ×10ⁿ scaling, B.10 plant filter not re-scoping the Scope table, B.11 windows, B.12 `equipmentGraphBar` duplicate months, B.13 field names.

**Verification performed**
- `npm run lint` (0 errors; 1 warning of the same kind existing files already have) and `npm run build` pass.
- Headless-Chrome smoke test with mock data (temporary harness, deleted): all chart types, both gauge kinds, toggle, Scope table and the Expand dialog render; `exportChartLocal` produces a local `data:image/png` download with no network call.
- **Not verified**: anything against real backend data (`192.168.11.62:8083` unreachable; also `calculation_history` must have data), the sidebar/routing in a logged-in session, access-denied toast, filter dropdown behaviour, DataGrid rendering, and visual comparison with Angular.


---

## G. Design handoff applied (2026-10-07)

Source: `C:\Users\gpetkar\Desktop\Dashboard page handof\` (`EmissionOverview.jsx`, `emission-charts.js`,
`emissionData.js`, `README.md`) — an **organisation-level** design. Layout, spacing, type, KPI
cards, charts and the breakdown table were ported from it; the Site layout reuses the same
cards/table/charts. The handoff's mock `emissionData.js` was not used — all data still comes from
the real endpoints.

**Where the handoff and the existing app differ (per instruction: use ours)**
- Site select → our `Dropdown` (not the handoff's `SiteSelect`); numbered tabs → our `AppSegmentedTabs`;
  icons → `src/components/icons` (Download/Expand/Close/GridDashboard).
- Every hex in the handoff's `C` object was mapped to the nearest theme token in `emissionTheme.js`
  (each line comments the handoff value it replaced). Closest-but-not-identical: ink `#2E2A25`→`#2F2F2F`,
  body `#4A453E`→`#4A4A4A`, selected-column teal `#EAF5F2`/`#F3FAF8`→`#EAF6F5`/`#EAFAF8`, error text
  `#C2413C`→`#B23935`, "no target" tint `#F3EFE9`→`#F0EDE8`, grid `#F2EDE6`→`#F2ECE3`, axis label
  `#9A948B`→`#9A9A9A`, dash `#C9C1B5`→`#CFC7BA`. Card radius 16 / shadow / paddings kept as specified.

**Structural changes this caused**
- Row 1 = 4 KPI cards (value, "% of target" pill, progress bar, Target/Baseline) + "This month | Today"
  card, built from the same `topGraph*` calls as the old gauges. The gauge/linear-gauge components,
  `highcharts-more` and `solid-gauge` imports were removed (unused).
- The monthly/daily card now always loads (`topGraphFifth`); Angular gated it on the first gauge's
  baseline > 0 only because it needed that for its linear gauges.
- "Daily tCO₂e Emission" = stacked Scope 2 / Scope 1 columns + peak/average (days with data only);
  Location/Market tabs live on this card (org) or on the breakdown table (site).
- Target vs Actual is now a single-scope chart (Total / Scope 1 / Scope 2 tabs) with actual (solid)
  and target (dashed) columns, a "Target years" band and a baseline line (baseline = that scope's KPI baseline).
- Breakdown table: single table, scope subtotal rows, all canonical categories always listed (zeros "—"),
  selected site's column tinted. **It is no longer re-scoped by the site filter** — the design shows every
  site and highlights the selected one — and the donut for a selected site shows that site's source
  categories (taken from this table).
- Pie click-to-filter still works (donut slices); the title-row dropdown remains the primary control.
- Expand (full screen) only on the Daily chart, as in the design; Download PNG on every chart card.

**One deliberate data correction (B.5)** — the design plots Scope 2 *stacked on* Scope 1 and as a stand-alone
series, where the backend's hidden ×10ⁿ Scope 2 scaling would be plainly wrong (stack height ≠ total; peak/avg
wrong). The ratio the API already returns (`scope2Ration`, `scope2Ratio`, `scope2RatioTarget`) is now divided back
out in `emissionAdapters.js` (`unscale`) for the daily chart, the target-vs-actual Scope 2 view, and the site
monthly/historical charts. Non-finite or non-positive ratios are ignored (values left as returned). The backend is
unchanged. If the backend later stops scaling, remove `unscale` (the ratio field should then be absent/1).

**Not applicable / not done:** Site layout has no handoff of its own (derived from the org design); the handoff's
"scale org series by the site's share" mock behaviour is not used — the real per-site endpoints are.

**Verification:** lint (0 errors) + build pass; headless-Chrome render of the Organisation and Site layouts with
mock API-shaped data seeded into the query cache (all cards, charts, tabs, table, dropdown render; compared by eye
against the handoff). Not verified against the real backend or side-by-side with `Emission Overview.dc.html`.
