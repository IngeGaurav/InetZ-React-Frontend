# Decarb "Annual Report" Route — Analysis & React Migration

> Route: Angular `/report/report` (`#/report/report`) → React `/report/report`.
> Angular component: `ReportComponent` (`InetZ Frontend/InetZ-Frontend/src/app/monitor/report/`).
> React implementation: `InetZ React_Frontend/src/pages/report/AnnualReportPage.jsx` (+ helpers).
>
> This route is the "Annual GHG Report" page — a 5-section (A–E) statutory-style GHG inventory
> report for a single reporting year, with a site filter, a downloadable/printable PDF export,
> and three data tables (base-year scope totals, selected-year scope totals, emissions
> disaggregated by source type and plant).

---

## A. Current Implementation

### A.1 Angular routing & component tree

- `/report` → `MainLayoutComponent` (shell, shared with `/dashboard`) → `MonitorModule` (lazy) →
  `/report/report` → `ReportComponent`.
- No route params, no query params, no resolvers, no route-level guard beyond the inherited
  `AuthGuard` on `/report` (declares `roles: SUPER_ADMIN/ADMIN/USER` but — per
  `docs/backend-context.md` / `ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md` §9 — this `data.only` role
  list is **not enforced anywhere**, dead `ngx-permissions` wiring).
- `ReportComponent` is a single, self-contained component — no child components other than the
  shared `app-select-dropdown` and PrimeNG's `p-tabView`/`p-tabPanel`/`p-multiSelect`.
- Files: `report.component.ts` (602 lines), `report.component.html` (611 lines, note the entire
  visible page is duplicated a second time inside a `display:none` `#pdf-content` div — see A.4),
  `report.component.scss` (338 lines).

### A.2 Page structure (5 tabs, PrimeNG `p-tabView`)

| Tab | Header | Content |
|---|---|---|
| A | ORGANIZATIONAL DETAILS | 5 read-only fields: org name, address, contact name, contact info, reporting period (= selected year) |
| B | BOUNDARY CONDITIONS | Organizational boundary text; a Site/Plant/Type-of-Control/Equity-Share table (`orgData`); an "excluded facilities" free-text field; two static informational rows (GHG categories list, "Scope 3 included? No") |
| C | METHODOLOGIES | Emission-factor database name, GWP AR version, a static methodology citation block (`escapedHtml`, rendered via `[innerHTML]` — hardcoded EPA citations, not from the backend), two more static informational rows |
| D | EMISSIONS FROM FACILITY | Base-year info fields; **Table 1** — Emission for Base Year (expandable Scope1/Scope2 tree); **Table 2** — Emission for selected Year (same shape, different year); **Table 3** — emissions disaggregated by source type × plant (expandable site→plant tree) |
| E | OFFSETS | Static table shell with 2 blank editable input rows (Quantity/Type/Verified) — **no backend persistence at all**, purely a print template placeholder |

Top-of-page controls (outside the tabs): title `GHG Report for Year {selectedYear}`, a Site
dropdown, a Year dropdown (`['2022','2023','2024','2025']`, hardcoded, default `'2025'`), a
Download-PDF icon button, and a Print icon button that opens a small popover with its own
Year/Site dropdowns (bound to the *same* `selectedYear`/`selectedSite` as the top-of-page ones —
not independent state, see A.5) plus a multi-select for which of the 5 sections to include.

### A.3 Backend APIs used (all via `ApiService.getData(url)`, all wrapped `{ status, data }`)

