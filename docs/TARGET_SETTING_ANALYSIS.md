# Decarb "Target Setting" Route — Analysis, React Implementation & Backend Backlog

> Angular route: `/report/target-setting` (hash-routed: `#/report/target-setting`).
> React route (corrected naming, same rule as the Emission Dashboard — `docs/EMISSION_DASHBOARD_ANALYSIS.md` A.1):
> **`/dashboard/target-setting`**.
> Angular: `TargetSettingComponent` (`InetZ Frontend/InetZ-Frontend/src/app/target-setting/`, lazy `TargetSettingModule`).
> Backend: `TargetSettingController` (`@RequestMapping("target")`) → `TargetSettingServiceServiceImpl` →
> `TargetSettingServiceImpl` (Absolute Contraction) / `TargetSettingSectoralServiceImpl` (Sectoral Decarbonization).
> React: `src/pages/dashboard/target/` (+ `src/services/targetSettingService.js`). **Implemented — see Section F.**
>
> **How to read this document**
> - **A** — what Angular does (page, APIs, backend, frontend logic).
> - **B** — every problem found, one entry each: *what Angular does → the problem → impact → what the React frontend does about it → what the backend should do later and why*.
> - **C** — the **backend backlog**: one consolidated, prioritised table of everything to fix on the backend, with impact, rationale and an acceptance test for each. (Backend bugs are being handled separately; this is the work list.)
> - **D** — frontend improvements/ideas not yet done.
> - **E** — decisions taken. **F** — what was implemented in React (files, behaviour, deviations). **G** — status checklist & verification.
>
> **Why this page is special:** it is the only page of the dashboard group that **writes data** (`POST /target`),
> and the rows it stores are read **live by the Emission Dashboard** (gauge targets, "Target vs Actual" chart,
> `docs/EMISSION_DASHBOARD_ANALYSIS.md` A.6). A calculation run here changes numbers on that page immediately.

---

## A. Current (Angular) Implementation

### A.1 Routing, sidebar, access

- `app-routing.module.ts`: `/report` → `MainLayoutComponent` (`data.page = 'report'`, `canActivate: [AuthGuard]`) → child
  `path: 'target-setting'` → lazy `TargetSettingModule` → `TargetSettingRoutingModule` (`path: ''` → `TargetSettingComponent`). No params, no resolvers.
- `AuthGuard` only checks that `sessionStorage.token` exists. The `permissions.only: [SUPER_ADMIN, ADMIN, USER]` role list on `/report`
  is declared but not enforced (cross-cutting — `docs/backend-context.md`; same as Emission Dashboard B.18).
- **Sidebar**: item from `report.json`: `{ "name": "Target Setting", "route": "/report/target-setting", "src": "target.png", "breadcrumbTitle": "Organization - Decarbonization Target" }`.
  No sub-menu, so a click is a plain navigation. The top-bar title becomes **"Organization - Decarbonization Target"**.
- **In-page role rule**: the **Calculate** button renders only when `hasDashboardAccess()` (role ≠ `USER`). The route and all GETs are open to `USER`;
  the backend does no role check on `POST /target` (B.9).

### A.2 Page structure (one screen, no tabs)

**Row 1 left (col-lg-4) — `organizationForm`**

| # | Field | Control | Options / rules |
|---|---|---|---|
| 1 | Organization/Site | dropdown (`siteId`) | `general/site` filtered by `isWriteAccess(id)`; value = site id, label = name; **required** |
| 2 | Sector | dropdown (`sector`) | hardcoded `['Power','Ammonia','HVCs','Methanol']`; **required** |
| 3 | Target Setting Method | dropdown | `['Absolute Contraction','Sectoral Decarbonization']`, default **Absolute Contraction** |
| 4 | Base Year | dropdown | years **2015 … current year**; **required** |
| 5 | Target Year | dropdown | years **current year + 1 … 2050**; label says required but **no validator** (B.3) |
| 6a | *(Absolute only)* Most Recent Year | dropdown | years 2015 … current year; required in this mode |
| 6b | *(Sectoral only)* Activity Projection Method | dropdown | `['Target Year Output','Fix Market']`; required in this mode |
| 6c | *(Sectoral only)* Target Year Activity | number input | required initially; validator **cleared as soon as a projection method is chosen** (B.4) |
| 7 | Calculate | button | hidden for `USER`; `[disabled]` while the form is invalid |