| # | Method/Path | Called from | When | Purpose |
|---|---|---|---|---|
| 1 | `GET general/dropdown?type=Database` | `getDropDown()` | `ngOnInit` | Options list used only to resolve `dbName` (emission-factor DB display name) once org data loads |
| 2 | `GET general/organisation` | `getOrganization()` | after #1 resolves | `orgDetails` (name, address (JSON string), contactPerson, phone, dbType, gwp, boundy, baselineYear, share) — feeds Tab A/B/C/D static fields |
| 3 | `GET emissions/site` | `getSite()` | `ngOnInit` | Site list (id, name, boundary, equity) → site dropdown options; triggers #4 |
| 4 | `GET general/orgChart` | `getOrganizationChart()` | after #3 resolves | Hierarchical org chart (sites → child plants) → combined with #3's boundary/equity fields to build `orgData` (Tab B's table) |
| 5 | `GET output/getReportBaseYearScopeValues` | `getReportBaseYearScopeValues()` | `ngOnInit` | Scope1/Scope2 totals **for the org's baseline year** (`Organisation.baselineYear`, not the selected year) — Tab D Table 1 |
| 6 | `GET output/getReportEmisisoYearScopeValues?year={selectedYear}` | `getReportEmisisoYearScopeValues()` | `ngOnInit`, and again on year change | Same shape as #5 but for the **selected** year — Tab D Table 2 |
| 7 | `GET output/organisation/outputEmissions/{siteId}?year={selectedYear}` | `getOverallTableData()` | `ngOnInit`, and again on year/site change | Emissions grouped by site/plant × source type — Tab D Table 3. `siteId` is `0` for "All sites" (`currentSiteId` default), else the selected site's numeric id |

None of these are POST/mutating — the whole page is read-only against existing calculation data.
Nothing on this page writes to the database (Tab E's inputs are visually editable but bound to
nothing — see B.3).

### A.4 Backend controller → service → SQL trace

- **`general/dropdown`, `general/organisation`, `general/orgChart`** → `DecarbController`
  (`@RequestMapping("general")`) → `DecardService.getDropdown/getOrg/getOrgChart`. Not traced to
  SQL level in this pass (straightforward lookups, not report-specific business logic — lower
  risk/value to trace further given the scope-restriction on this phase).
- **`emissions/site`** → `EmissionsController` (`@RequestMapping("emissions")`) →
  `EnterEditDataServiceImpl.getSite()`. Not traced further (see above).
- **`output/getReportBaseYearScopeValues`** → `OutPutController.getBaseYearScope1Values()` →
  `OutPutServiceImpl.getBaseYearScope1Values()`:
  ```java
  var org = decardService.getOrg();
  return new ResponseModel(200, getBaseReportDt(org.getBaselineYear()));
  ```