Switching method resets/re-validates the mode-specific fields (Absolute → resets projection/activity, requires most-recent year; Sectoral → resets
those two, drops most-recent-year's validator, requires projection + activity). `Fix Market` additionally clears the `targetYear` and `yearActivity` validators.

**Row 1 right (col-lg-8) — results table** (`custom-table`, horizontally scrollable): `Site | Sector | Target Setting Method | Target Year | Scope 1 Target | Scope 2 Target | Total (Scope 1+2) | % Reduction`.
A sticky **"Organization"** row (sum of the site rows; click = scope the chart to the organisation), then one clickable row per stored target (click = scope the line chart to that site),
numbers `1.0-0` with a "tCO2e" tooltip, `% Reduction` shown as the raw string with **no % sign**; "No data available" when empty.

**Row 2 — charts**: *Actual Vs Target tCO2e Emissions – {org|site}* (col-lg-9; two **line** series, target zeros → null) and *Site-wise tCO2e Emission Reduction* (col-lg-3; donut, one slice per site; value = that site's target-year total).

### A.3 Backend APIs used

All via `ApiService`, wrapped `{ status, data }` (`ResponseModel`).

| # | Call | When | Purpose |
|---|---|---|---|
| 1 | `GET target` | constructor; after a successful calculate | Table rows (`TargetSettingResponse[]`) |
| 2 | `GET target/pieChart` | inside `getTargetSetting()` | `{label[], value[]}` → donut |
| 3 | `GET general/site` | constructor | site dropdown (client-filtered by write access) |
| 4 | `GET general/organisation` | constructor | `name` → default chart title |
| 5 | `GET target/barChart?name=<siteName>` | constructor (`name=''`); every row click | `{label[], actual[], target[]}` → line chart |
| 6 | **`POST target`** | Calculate | the only write; body `TargetSettingRequest`; reply `{status:200,data:"ok"}` or `{status:400,data:"failled"}` |

`POST` body: `{ siteId, sector, targetSettingMethod, baseYear, targetYear }` plus `mostRecentYear` (Absolute) **or** `projectionMethod` + `yearActivity` (Sectoral).
Response handling: `status == 200` → re-fetch table + pie, toast "Record added successfully."; otherwise toast with `response.data` (the literal `failled`);
HTTP error → toast with `error.error.error.message`. **The line chart is not re-fetched** (B.6).

### A.4 Backend: controller → service → SQL / calculation

`TargetSettingController` (`@CrossOrigin("*")`): `POST /target`, `GET /target`, `GET /target/pieChart`, `GET /target/barChart?name=`.

- **`GET /target`** (`getData()`): `SELECT t1.*, t2.name FROM target_setting_output t1 JOIN site t2 … ORDER BY t1.site_id`, then **per row** three more queries on `target_setting_target_value`:
  `reduction = (Σvalue@baseYear − Σvalue@targetYear)/Σvalue@baseYear × 100` for that site; `totalReduction` = same over **all sites**; both `%.1f`; exceptions per row are swallowed (a row with no matching values gets `null`).
- **`GET /target/pieChart`**: `SELECT round(total), site.name FROM target_setting_output JOIN site` → `{label, value}` (the **target-year total** per site).
- **`GET /target/barChart?name=`**: target series = `SUM(value)` per `key` (year) from `target_setting_target_value`, `key >= organisation.baselineYear AND key <= '2030'`, optional site by **name concatenated into the SQL**; years ≤ current year forced to `0`.
  Actual series = yearly `SUM(co2e)` from `calculation_history`, all six emission types, from the baseline year on (shared de-dup rule: site-level rows plus plant-level rows not already covered), optional site.
- **`POST /target`** (`calculate`): `Sectoral Decarbonization` → `TargetSettingSectoralServiceImpl.process(...)`; anything else → `TargetSettingServiceImpl.process(...)`; `"HVC"` normalised to `"HVCs"`. Any exception → `ResponseModel(400, "failled")` **inside an HTTP 200**; success → `ResponseModel(200, "ok")`.

**Absolute Contraction** (`TargetSettingServiceImpl.process`) — a port of a spreadsheet; each step is labelled with its original cell letter:
1. `annualReductionAB` = `0.042` if `baseYear ≤ 2020`, else `0.042 × (targetYear−2020) ÷ (targetYear−baseYear) × 100`.
2. Scope 1 and Scope 2 emissions for the **most recent year** and the **base year** (calendar year, `calculation_history`, shared de-dup rule).
3. Reduction achieved so far (C Scope 1, D Scope 2) = `(1 − recent/base) × 100` when `mostRecent > base` and recent < base, else 0.
4. "No-FLA" linear schedule per year 2014–2060 (`base × (1 − annualReductionAB/100 × (year − base))`) → target-year values G / J and their reductions H / K.
5. Forward-Looking-Ambition (FLA) adjustment L / N and adjusted targets M / O using `netZeroValueE = 0.9` and the year 2050.
6. Final per-year series P (Scope 1) / Q (Scope 2): `0` before the base year; the no-FLA schedule if FLA ≤ 0; otherwise **sparse points** at base year, most-recent year, target year and 2050 and **`0` for every other year**.
7. Persist, non-transactionally: `DELETE FROM target_setting_output WHERE site_id=?` + `INSERT` (scope1 = P[target], scope2 = Q[target], total); `DELETE FROM target_setting_target_value WHERE site_id=?` + one `INSERT` per year per scope (≈ 94 rows, each its own statement, every exception swallowed).

**Sectoral Decarbonization** (`TargetSettingSectoralServiceImpl.process`): loads the whole **`sectoral_data`** table (`parameter, sector, year, value, scenario`); filters by the chosen sector for parameters `SP`, `SA`, `SE` and the global `SIpower`;
derives sector intensity curves (SI, SI2), a market-share parameter M and per-year intensity/emission series (CI/CE Scope 1, CI2/CE2 Scope 2) from the site's **base-year Scope 1/2 emissions** and **base-year production output** (`calculation_history` rows `type='production'`, summing `value`).
`projectionMethod = 'Target Year Output'` → linear interpolation of output to the user's `yearActivity` at the target year; **anything else** (i.e. `Fix Market`) → output follows the sector's activity growth. Persists the same two tables (also stores `target_activity`; `method = 'Sectoral Decarbonization'`).
Needs `sectoral_data` for the sector and years 2014, baseYear, targetYear, 2050 — `Optional.get()` without presence checks.

Tables: `target_setting_output (id, site_id, sector, method, scope1, scope2, total, target_year, base_year, target_activity, target_ouput[sic, unused])`; `target_setting_target_value (id, key[year as text], value, site_id, type, scope_type)`; `sectoral_data (id, parameter, sector, year, value, scenario)`.

### A.5 Frontend business logic (all in `TargetSettingComponent`)

- API calls run in the **constructor**, unsequenced: targets, pie, sites, bar chart, organisation.
- Org summary row: sums `Number(scope1|scope2|total)` over the rows (rounded); `reduction = itm.totalReduction` assigned on every iteration (last row wins; it is the same org-wide figure on each row).
- Line chart: `Actual` (`actual[]`) and `Target` (`target[]`, `0 → null`) against a single `label[]` **by index**; title from `displayName` (clicked site, else organisation name).
- Pie colours: `colorArray.slice(0, n+1)` of a 23-colour list.
- Site dropdown: `general/site` rows kept only if `isWriteAccess(site.id)` (SUPER_ADMIN → all).
- Year lists: base/most-recent `2015 … currentYear`; target `currentYear+1 … 2050`.
- Toasts through `SnackbarService`.

---

## B. Problems found — impact, frontend handling, backend follow-up

Format for every entry: **Angular** (what it does) · **Problem** · **Impact** · **React frontend** (what is implemented here) · **Backend (future)** (what to do and why).
IDs here are referenced by the backlog in Section C (`BE-n`).

### B.1 SQL injection in `GET /target/barChart?name=` — *Security, High*
- **Angular:** sends the clicked site's name as `?name=` (`getBarChart()`); empty for the organisation.
- **Problem:** `TargetSettingServiceServiceImpl.barChart()` concatenates `name` into two queries: `… WHERE site_id=(SELECT id FROM site WHERE name='<name>')`. A name containing `'` breaks the query (e.g. "Bob's Plant"); a crafted value can change what the query does.
- **Impact:** any authenticated user can inject SQL (read/alter data); legitimate site names with an apostrophe silently break the chart. Reachable from the browser address bar, not only the UI.
- **React frontend:** sends the name via axios `params` (URL-encoded) — this *prevents nothing* server-side. Mitigation is documented only. The page still calls it exactly as Angular does to preserve the contract.
- **Backend (future) — BE-1:** bind parameters (`JdbcTemplate` placeholders) or, better, take the **site id** (`?siteId=`) instead of a name; keep the old `name` param working during migration. *Why:* closes a real vulnerability and removes the apostrophe bug. Add a unit/integration test with `name = "x' OR '1'='1"` and `"Bob's Plant"`.

### B.2 Suspected unit errors in the Absolute Contraction maths — *Correctness, High (needs domain owner)*
- **Angular:** does nothing — the maths is entirely backend.
- **Problem (reading of the code, not yet confirmed against the spreadsheet):**
  (a) `annualReductionAB` is `0.042` when `baseYear ≤ 2020` but `0.042 × … × 100` (a **percentage**) otherwise; both are then divided by 100 → for base years ≤ 2020 the yearly cut is **0.042 % instead of ~4.2 %** (≈100× too small).
  (b) `netZeroValueE = 0.9` is combined with **percent** values (`0.9 − reductionTillDate%`, `reductionTillDate ≥ 0.9`) and with a **fraction** (`1 − G/base`); the 2050 point is `base × (1 − 0.9/100)` ≈ 99.1 % of base — i.e. "net zero by 2050" is effectively a 0.9 % cut.
  (c) `M = (1 − G/base) + L` adds a fraction to a percentage.
- **Impact:** every stored target (and therefore every gauge target / Target-vs-Actual figure on the Emission Dashboard) may be wrong by orders of magnitude, in a compliance-style product. Hardest kind of bug: numbers look plausible.
- **React frontend:** none possible (no frontend maths). The page displays whatever the backend stores. This is called out in the doc and should be raised with the product/sustainability owner.
- **Backend (future) — BE-2:** get the source spreadsheet and its worked example from the owner; write unit tests that reproduce the spreadsheet for 2–3 scenarios (base ≤ 2020 and > 2020, with/without FLA); then fix units (one convention — fractions *or* percent — end to end). *Why:* correctness of the product's core output. Re-run/re-store existing site targets after the fix and tell users.

### B.3 Target Year is not actually required — *Validation, Medium*
- **Angular:** template shows "Target Year is required." but `targetYear: ['']` has no `Validators.required`; for `Fix Market` its validators are cleared.
- **Problem:** the form can submit with Target Year empty → `Number('') = 0` → the backend divides by `targetYear − baseYear` / loops to a nonsense year, or throws → `failled`.
- **Impact:** confusing failure with no explanation; possible garbage targets if it doesn't throw.
- **React frontend (implemented):** Target Year is **required for both methods** (zod schema `targetSettingForm.js`); error "Target Year is required."; Calculate stays disabled until valid.
- **Backend (future) — BE-3:** validate the request (`@Valid`: required fields, `baseYear < targetYear`, ranges) and return **HTTP 400 with a clear message**. *Why:* the backend must not trust the UI; other clients/curl can send the same bad payloads.

### B.4 "Target Year Activity" stops being required when it is needed — *Validation, Medium*
- **Angular:** the validator is set on switching to Sectoral, then **cleared in both branches** of the projection-method listener (`Target Year Output` *and* `Fix Market`).
- **Problem:** with `Target Year Output` the backend does `targetYearOutput = yearActivity` and subtracts it from base-year output → null-pointer → `failled`.
- **Impact:** a valid-looking form always fails; user gets no hint why.
- **React frontend (implemented):** `yearActivity` is **required (number > 0) when projection = "Target Year Output"**; not required for "Fix Market" (the backend ignores it there). Field label says so.
- **Backend (future) — BE-3 (same item):** reject a missing `yearActivity` for that method with a 400 message.

### B.5 No cross-field validation — *Validation, Medium*
- **Angular:** nothing enforces `baseYear < targetYear`, `baseYear < mostRecentYear ≤ currentYear`, or that the years exist in the data.
- **Problem:** invalid combinations reach the backend (divide by zero / negative spans / empty data) and come back as `failled`.
- **Impact:** wasted calls, opaque errors, risk of nonsense targets being stored.
- **React frontend (implemented):** target year must be after base year; most-recent year must be after base year (and the lists already cap it at the current year). Errors show under the field. Whether *data exists* for the chosen years cannot be known client-side → handled by B.12's improved failure message.
- **Backend (future) — BE-3 + BE-9:** same request validation; and a pre-check that the base/most-recent years have emission data (and, for Sectoral, `sectoral_data` coverage), returning a specific message ("No emission data for site X in 2022"). *Why:* turns an opaque failure into an actionable one.

### B.6 Line chart is stale after Calculate — *Frontend bug, Medium*
- **Angular:** `calculate()` re-fetches the table and pie but **not** `barChart`.
- **Problem / Impact:** the "Actual vs Target" chart keeps showing the old target until a row is clicked or the page reloads — users think the calculation didn't apply.
- **React frontend (implemented):** after a successful calculation **all** target queries (table, pie, line chart) are invalidated and refetched — and the **Emission Dashboard's** caches too, since it reads the same rows.
- **Backend (future):** none.

### B.7 Misleading chart/field names — *UX, Low*
- **Angular:** donut titled "Site-wise tCO2e **Emission Reduction**" but plots each site's **target-year total**; `% Reduction` is a bare number (no %); the "Organization" row repeats the org-wide reduction taken from whichever row was iterated last.
- **Impact:** readers misread the donut as "how much is being cut".
- **React frontend (implemented):** `% Reduction` now shows a **`%` sign** (display only). The donut title is **kept as Angular's** (decision Q5) — recorded here so it can be renamed later ("Site-wise Target tCO₂e") without re-investigation. Org row uses the same last-row rule.
- **Backend (future) — BE-12:** expose clearer field names/values if a rename is wanted (e.g. return `reductionPct` as a number, plus an explicit org summary in the response instead of the repeated `totalReduction`).

### B.8 Calculation is destructive and non-atomic — *Data integrity, High*
- **Angular:** just POSTs.
- **Problem:** each run `DELETE`s the site's existing `target_setting_output` and `target_setting_target_value` rows, then inserts ≈ 94 rows **one statement at a time** with every exception swallowed (`e.printStackTrace()`). No transaction. One target per site (a re-run overwrites). No history, no audit entry, no delete endpoint.
- **Impact:** a failure midway leaves the site with **no or partial targets** while the call may still report success; the Emission Dashboard (which reads these rows live) then shows missing/incorrect targets; accidental overwrite is irreversible; hundreds of statements per click.
- **React frontend (implemented):** a **confirmation dialog** before overwriting a site that already has a stored target ("Replace existing target?" — names the site, its current method and target year, and warns that the Emission Dashboard changes immediately). The button shows "Calculating…" and is disabled while a request is in flight (no double submit).
- **Backend (future) — BE-4:** run the whole calculation inside **one transaction** (delete + batch insert, rollback on any error, **fail loudly** — no swallowed exceptions); return a precise error. *BE-5:* keep **history** (insert a new version / keep the previous rows, or an audit table) so an overwrite can be undone; add a **delete target** endpoint. *Why:* protects the data the dashboards depend on; makes failures visible; enables rollback.

### B.9 Access control is client-side only — *Security, High*
- **Angular:** site dropdown filtered by write access; Calculate hidden for `USER`.
- **Problem:** `POST /target` has **no role or per-site check**, and `GET /target`, `pieChart`, `barChart` return **all** sites to everyone. (Same class as Emission Dashboard B.3.)
- **Impact:** any logged-in user (even `USER`) can POST a calculation for any site by calling the API directly — silently changing targets that drive the company's dashboards; users can read other sites' targets.
- **React frontend (implemented):** keeps Angular's UI rules exactly (site dropdown filtered by `isWriteAccess`; Calculate hidden for `USER`). Display data is **not** filtered client-side (decision Q7 — filtering what is shown would hide the gap without closing it).
- **Backend (future) — BE-6:** authorise `POST /target` by role (SUPER_ADMIN/ADMIN) **and** per-site access; filter the GETs by the caller's accessible sites. *Why:* the UI can't be the security boundary. Acceptance test: a `USER` token gets 403 on POST; an ADMIN without access to site X gets 403 for `siteId=X`.

### B.10 Fragile / unguarded server maths — *Robustness, Medium–High*
- **Problem:** Sectoral uses `Optional.get()` and map `.get()` with no presence checks (missing sector/year → exception → `failled`); divisions by base-year output/emissions can produce `NaN`/`Infinity` that are **stored** (`double precision` accepts them) and then poison downstream sums on the dashboards (gauges read `SUM(value)` of these rows). `GET /target` divides by the base-year sum without a zero guard (→ `"NaN"` or an exception swallowed to `null`). `getData()` also runs ~3 queries per row (N+1).
- **Impact:** one bad calculation can make every gauge/target on the Emission Dashboard `NaN` (the dashboard docs already record `NaN`/`Infinity` leaking in gauges, Emission Dashboard B.16); slow list for many sites.
- **React frontend:** displays `—` for null reductions and renders numbers defensively (`Number()` + `Math.round`), but a stored `NaN` would still show as `NaN`. The Emission Dashboard already treats non-finite as "no data".
- **Backend (future) — BE-7:** guard every division; **never persist non-finite values** (reject the calculation instead); check data availability up front; collapse the N+1 in `getData()` into one query. *Why:* prevents one bad run from corrupting dashboard figures.

### B.11 Line chart: 2030 cap and index alignment — *Correctness, Medium*
- **Angular:** plots `actual[]` and `target[]` against one `label[]` **by index**.
- **Problem:** the SQL hard-codes `key <= '2030'` although target years up to 2050 can be set; targets for years ≤ current year are forced to 0 (so the target line starts next year); and each series is built by its own query — a year with no actual data (or a target key missing) shifts one series against the other.
- **Impact:** targets beyond 2030 never appear; misaligned points can show a wrong year/value pairing.
- **React frontend:** kept as-is (decision Q10, backend-driven); documented. Zeros are shown as gaps (as Angular).
- **Backend (future) — BE-8:** return **year-keyed** data (`[{year, actual, target}]`), remove the 2030 cap (or make it the max target year), and include years with no data as `null`. *Why:* correctness and long-horizon targets.

### B.12 Error handling shape and silent failures — *UX/Robustness, Medium*
- **Angular:** failure body is the literal (misspelled) `failled` shown to the user; the HTTP-error handler reads `error.error.error.message` (TypeError if the shape differs); `GET target`, `general/site`, `general/organisation` have **no** error handling — a failed call looks like "No data available".
- **Impact:** users can't tell *why* a calculation failed (bad years? no data? server down?).
- **React frontend (implemented):** `calculate()` checks the body `status` (the HTTP code is 200 even on failure) and throws; the error toast shows a **useful message** — the server's text if it is anything other than `failled`, otherwise "The calculation failed on the server. Check that the selected years have emission data for this site (and sector data for Sectoral Decarbonization)." Loading/error UI for the read panels is **deferred project-wide** (an empty result shows "No data available").
- **Backend (future) — BE-10:** use real HTTP status codes (400 validation, 403 forbidden, 500 unexpected) with a JSON `{ message, field }`; stop returning `failled`. *Why:* clients can react correctly; removes the HTTP-200-with-error anti-pattern.

### B.13 Hardcoded lists, ignored `sector`, dead code — *Maintainability, Low*
- **Angular:** sectors/projection methods are string constants; backend special-cases `"HVC"` → `"HVCs"` (never sent by the UI); the Absolute Contraction maths **ignores `sector`** (only stored); year range starts at a fixed 2015; commented chart.js code, `checkValidation()` no-op, unused imports, `console.log`s (backend: dozens of `System.out.println`).
- **React frontend (implemented):** lists kept **exactly** (decision Q9) in `targetSettingForm.js`; none of the dead code ported.
- **Backend (future) — BE-11:** serve sectors/methods from the backend or config (single source of truth, validated server-side); decide whether Absolute Contraction should use `sector`; replace `System.out.println` with logging; remove dead code. *Why:* adding a sector currently needs a frontend release and can desync from `sectoral_data`.

### B.14 API calls in the constructor, unsequenced — *Low*
- **Angular:** five requests at construction; the pie is fetched from inside `getTargetSetting()` even when that call errors. **React frontend:** independent TanStack queries (cached, deduplicated, retried per defaults). **Backend:** none.

### B.15 Role handling inside the page — *noted*
- Calculate hidden for `USER` — **implemented the same**; enforcement is backend work (B.9).

---

## C. Backend backlog (work list for the backend team)

Priority: **P1** = fix soon (security / data corruption), **P2** = important correctness, **P3** = hygiene. "Frontend impact" says what changes on the React side when the backend changes.

| ID | Title | Priority | What to do | Impact if NOT fixed | Why improve | Acceptance test | Frontend impact |
|---|---|---|---|---|---|---|---|
| **BE-1** | Parameterise `barChart`, take `siteId` | P1 | Bind params / add `?siteId=`; keep `name` temporarily | SQL injection by any authenticated user; apostrophe in a site name breaks the chart | Closes a vulnerability; removes a bug | `name="x' OR '1'='1"` and `"Bob's Plant"` return safe results/400 | Send `siteId` instead of name; the row already has `siteId` |
| **BE-2** | Verify & fix Absolute Contraction units | P1 (correctness) | Obtain spreadsheet; unit tests that reproduce it; one unit convention | Stored targets (and every dashboard target/gauge) may be off by orders of magnitude | Core product output must be right | Tests match spreadsheet for base ≤ 2020 and > 2020, with/without FLA | None (numbers change); re-run existing targets |
| **BE-3** | Request validation with clear 400s | P2 | `@Valid`: required fields; `base < target`; `base < mostRecent ≤ now`; `yearActivity` required for "Target Year Output"; sector/method whitelist | Garbage or crash on bad input from any client; opaque `failled` | Backend must not trust the UI | Each invalid payload → 400 with field + message | Can drop duplicate client checks later; show server message |
| **BE-4** | Atomic, loud calculation | P1 | One transaction; batch insert; rollback on error; no swallowed exceptions | Partial/empty targets after a failure while success is reported; dashboards read broken data | Data integrity, observability | Force an error mid-insert → previous targets intact, 500/400 returned | Existing error toast keeps working |
| **BE-5** | History + delete endpoint | P2 | Keep prior versions (or audit table); `DELETE /target/{siteId}` | Accidental overwrite is irreversible; no way to remove a target | Recoverability, audit trail | Re-run keeps previous version retrievable; delete removes site targets | Add delete / history UI if wanted |
| **BE-6** | Authorise `POST /target`; filter GETs by access | P1 | Role (SUPER_ADMIN/ADMIN) + per-site check on POST; filter `GET target`, `pieChart`, `barChart` | Any `USER` can change any site's target by calling the API; cross-site data exposure | UI is not a security boundary | `USER` → 403; ADMIN without site access → 403; GET omits inaccessible sites | None (UI rules already match) |
| **BE-7** | Guard maths; never persist NaN/Infinity | P1 | Presence checks (`Optional.isPresent`), zero guards, reject non-finite results, precheck data availability; remove N+1 in `getData()` | One bad run poisons dashboard sums with `NaN`; slow list | Prevents corrupted dashboard figures | Missing sector/year → 400 with message; zero base → rejected; list uses ≤ 2 queries | None |
| **BE-8** | Year-keyed bar-chart payload, no 2030 cap | P2 | Return `[{year, actual, target}]`; cap = max target year | Targets after 2030 never shown; possible series misalignment | Correct long-horizon charts | Target year 2040 appears; year with no actuals is `null` not shifted | Switch adapter to year-keyed data |
| **BE-9** | Data-availability pre-checks with specific messages | P2 | "No emission data for site X in YEAR", "No sectoral data for SECTOR in YEAR" | Every missing-data case looks the same (`failled`) | Actionable errors | Each missing-data case → distinct 4xx message | Message shown in the toast (already handled) |
| **BE-10** | Real HTTP status codes + JSON error body | P2 | 400/403/500 with `{message, field}`; retire `failled` | Clients can't distinguish error types; HTTP-200-with-error pattern | Standard, debuggable API | Error cases return correct status | `calculate()` error mapping simplified |
| **BE-11** | Sector/method lists from backend; logging; dead code | P3 | Endpoint or config for lists; replace `System.out`; delete commented code; decide if Absolute uses `sector` | Frontend release needed to add a sector; noisy console, unclear behaviour | Maintainability | List endpoint returns sectors in `sectoral_data` | Read lists from API |
| **BE-12** | Cleaner response fields | P3 | Numeric `reductionPct`; explicit org summary; rename donut metric if desired | Repeated org figure on each row; string percentages | Simpler client, fewer misreads | Fields present and typed | Simplify the org-row code |

**Suggested order:** BE-1, BE-6, BE-4, BE-7 (security/integrity) → BE-2 (needs the owner, can run in parallel) → BE-3, BE-9, BE-10 → BE-5, BE-8 → BE-11, BE-12.

---

## D. Frontend ideas not yet done (all need a decision or backend support)

1. Loading/error UI for the read panels (deferred project-wide).
2. Show a "stale — recalculated" or version note once BE-5 exists; add delete.
3. Switch the line-chart adapter to year-keyed data after BE-8.
4. Send `siteId` to `barChart` after BE-1.
5. Rename the donut ("Site-wise Target tCO₂e") — decision Q5 kept Angular's title.
6. Filter displayed data by site access (only meaningful after BE-6).
7. Dropdown search for long site lists (Angular has none either).

---

## E. Decisions taken (answers to the open questions)

| Q | Decision |
|---|---|
| Q1 | Route `/dashboard/target-setting` |
| Q2 | Port the UI now (it only calls the backend); formula suspicion raised separately (BE-2) |
| Q3 | **Add** the missing client-side validation (B.3–B.5) |
| Q4 | **Add** a confirm dialog before overwriting an existing site target (B.8) |
| Q5 | **Refetch** the line chart after Calculate (B.6); **keep** Angular's donut title (B.7) |
| Q6 | **Plain styled table** (sticky "Organization" row; Community DataGrid can't pin a row) |
| Q7 | Keep Angular's access behaviour (dropdown filtered, Calculate hidden for `USER`); don't filter displayed data client-side |
| Q8 | No design handoff — built on existing tokens/components; restyle when one arrives |
| Q9 | Keep the four sectors / two methods exactly (including that Absolute ignores sector) |
| Q10 | Keep the 2030 cap / index alignment (backend-driven, BE-8) |

---

## F. React implementation

**Files**
- `src/pages/dashboard/target/TargetSettingPage.jsx` — page, layout, confirm dialog.
- `src/pages/dashboard/target/components/TargetForm.jsx` — the form (react-hook-form + zod, `Dropdown` / MUI `TextField` / `Button`).
- `src/pages/dashboard/target/components/TargetTable.jsx` — stored-targets table.
- `src/pages/dashboard/target/targetSettingForm.js` — option lists, zod schema (validation), payload builder.
- `src/pages/dashboard/target/hooks/useTargetSettingData.js` — queries, derived data, the calculate mutation.
- `src/services/targetSettingService.js`; `endpoints.target.*`; `queryKeys.targetSetting.*`; route registered in `routes/index.jsx` (`/dashboard/target-setting`, protected). Sidebar entry already existed.
- Reused: `ChartCard` / `PageHeader` / `Row`+`Cell` container-query layout / chart option builders / palette (`emissionTheme.js`) from the Emission Dashboard; `Dropdown`; `sonner`; `accessUtils`.

**Behaviour (Angular parity unless stated)**
- Form fields, option lists, conditional fields per method, method switch clears the other method's fields, request body shape — as Angular (`buildPayload`).
- Site dropdown = sites with write access; Calculate hidden for `USER`; disabled until valid.
- Table: sticky header + sticky "Organization" sum row (click = organisation chart), clickable site rows (click = site chart; selected row highlighted), numbers `1.0-0`, "No data available" when empty.
- Line chart: Actual + Target (zeros → gaps), title `Actual Vs Target tCO₂e Emissions - {site|organisation}`; Download PNG + Expand (shared chart card). Donut: "Site-wise tCO₂e Emission Reduction" (see B.7).
- Layout is the same arrangement at every width (form | table above; line chart | donut below) with inner tightening, consistent at 100/110/125 % zoom (same rule as the Emission Dashboard).

**Deviations from Angular (intentional)**

| # | Deviation | Why |
|---|---|---|
| 1 | Stricter validation (target year required; target > base; most-recent > base; activity required for "Target Year Output") | B.3–B.5: prevents requests the backend cannot compute |
| 2 | Confirm dialog before replacing an existing site target | B.8: destructive, affects live dashboards |
| 3 | Line chart + Emission Dashboard queries refetch after a calculation | B.6 |
| 4 | `%` sign on % Reduction (display only) | B.7 |
| 5 | Failure toast carries a useful message instead of the raw `failled` | B.12 |
| 6 | Submit button disabled and relabelled "Calculating…" while in flight | prevents double submission of a destructive call |
| 7 | Table uses fixed layout with column shares and ellipsis (no sideways scroll) | consistency at 110 % / 125 % zoom |

**Known limitations (frontend side)**
- Cannot detect "no data for the chosen year" before submitting (B.5/BE-9).
- A stored `NaN` target (B.10) would display as `NaN`.
- No loading/error UI for the read panels (deferred).
- Line chart uses the backend's index-aligned arrays and 2030 cap (B.11).

---

## G. Status & verification

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Investigation / this document | ✅ | |
| 2 | Route `/dashboard/target-setting` (protected) + sidebar link | 🟡 | Implemented; sidebar link pre-existing |
| 3 | Service, endpoints, query keys | 🟡 | |
| 4 | Form (fields, conditional method fields, validation, payload) | 🟡 | Validation logic verified by a script (below) |
| 5 | Calculate (POST, body-status check, toasts, refetch table/pie/line chart/Emission Dashboard) | 🟡 | **Not exercised against a real backend** |
| 6 | Confirm-before-overwrite dialog | 🟡 | |
| 7 | Stored-targets table with sticky Organization row | 🟡 | |
| 8 | Actual vs Target line chart; site-wise donut | 🟡 | |
| 9 | Loading / error states for read panels | ⏸ | deferred |
| 10 | Backend items BE-1 … BE-12 | ⏸ | tracked in Section C |
| 11 | End-to-end verification against live data | 🚧 | backend unreachable from the build environment |

**Verification performed**
- `npm run lint` (0 errors) and `npm run build` pass.
- Validation rules run through a Node script against the zod schema: empty form; Absolute missing most-recent year; valid Absolute; most-recent ≤ base; target ≤ base; Sectoral without projection; "Target Year Output" without / with activity; "Fix Market" without activity — all behaved as specified. Payloads for both methods match Angular's `calculate()` body.
- Headless-Chrome render with mock API-shaped data at content widths ~1335 px and ~892 px (form, table, line chart, donut, layout, no sideways scroll after the column-share fix).
- **Not performed**: any real API call (including the POST), the confirm dialog interaction, the role-hidden Calculate button, the access-filtered site list, side-by-side comparison with the Angular page, the Sectoral form branch in a browser (schema-tested only).