- **`output/getReportEmisisoYearScopeValues?year=`** → `OutPutServiceImpl.getEmisisonReportingYearValues(year)`:
  ```java
  return new ResponseModel(200, getBaseReportDt(Integer.parseInt(year) + ""));
  ```
  Both endpoints funnel into the same `getBaseReportDt(String year)` — the only difference is
  which year string gets passed in (org's fixed baseline year vs. the user-selected year).
  `getBaseReportDt` calls `getYtdValue(siteId="0", year, types, scopeLabel)` once for Scope1
  types (`stationary, mobile, process_emision, fugitive`) and once for Scope2 types
  (`electricity, steam`), then prepends a computed `parent` total row to each (summed from the
  per-site child rows in Java, not SQL).
- **`getYtdValue`** raw SQL (string-concatenated, not parameterized — see B.1):
  ```sql
  SELECT '<scope>' AS scope, t2.name as label,
    ROUND(COALESCE(SUM(NULLIF(t1.co2,'NaN'::float)),0))  as co2,
    ROUND(COALESCE(SUM(NULLIF(t1.ch4,'NaN'::float)),0))  as ch4,
    ROUND(COALESCE(SUM(NULLIF(t1.n2o,'NaN'::float)),0))  as n2o,
    ROUND(COALESCE(SUM(NULLIF(t1.co2e,'NaN'::float)),0)) as co2e
  FROM calculation_history t1
  JOIN site t2 ON t1.site_id = t2.id
  LEFT JOIN plant t3 ON t1.plant_id = t3.id
  WHERE EXTRACT(YEAR FROM t1.timestamp) = '<year>' AND t1.type IN (<types>)
    AND (t1.plant_id IS NULL
         OR (t1.plant_id IS NOT NULL AND CONCAT(t1.type,'_',t2.name) NOT IN (
               SELECT DISTINCT CONCAT(t1sub.type,'_',t2sub.name)
               FROM calculation_history t1sub JOIN site t2sub ON t1sub.site_id = t2sub.id
               WHERE t1sub.plant_id IS NULL AND EXTRACT(YEAR FROM t1sub.timestamp) = '<year>'
                 AND t1sub.type IN (<types>)
             )))
  GROUP BY t2.id, t2.name ORDER BY t2.id
  ```
  Reading: return one row per site (`label` = site name) with summed co2/ch4/n2o/co2e for the
  given year+type set, **unless** that site has plant-level rows for that type — in which case
  the coarse site-level row is suppressed in favor of the finer plant-level rows already present
  in `calculation_history` (the NOT IN subquery is a de-dup guard against double-counting a
  site that has both a site-level and plant-level entry for the same type/year, not a
  site/plant rollup — plant-level rows are joined to `site` via `t2.name`, so a plant's row
  actually surfaces under its *site's* name, not the plant's own name; there is no plant-level
  breakout in this particular table's output — a schema/label quirk, see B.2).
- **`output/organisation/outputEmissions/{siteId}?year=`** → `OutPutServiceImpl.outputEmissions(siteId, year)`:
  Runs a similar UNION ALL query (`sqlScope1`, despite the variable name it covers both scope1
  *and* scope2 types together) grouped by `(site_id, type)` for site-level rows → `result`
  (Angular's `response.data.sites`, keyed by site/plant name in the Java `Collectors.groupingBy`
  → JSON object), and a second query `getPlantsList(siteId, year)` for **plant-level** rows
  (`plant_id IS NOT NULL`, grouped by `(site_id, plant name, type)`) → `plants` (Angular's
  `response.data.plants`). `year` defaults to the org's overall start year if not supplied;
  the frontend always supplies it. `siteId=0` means "no site filter" (the SQL's
  `siteId > 0 ? "AND t1.site_id=…" : ""` guard), matching Angular's `currentSiteId=0` = "All".

### A.5 Frontend business logic / transforms (all client-side, in `ReportComponent`)

- **`orgData` construction** (`getOrganizationChart`): for each site in the org chart, look up
  that site's record in the site list (`sideListCopy`) for its `boundary`/`equity` fields.
  - If `site.boundary === 'Equity'` and `site.equity` is set → use the site's own `equity` % as
    the displayed share, `boundary = 'Equity'`.
  - Else if the site has no boundary or `boundary === '-1'` → fall back to the *organization's*
    boundary: if `org.boundy === 'Equity'`, use `org.share`; otherwise `'-'`.
  - Else → `'-'` (the `else` branch is unreachable in practice given the two conditions above are
    the only paths that set anything else, but is preserved as-is — see B.4 for a real bug in
    this same logic).
  - Repeated per-plant with a subtly different (buggy) fallback — see B.4.
- **Base/Selected-year scope tables — site filter** (`changeReportBaseYearScopeValues` /
  `changeReportEmisisoYearScopeValues`): when `selectedSite !== 'All'`, the *already-fetched*
  parent Scope1/Scope2 totals are **replaced in place** with that one site's own row values
  (found by matching `label.toLowerCase() === siteName.toLowerCase()`), and the table is
  reduced to exactly `[scope1Total, thisSite'sScope1Row, scope2Total, thisSite'sScope2Row]` — i.e.
  filtering by site does not refetch from the backend, it re-slices the year's already-fetched
  full site breakdown client-side.
- **`getOverallTableData` transform**: `response.data.sites` and `response.data.plants` are each
  `Record<plantNameOrSiteName, Row[]>` maps (grouped server-side by name, see A.4). Both are
  flattened into `{ plantName, [type]: co2e, scope: 'parent'|'child', show }` rows (one row per
  group, one column per `type` from that group's items), sorted by `siteId`, then each parent
  (site) row has its matching child (plant) rows spliced in immediately after it by `siteId` —
  building the expandable tree the table renders.
- **Expand/collapse** (`expandRow`, `expandRowEmisiso`, `expandRowEmssin`): toggles `item.expand`
  on the clicked parent row, and toggles `show` on every row whose `scope` matches the parent's
  `label` (Table 1/2) or `siteId` (Table 3, since Table 3's parent rows don't carry a `label`
  matching child `scope` the way Table 1/2 do — a real inconsistency, see B.5).
- **PDF/Print** (`generatePdf`, `generatePdfPrint`): both force **every** row's `expand`/`show` to
  fully-expanded before rendering (so the PDF/print output always shows the fully expanded tree,
  regardless of the on-screen expand state), populate the hidden `#pdf-content` clone of the page
  (see A.2), then hand that DOM node to `html2canvas`+`jsPDF` (`jspdf`'s `.html()` helper, which
  internally screenshots via `html2canvas`) at `scale: 0.58`, `width: 1290`. `generatePdf` saves a
  file (`GHG-Report.pdf`); `generatePdfPrint` instead opens the rendered PDF in a new tab and
  calls `window.print()` on it after a 1s delay. **This is genuine visual rendering of the live
  DOM, not a server-generated PDF or a separate print stylesheet** — whatever is on screen in
  `#pdf-content` at click time is what ends up in the PDF, including the section
  show/hide state driven by `sectionnHideShow` (fed by `sectionNameSelected`, the print-modal's
  multiselect — the *only* place multiselect's value has any effect at all).

### A.6 React implementation status

Built in `InetZ React_Frontend/src/pages/report/` (+ `src/services/reportService.js`,
`src/api/endpoints.js` additions, `src/constants/queryKeys.js` additions). Data layer:
- **Data fetching**: TanStack Query (`useQuery`), matching the existing `DashboardPage.jsx`
  convention, one query per backend call in A.3, `enabled` gating for the two calls with a real
  dependency (`getOrganization` needs `dropDown` resolved first — reproduced by making its query
  `enabled: !!dropdown`; `getOrganizationChart` needs the site list — `enabled: !!sites`).
- All data-fetching, transform, and business logic (including the bugs at B.1-B.8) lives in
  `hooks/useAnnualReportData.js`, decoupled from how it's rendered — see below.
- **jsPDF + html2canvas**, added as dependencies (`jspdf`, `html2canvas` — not previously in this
  project; matched to the Angular app's own versions, `^3.0.1` / `^1.4.1`), since this route's PDF
  export has no backend equivalent to call instead — it's client-side DOM rendering in both apps.
- **The response-envelope quirk** (`{status, data}` wrapping every GET response, not just login)
  is handled with a small shared `unwrapResponseModel` helper in `src/api/helpers.js` rather than
  scattering `if (response.status === 200)` checks through the component — same effective
  behavior as Angular, less repetition. See `docs/auth-implementation.md` for the login-specific
  version of this same envelope quirk, documented separately since it was found/fixed first.

**Visual layer (2026-09-30, superseding the first pass):** the first implementation styled these
data-shapes directly with generic MUI `Card`/`Table` components (a reasonable-but-plain
interpretation of the design system). The user found that unpolished for a production app and
supplied an approved, pixel-accurate design handoff — see `docs/decisions.md`'s 2026-09-30 entry
for the full rationale. The visual layer was rebuilt from that handoff:
- `ghgReportTheme.js` — the handoff's `C` color/font tokens, repointed to `componentTokens`
  wherever an exact hex match exists (almost all of them did — see that file's inline comments).
- `components/GhgPrimitives.jsx` — `ReadField`, `Card`, `MainTabs`, `SubTabs`, `SiteSelect`
  (Popover-based dropdown), `YearPicker` (12-year grid), etc. — pixel-ported from the handoff,
  custom `ButtonBase`-built controls rather than MUI `Select`/`Tabs`, per the handoff's own design
  (not MUI defaults restyled).
- `components/ExpandableTable.jsx` — the handoff's generic parent/child tree-table component,
  reused for the Facilities table and all three emissions tables (one component, not three).
- `reportAdapters.js` — pure data-shape translation from `useAnnualReportData()`'s output into
  the `[{ name, values, children }]` shape `ExpandableTable` expects. No business logic here.
- Business logic and data fetching were **not touched** in this pass — `useAnnualReportData.js`,
  `reportFormat.js`, `pdfGenerator.js`, `reportService.js` are exactly as A.3-A.5 describe.

**Deliberate deviations from the handoff (functionality the mockup didn't need to cover):**
- **Editable fields**: `facilitiesText`/`clarificationOfCompany`/`contextForAnySignificant` are
  real Angular `ngModel`-bound (if unsaved) inputs — the handoff's `ReadField` is display-only
  (its screens never needed an editable variant). Added `EditableField`, same visual shell as
  `ReadField` but backed by a real `<input>`/`<textarea>`.
  Angular's original, plainer-still `.input-box` styling for these already read as "muted, greyed
  out" despite being editable, so this isn't a visual regression from Angular's own baseline.
- **PDF/print correctness under sub-tabs**: `BoundaryPanel` and `EmissionsPanel` use the
  handoff's `SubTabs` (Organizational/Operational Boundary; the 4 emissions sub-views), which are
  interactive-only in the handoff — only the active sub-tab's content exists in the DOM. Naively
  reusing that for the hidden PDF/print clone would have silently exported only whichever
  sub-tab happened to be selected, dropping the rest (a real bug caught before this shipped, not
  a hypothetical). Both panels now take a `forcePdf` prop that renders **every** sub-section
  stacked with a `PrintSubHeading` instead of the `SubTabs` selector — this is the same
  "force full expansion" behavior report.component.ts's `generatePdf()`/`generatePdfPrint()`
  already do to the tree tables (A.5), just extended to the sub-tab layer this design
  introduced.
- **Print options**: the handoff's Print button just calls `window.print()`, no options. Angular's
  real print flow lets the user choose which of the 5 sections to include first (A.2/A.5) — kept
  as a small `PrintOptionsPopover`, styled to match the handoff's own `SiteSelect`/`YearPicker`
  popover language (border/radius/shadow) rather than introducing a different UI pattern. The
  Site/Year fields Angular's print modal duplicated were dropped from it (they were bound to the
  exact same state as the header's own Site/Year pickers, not independent — see B.6 — so
  duplicating them in the popover added nothing; this declutters without touching behavior).
- **Year selection**: `YearPicker`'s 12-year grid (from the handoff) is real UI, but selection is
  still constrained to Angular's hardcoded `yearList` (2022-2025, B.7) — other years in the grid
  render disabled, not just future years as in the handoff's own mockup.

See **D. Implementation Status** for the section-by-section checklist.

---

## B. Current Problems and Limitations

*(Documented per the task's Phase 5 instructions — none of these were fixed in this pass.)*

**B.1 — SQL built via string concatenation, not parameterized queries**
- Where: `OutPutServiceImpl.getYtdValue`, `.scope1YtdValues`, `.scope2YtdValues`, `.outputEmissions`,
  `.getPlantsList` (all of `OutPutServiceImpl`'s report-adjacent SQL).
- Problem: `year`, `siteId`, and type lists are concatenated directly into the SQL string rather
  than bound as JDBC parameters.
- Evidence: e.g. `"WHERE EXTRACT(YEAR FROM t1.timestamp) = '" + year + "' AND t1.type IN (" + types + ")"`.
- Risk: SQL injection if any of these values are ever sourced from less-trusted input than they
  are today (currently `year` comes from a `@RequestParam String year` with no validation before
  concatenation — a malformed request could break the query or, at worst, inject SQL).

**B.2 — Plant-level rows in `getYtdValue` are keyed by their *site's* name, not the plant's**
- Where: `OutPutServiceImpl.getYtdValue`'s SQL (`JOIN site t2 ON t1.site_id = t2.id`, `label = t2.name`
  even for the plant-inclusive branch of the UNION-implied logic).
- Problem: Tab D's Table 1/Table 2 (base-year / selected-year scope totals) can never actually
  show a *plant* as its own labeled row — every row is labeled by site name regardless of
  whether the underlying `calculation_history` rows came from a site-level or plant-level entry.
  The de-dup subquery (A.4) prevents double-counting, but the resulting row still can't be
  attributed below the site level in this particular table.
- Evidence: no `t3.name` (plant name) ever appears in the `SELECT` list of `getYtdValue`.
- Production impact: likely intentional (these two tables are meant to be site-level summaries,
  unlike Table 3 which is explicitly site→plant), but worth flagging since it's easy to assume
  otherwise from the query's `LEFT JOIN plant t3` (which is joined but never selected from).

**B.3 — Tab E (Offsets) is entirely non-functional**
- Where: `report.component.html` lines 286–307 (and its PDF-clone duplicate, 591–611).
- Problem: the two input rows have no `[(ngModel)]`, no backing field, no save handler — they are
  visually editable but any text typed is lost on tab switch/refresh and never sent to the
  backend. There is no `POST`/`PUT` endpoint for offsets anywhere in `OutPutController` either.
- Production impact: a user could reasonably believe they're recording offset data here; nothing
  is persisted. Low technical risk, real UX/data-integrity risk if anyone relies on it.

**B.4 — `orgData` per-plant boundary/equity fallback has a real bug (inherited two ways)**
- Where: `ReportComponent.getOrganizationChart()`, the per-plant `forEach` block
  (report.component.ts:547–570).
- Problem: the plant loop's third fallback branch (`else { bountyOrg = ... }`) is **commented
  out** (lines 557–559: `// else { \n // bountyOrg = this.orgDetails?.boundary; \n // }`), so if a
  plant's owning site has a boundary that is neither `'Equity'` nor falsy/`'-1'` (e.g.
  `'Financial Control'`/`'Operational Control'`), `bountyOrg` silently **keeps whatever value it
  held from the previous loop iteration** (it's a `let` declared once outside both `forEach`
  loops, report.component.ts:521) rather than being recomputed for this plant — a stale-value
  carry-over bug. Additionally, line 555 falls back to `this.orgDetails?.boundary` for the
  `boundy` value shown but reads `this.orgDetails?.boundary` for the *site's own* `boundary`
  field name mismatch — the org-level field used elsewhere in this same file is `orgDetails.boundy`
  (report.component.ts:532), not `.boundary`; `Organisation.boundary` doesn't appear to be set by
  anything found in this pass, so this particular fallback is effectively always `undefined`.
- Evidence: report.component.ts:550–559.
- Production impact: for any plant whose site has a non-Equity, non-empty boundary type, the
  displayed Equity Share % in Tab B's facilities table can silently be **the previous row's
  value** instead of the correct one (or blank) — a real data-correctness bug in a compliance
  report, not a cosmetic issue.

**B.5 — Inconsistent expand/collapse keying across the three tree tables**
- Where: `expandRow`/`expandRowEmisiso` match children by `child.scope === item.label` (Table
  1/2); `expandRowEmssin` matches by `child.siteId === item.siteId` (Table 3).
- Problem: two different, non-interchangeable conventions for "this is a child of that parent"
  in what is visually the same expand/collapse interaction, in the same component. Not a user-
  facing bug today (each function is only ever wired to its own table), but a maintenance trap —
  copy-pasting one expand handler for a fourth table without noticing the keying difference would
  silently misbehave.

**B.6 — `printSelectedSite`/`printSelectedYear`/`onSiteSelect`/`onYearSelectPrint`/`onSiteSelectPrint` are dead code**
- Where: report.component.ts:21–23, 103–114.
- Problem: these fields/handlers exist and are assigned, but the print modal's actual dropdowns
  (report.component.html:31–41) bind to `selectedYear`/`selectedSite` via `onYearSelect`/
  `onSiteSelectChangeTop` — the *main* page's handlers, not the print-prefixed ones. The
  print-prefixed state is written to by nothing in the visible template (only the hidden
  `#pdf-content` clone's now-dead commented-out dropdown block references `onSiteSelect`, itself
  also unused since that clone's controls aren't interactive — `[hidden]`/`display:none` doesn't
  block click *if* shown, but they're never shown interactively).
- Production impact: none currently (dead code only), but confusing — a future edit "fixing" the
  print modal to use its own independent site/year state would need to notice these already exist
  but are wired to nothing.

**B.7 — Hardcoded year list, not derived from any config or backend value**
- Where: `report.component.ts:35-40`, `yearList = ['2022','2023','2024','2025']`.
- Problem: this list needs a manual code change every year to stay current; nothing derives it
  from e.g. the org's baseline year or the current date.
- Production impact: low until the calendar turns over to 2026 without a code deploy — then the
  year dropdown silently stops offering the current year.

**B.8 — Role gating on `/report` (`SUPER_ADMIN/ADMIN/USER`) is declared but not enforced**
- Already documented in `docs/backend-context.md` / `ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md` §9/§23
  as a cross-cutting issue, not specific to this route — cross-referenced here rather than
  re-documented, since it applies identically to `/report/report`.

---

## C. Proposed Future Improvements

*(Documented, not implemented, per the task's explicit Phase 5 instruction.)*

1. **Parameterize the report SQL** (B.1). Benefit: closes the injection surface. Layer: backend
   (`OutPutServiceImpl`). Risk: low — straightforward JDBC parameter binding, behavior-preserving.
   Test: same queries, bound params instead of concatenation, compare result sets before/after
   on a known dataset.
2. **Fix the plant-boundary stale-value bug** (B.4). Benefit: correct Equity Share % display for
   multi-boundary-type organizations. Layer: frontend only (React port — this logic is 100%
   client-side, nothing backend to change). Risk: low, but needs a real multi-site/multi-boundary
   dataset to verify against (not just single-site test orgs) — this may be why it hasn't been
   caught yet in practice.
3. **Persist Tab E (Offsets) data** (B.3). Benefit: makes the section actually functional instead
   of a visual trap. Layer: needs a new backend table + `OutPutController`/`OutputService`
   endpoint pair, plus frontend wiring. Risk: medium — new schema, new endpoint surface; should be
   scoped as its own small feature, not folded into a "just fix bugs" pass.
4. **Derive the year dropdown from real data** (B.7) — e.g. from the org's baseline year through
   the current year, or a backend-supplied list of years that actually have calculation data.
   Benefit: no more manual yearly code changes. Layer: could be frontend-only (compute from
   `new Date()`) or backend-driven (a "years with data" endpoint) — worth deciding which before
   implementing, since they have different edge-case behavior (frontend-computed could offer a
   year with no data at all; backend-driven avoids that but is a new endpoint).
5. **Unify the expand/collapse keying convention** (B.5) across the three tables, e.g. a shared
   `siteId`-based (or uniformly `label`-based) convention, so a future 4th tree-table doesn't have
   to guess which pattern to copy. Layer: frontend only. Low risk, pure refactor.
6. **Give Tab E's inputs real state even without a backend** (short of full persistence) so at
   least in-session typing isn't silently lost on tab switch — a smaller, lower-risk step toward
   item 3. Layer: frontend only.
7. **Move PDF generation server-side** (would let the "download" and "email a report" cases share
   one implementation, and avoid the client needing `jspdf`+`html2canvas` at all) — flagged as an
   option, not a recommendation; current client-side approach has the real advantage of always
   matching exactly what's on screen. Layer: backend (new endpoint) + frontend simplification.
   Compatibility risk: medium (a server-rendered PDF from a headless-browser/HTML-to-PDF pipeline
   can visually drift from the live page in ways the current html2canvas approach cannot, by
   definition).

---

## D. Implementation Status

Legend: ✅ Implemented & verified · 🟡 Implemented, not yet verified against a live backend ·
◐ Partial · ❌ Not implemented · 🚧 Blocked

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Route `/report/report` registered, protected | ✅ | Already existed from the sidebar/topbar + auth work; content was the placeholder being replaced here |
| 2 | Tab A — Organizational Details | 🟡 | Fields wired to `orgDetails`/`address`; not verified against real API responses (no reachable backend in this sandbox — see verification section) |
| 3 | Tab B — Boundary Conditions + facilities table | 🟡 | Includes the org-chart/boundary/equity transform, bug-for-bug per B.4 |
| 4 | Tab C — Methodologies | 🟡 | Static citation block reproduced verbatim |
| 5 | Tab D — Base Year table (Table 1) | 🟡 | Expand/collapse, site-filter re-slice logic reproduced |
| 6 | Tab D — Selected Year table (Table 2) | 🟡 | Refetches on year change, same transform as Table 1 |
| 7 | Tab D — Disaggregated-by-source table (Table 3) | 🟡 | Site/plant tree flatten+splice reproduced; refetches on year *and* site change |
| 8 | Tab E — Offsets (non-functional placeholder) | ✅ | Reproduced as non-functional, matching B.3 exactly (not a bug to fix here) |
| 9 | Site filter (top dropdown) | 🟡 | Drives table re-slicing + Table 3 refetch, matching Angular |
| 10 | Year filter (top dropdown) | 🟡 | Drives Table 2/3 refetch, matching Angular |
| 11 | Download PDF | 🟡 | `jspdf`+`html2canvas` wired the same way as Angular; not verified end-to-end (needs real report data to produce a meaningful visual check) |
| 12 | Print (popover + section multiselect + window.print) | 🟡 | Same caveat as #11 |
| 13 | Loading/error states | ◐ | Uses TanStack Query's own `isLoading`/`isError`; Angular has **no** explicit loading/error UI on this page at all (relies on the global `LoaderInterceptor` spinner only) — React reproduces that same "no per-section loading UI" behavior rather than adding one, per the no-redesign constraint |
| 14 | Role/permission gating specific to this page | ❌ | None exists in Angular either (see B.8) — correctly not added |
| 15 | Backend SQL/controller behavior | 🚧 | Traced and documented (A.4), not modified — out of scope per task restrictions |
| 16 | End-to-end verification against live data | 🚧 | **Blocked** — this environment has no network path to the backend (`http://192.168.11.62:8083/decarb`, an internal address). See "Verification" below for exactly what was and wasn't checked. |

---

## Verification performed

- `npm run lint` — clean on all new/changed files.
- `npm run build` — production build succeeds, no missing-import/reference errors.
- **Not performed (blocked, documented rather than claimed):** loading the route in a browser
  against the real backend, visually comparing rendered output to the Angular page, confirming
  the PDF export produces a byte-for-byt­e-equivalent-looking document, and confirming the exact
  JSON field names assumed here (`co2e`, `plantName`, `siteId`, etc.) match what the live backend
  actually serializes — this pass relied on reading the Java source's field names/`ResponseModel`
  wrapping directly rather than an observed live response. This environment has no network route
  to `192.168.11.62:8083`, and no seeded local Postgres instance with `calculation_history`
  data was set up as part of this task. Recommend a manual pass against a real environment before
  treating this route as done.
