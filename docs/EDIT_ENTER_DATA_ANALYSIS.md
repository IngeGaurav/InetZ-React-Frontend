# Decarb "Edit/Enter Data" Route — Analysis, React Plan & Backend Backlog

> Angular route: `/report/edit-enter-data` (hash-routed: `#/report/edit-enter-data`).
> React route (same rename rule as the other dashboard-group pages): **`/dashboard/edit-enter-data`**.
> Angular: `EditEnterDataComponent` (`InetZ Frontend/InetZ-Frontend/src/app/monitor/edit-enter-data/`, declared in `MonitorModule`).
> Backend: `EmissionsController` (`@RequestMapping("emissions")`) → `EnterEditDataServiceImpl` → `ProcessBackFillingServiceImpl`.
> React implementation: `src/pages/dashboard/edit/EditEnterDataPage.jsx` (+ `src/services/editEnterDataService.js`) — **implemented as an exact port of Angular, with NO behavioural changes** (decision: parity first).
> Every improvement suggested for the frontend **and** the backend is recorded in this document and is **not implemented yet** — it is the work list for later (Sections C, E, H).
> Same format as `docs/TARGET_SETTING_ANALYSIS.md`.
>
> **How to read this document**
> - **A** — what Angular does (page, APIs, backend, frontend logic).
> - **B** — every problem found: *what Angular does → the problem → impact → what the React frontend will do about it → what the backend should do later and why*.
> - **C** — the **backend backlog** (`EE-1…EE-14`): one prioritised table with impact, rationale and an acceptance test per item (backend bugs are being handled separately; this is the work list).
> - **D** — frontend ideas that need a decision or backend support. **E** — what is implemented now (parity) and the **deferred frontend changes** (the later work list). **F** — decisions (taken / pending). **G** — status & verification. **H** — **detailed findings** (evidence in code, how to reproduce, full impact).
>
> **Why this page is special (read first):** it lets a user **overwrite measured emission inputs** for a given day. Saving **deletes and re-inserts rows in
> `calculation_history`** — the single table every dashboard and report reads (`docs/EMISSION_DASHBOARD_ANALYSIS.md` A.6). There is **no audit trail, no
> old-value retention, no approval step, and no server-side permission check**. A mistake or an unauthorised call changes reported GHG numbers silently.
> Most of the findings below follow from that.

---

## A. Current (Angular) Implementation

### A.1 Routing, sidebar, access

- `monitor-routing.module.ts`: `path: 'edit-enter-data'` → `EditEnterDataComponent`, a child of the lazy `MonitorModule` under `/report` (`MainLayoutComponent`, `AuthGuard`).
  No params, no resolvers. `AuthGuard` only checks that `sessionStorage.token` exists; the declared `permissions.only` role list is **not enforced** (cross-cutting, `docs/backend-context.md`).
- **Sidebar**: `report.json` → `{ "name": "Edit/Enter Data", "route": "/report/edit-enter-data", "src": "editor.png", "breadcrumbTitle": "Edit GHG Data" }`.
  `side-bar.component.ts` removes this item for role `USER` (`hasDashboardAccess()` = role ≠ `USER`). The top-bar title becomes **"Edit GHG Data"**.
- **In-page role rule**: `ngOnInit()` — if `!hasDashboardAccess()` it navigates to **`/report/equipment`** (the old, pre-ECharts dashboard — Emission Dashboard B.20). The route itself is otherwise open to `USER` if typed by hand; the backend has no role check (B.2).
- **React status**: the sidebar entry already exists (`DASHBOARD_NAV`, `ROUTES.DASHBOARD_EDIT_ENTER_DATA = '/dashboard/edit-enter-data'`, hidden for `USER`) and currently lands on the 404 page.

### A.2 Page structure (one screen)

**Filter row** (above the table)
| Control | Behaviour |
|---|---|
| **Time stamp** | PrimeNG calendar, `dd/mm/yy`, default **today**; clearing it stops fetching |
| **Site** | dropdown: **"All" (id −1)** + `general/site` filtered by `isWriteAccess(id)`; default All |
| **Plant** | dropdown: **"All" (id −1)** + `emissions/plant/{siteId}` for the chosen site; default All |

**Table** (PrimeNG `p-table`, `editable`, `dataKey="tag"`, grid lines): columns `Emission Type | ID/Tag | Site | Plant | Value | New Value`.
- *Emission Type*: raw backend type run through `formatStrings` (underscores → spaces, Title Case; empty → the literal `[]`). *Value*: `number:'1.0-2'`.
- *New Value*: **click-to-edit cell** — shows `rowData.newValue` as text; on click an `<input type="number">` bound to `rowData.newValue`.
- Empty state: "No data available".
- **UOM is returned by the backend but NOT shown** (B.7).

**Action row**: **Submit** button (right-aligned), `[disabled]="tables.length == 0"` — i.e. enabled whenever the table has rows, **whether or not anything was edited**.

### A.3 Backend APIs used

All via `ApiService`, wrapped `{ status, data }` (`ResponseModel`).

| # | Call | When | Purpose |
|---|---|---|---|
| 1 | `GET general/site` | `ngOnInit` | site dropdown (client-filtered by write access) |
| 2 | `GET emissions/plant/{siteId}` | on site change | plant dropdown. For "All" (`-1`) it returns nothing useful (`WHERE site_id=-1`) |
| 3 | `GET emissions/getEditDetails?timestamp=YYYY-MM-DD&site=<id|-1>&plant=<id|-1|0>` | after sites load; after every filter change; after a successful save | table rows (`EnterEditDataModel[]`) |
| 4 | **`POST emissions/postEditDetails`** | Submit | **the only write**; body = the **entire** `tables` array (every row, edited or not); reply `{status:200,data:"success"}` |

`EnterEditDataModel`: `{ type, tag, uom, site, plant, value, newValue, timestamp, id }`.
Response handling: `status == 200` → toast "Data saved successfully" and re-fetch the table; any other body status is ignored; the HTTP-error handler is **empty** (no message at all, B.9).

### A.4 Backend: controller → service → SQL / calculation

- **`GET getEditDetails`** (`EnterEditDataServiceImpl.getEditDetails(timestamp, site, plant)`): `Integer.parseInt` on `site`/`plant` (`-1` → no filter); one big
  `UNION ALL` over the seven config tables (`emissions_stationary / mobile / process_emision / fugitive_emision / production / electricity / steam`), each
  `LEFT JOIN`ing site, plant, `dropdown_field` (for `uom`) and **`calculation_history t5`** on `t1.id = CAST(t5.tag AS INTEGER)`, **then filtering `WHERE t5.type=<type> AND t5.timestamp='<timestamp>'`**
  — so the `LEFT JOIN` behaves as an inner join: **only entries that already have a calculation-history row for that exact day are returned** (B.8). `timestamp` is **concatenated into the SQL** (B.1).
  For each row, `tag` (a JSON array of dropdown objects) is parsed with Gson and replaced by the names joined with `", "`.
- **`POST postEditDetails`** (`postEditDetails(List<EnterEditDataModel>)`):
  1. group the rows by `type`;
  2. per type keep rows with `newValue != null && newValue > 0` (zero/negative/blank are silently dropped);
  3. map each to `MobileExcelData(timestamp, tag.split(",")[0], newValue)` — i.e. the **first tag name** (not the row id);
  4. resolve **one** `siteId` per type from the **first row's** `site` (id or case-insensitive name);
  5. call `ProcessBackFillingServiceImpl.buildMobileAndProcess(list, type, siteId)` and **always** return `ResponseModel(200, "success")`.
- **`buildMobileAndProcess`** (same path the Aspen/Excel back-fill uses): groups by date → for each date `process(...)` — builds a **GraalJS engine**, loads the organisation and the **whole `dropdown_field` table**, and runs the type's calculator (`processStationary`, `processMobile`, `processElectricity`, …) on `{tag → value}` for that **single `siteId`**
  → `batchInsert(list, type)`: drops rows with `co2e ≤ 0 || value ≤ 0` (except `process_emision`/`fugitive` rules), then **per item `DELETE FROM calculation_history WHERE tag='…' AND type='…' AND timestamp='…' AND site_id=…` followed by a string-built `INSERT`** (one statement each; every exception caught and printed, no transaction).
- The same function is reached from the nightly Aspen load and the Excel upload paths — so this page's edits are indistinguishable from automated data afterwards.

### A.5 Frontend business logic (all in `EditEnterDataComponent`)

- `selectedSite = -1`, `selectedPlant = -1` initially; `getSite()` builds `[{id:-1,name:'All'}, …writeAccessSites]` then fetches the table.
- `onSiteChange(id)` → `getPlant(id)` → on success sets `plantList = [All, …plants]`, `selectedPlant = -1`, **then** fetches the table. **The table is not fetched until the plant list arrives** (and not at all if that call fails) — meanwhile the previous site's rows stay on screen (B.10).
- `onPlantChange` / calendar change → fetch.
- `formatDate()` → local `yyyy-MM-dd`.
- `saveTable()` posts the whole `tables` array as-is; on success toast + re-fetch.
- No dirty tracking, no validation (the number input accepts negatives, decimals, `e` notation), no confirmation, no leave-guard.

---

## B. Problems found — impact, frontend handling, backend follow-up

Format: **Angular** · **Problem** · **Impact** · **React (deferred — not implemented, parity kept)** · **Backend (future)** (IDs refer to Section C). The React page currently reproduces every one of these Angular behaviours on purpose; the "React (deferred)" lines are the agreed future changes.

### B.1 SQL injection in `GET getEditDetails?timestamp=` — *Security, High*
- **Angular:** sends a formatted date.
- **Problem:** `timestamp` is concatenated into **seven** sub-queries (`… t5.timestamp='<timestamp>'`). `site`/`plant` go through `Integer.parseInt` (safe, but a non-number → HTTP 500). Elsewhere in the save path, tag names, types and ids are string-built into `DELETE`/`INSERT` statements — a tag name containing `'` breaks the save.
- **Impact:** any authenticated user can inject SQL through a URL; legitimate tag names with an apostrophe silently fail to save.
- **React (deferred — not implemented, parity kept):** send the date as a strict `YYYY-MM-DD` (date control, never free text). This does **not** close the hole (anyone can call the API directly) — documented only.
- **Backend — EE-1:** bind parameters everywhere in this path (`getEditDetails`, `batchInsert`'s `DELETE`/`INSERT`); parse the date to `LocalDate`. *Why:* removes a real vulnerability and a class of silent save failures. Test: `timestamp=2026-01-01' OR '1'='1` → 400; tag `O'Brien` saves.

### B.2 No server-side authorisation; "All" leaks other sites — *Security, High*
- **Angular:** hides the menu item for `USER`, redirects `USER` away, filters the Site dropdown by write access.
- **Problem:** neither endpoint checks role or site access. `GET` with `site=-1` returns rows for **every** site, including ones the user may not access. `POST` accepts any rows.
- **Impact:** any logged-in user (even `USER`) can read every site's inputs and **overwrite emission data for any site** by calling the API — silently changing the company's reported numbers. (Same class as Emission Dashboard B.3 / Target Setting B.9.)
- **React (deferred — not implemented, parity kept):** keeps Angular's UI rules (menu hidden for `USER`; direct visit redirects `USER` — to the emission dashboard instead of the old page; Site dropdown filtered by write access). Displayed data is **not** filtered client-side (cosmetic only; decision as for Target Setting Q7).
- **Backend — EE-2:** authorise `POST` by role (SUPER_ADMIN/ADMIN) **and** per-site access for every row; make `GET site=-1` return only the caller's accessible sites. *Why:* the UI is not a security boundary. Test: `USER` token → 403; ADMIN without access to site X → 403 for rows of X; `site=-1` omits X.

### B.3 Wrong site attribution when a submission spans several sites — *Correctness, High*
- **Angular:** with Site = "All" the table contains rows from many sites and posts them all together.
- **Problem:** the backend groups by `type` and resolves **one** `siteId` from the **first row** of each group, then runs the whole group for that site. Rows belonging to other sites are processed against the wrong site's configuration — dropped silently or mis-attributed.
- **Impact:** an edit made in the "All" view can be lost or written against the wrong site while the UI reports success.
- **React (deferred — not implemented):** **submit one request per site** — group edited rows by site and POST each group separately (sequentially), then report per-site success/failure. This guarantees each request has a single, correct site. Documented as a deliberate deviation.
- **Backend — EE-3:** process each row with **its own** site id (and plant), not the first row's. *Why:* correctness regardless of client behaviour. Test: submit rows of two sites in one request → each lands on its own site.

### B.4 Rows are identified by tag **name** (first name, `split(",")`), not by id — *Correctness, Medium–High*
- **Angular:** posts the display row back unchanged (`tag` = names joined with `", "`).
- **Problem:** the backend takes `tag.split(",")[0]` — the **first** tag name only. A name containing a comma is cut; duplicate tag names across plants/sites are ambiguous; the row's real `id` and `plant` are ignored.
- **Impact:** an edit can land on the wrong equipment, or on none, with success reported.
- **React (deferred — not implemented, parity kept):** posts the rows exactly as received (including `id`, `plant`, `site`, `timestamp`) — preserving the contract; per-site grouping (B.3) removes the cross-site ambiguity.
- **Backend — EE-4:** identify rows by config **id** (+ type + plant) instead of tag name; stop parsing display strings. *Why:* unambiguous, injection-resistant, no data loss on names with commas.

### B.5 No audit trail, no history, no approval — *Compliance / data integrity, High*
- **Angular:** just POSTs.
- **Problem:** the save `DELETE`s the existing `calculation_history` row and inserts a new one. The old value is **gone**; nothing records who changed what, when, or why. Edits are indistinguishable from automated Aspen data.
- **Impact:** reported GHG figures can change with no traceability — a problem for audits and for finding out why a number moved; accidental or malicious edits are irreversible.
- **React (deferred — not implemented, parity kept):** a **confirmation dialog** before saving that summarises what will change ("Update N values for DATE across M sites — this recalculates emissions and changes dashboards/reports immediately"); the changed rows are shown in a review list. After a successful save, dependent queries are refreshed.
- **Backend — EE-5:** write an **audit record** per change (user, time, tag/site/plant/type, date, old value, new value, source = "manual edit"), keep the previous row (soft-delete/versioned), optionally an approval flag. *Why:* traceability and recoverability of the system of record. Test: edit → audit row exists with old/new; revert possible.

### B.6 Non-atomic save with swallowed errors, but always "success" — *Data integrity, High*
- **Angular:** shows "Data saved successfully" on `status == 200`.
- **Problem:** `postEditDetails` always returns `200 "success"`. Inside, per date/type exceptions are caught (`e.printStackTrace()`); `batchInsert` deletes and inserts row by row with every exception swallowed and **no transaction**. Calculations that throw are skipped silently.
- **Impact:** some rows saved, some not, some deleted-but-not-re-inserted — and the user is told everything worked. The dashboard then shows gaps or stale numbers.
- **React (deferred — not implemented, parity kept):** treats `status == 200` as "request accepted", **not** proof of success — after saving it **re-fetches the table** and the toast says how many rows were submitted; rows whose displayed Value did not change are flagged ("not applied") so a silent drop is visible to the user. Per-site POSTs (B.3) isolate failures.
- **Backend — EE-6:** one transaction per request; collect per-row results (`applied | skipped(reason) | failed(reason)`) and return them with a real status (207/400/500); no swallowed exceptions. *Why:* the caller must know what actually happened. Test: force a calculator exception → request fails, previous data intact, error reported.

### B.7 UOM is not shown, so the user cannot know the unit — *UX / data quality, Medium*
- **Angular:** the backend returns `uom` (from `dropdown_field`) for every row, but the table has no UOM column; the user types a number with no unit.
- **Impact:** wrong-unit entries (e.g. kg vs t, kWh vs MWh) — the most likely real-world data error on this page.
- **React (deferred — not implemented, parity kept):** add a **Unit** column (backend already returns it) next to Value/New Value; blank for fugitive (the backend sends `''`).
- **Backend — EE-9:** also return the expected range/precision per tag and validate units/ranges server-side. *Why:* prevents order-of-magnitude input errors.

### B.8 "Enter" is not possible — only existing history rows appear — *Functionality gap, Medium*
- **Angular:** page is named "Edit/Enter Data".
- **Problem:** the query filters `WHERE t5.type=… AND t5.timestamp='<day>'` on the left-joined history table, which turns it into an inner join: a configured tag with **no history row for that day never appears**. So the page can only **edit existing values**, never enter a missing day (a gap from a failed nightly load stays a gap).
- **Impact:** users cannot repair missing data; the title promises something the page doesn't do.
- **React (deferred — not implemented, parity kept):** mirrors the current behaviour (no invented rows); the empty state message explains "No recorded values for this date. Only dates that already have data can be edited."
- **Backend — EE-8 (product decision):** return **all configured tags** for the filters (left join, value null when missing) so data can be entered for gaps; this also needs EE-7's "0 vs blank" semantics.

### B.9 Silent failures and misleading success — *UX, Medium*
- **Angular:** the HTTP-error handler is empty (nothing shown); a non-200 body status is ignored; **Submit is enabled even when nothing was edited**, and posting an unedited table still returns "success".
- **Impact:** users think data was saved when nothing happened; failures are invisible.
- **React (deferred — not implemented):** Submit is **disabled until at least one valid edit exists** and shows the count ("Submit 3 changes"); failure toasts carry a real message; per-site results are reported.
- **Backend — EE-10:** real HTTP status codes and a JSON `{message, field/row}` body; no HTTP-200-with-error. See also EE-6.

### B.10 Stale rows and request races when filters change — *Frontend bug, Medium*
- **Angular:** changing the site first loads plants and only then fetches the table; if the plant call fails there is no fetch; during the wait the previous site's rows stay on screen, and **edits typed into them are still posted**. Switching filters silently **discards** unsaved edits (the array is replaced).
- **Impact:** a user can edit and submit rows that are no longer the selected site's; typed values vanish without warning.
- **React (deferred — not implemented, parity kept):** the table is a single TanStack query keyed by `(date, site, plant)` — new filters never show old rows; plants are loaded independently (and **not requested for "All"**, which returns nothing); edits are kept in local state **keyed by row** and a **"discard unsaved changes?"** prompt appears when a filter change would drop them.
- **Backend:** none.

### B.11 Zero / negative / blank values are silently ignored — *Correctness/UX, Medium*
- **Angular:** `<input type="number">` accepts negatives, decimals and exponents; nothing is validated.
- **Problem:** the backend keeps only `newValue > 0`; a correction **to zero** (or clearing a value) is impossible and silently ignored; for most types rows whose recomputed `co2e ≤ 0` or `value ≤ 0` are dropped by `batchInsert` **after** being skipped — so the **old row is not even deleted** and stays as-is while "success" is shown.
- **Impact:** users cannot correct an over-reported value down to 0; the page reports success for an edit that did nothing.
- **React (deferred — not implemented, parity kept):** client validation — a new value must be a number **greater than 0**, with the explicit message "Values must be greater than 0 — the server ignores 0 and negative values"; invalid cells are highlighted and block Submit.
- **Backend — EE-7:** define semantics (`null` = unchanged, `0` = set to zero, negative = reject with 400); apply the update (delete/replace) even when the recalculated `co2e` is 0. *Why:* correctness and honest feedback.

### B.12 Heavy synchronous processing; request may exceed the client timeout — *Performance, Medium*
- **Backend:** for every date × type, `process()` builds a GraalJS engine, loads the organisation and the whole `dropdown_field` table, runs the calculator, then single-statement delete+insert per item. Large submissions (All sites, many rows) can take a long time.
- **Impact:** the React client's default request timeout is **30 s** (`VITE_API_TIMEOUT`); a long save would be reported as failed while the server keeps going — the user resubmits and doubles the work.
- **React (deferred — not implemented, parity kept):** a longer timeout for this one call (proposed 120 s), the button shows "Saving…" and stays disabled while in flight, and per-site requests keep each call smaller.
- **Backend — EE-11:** reuse the engine / reference data across rows, batch statements, or make it an async job with a status endpoint. *Why:* responsiveness and reliability.

### B.13 Input hygiene: no limits on dates or values — *Data quality, Low–Medium*
- **Problem:** any date can be picked (including the future and years already reported); no maximum value; no "locked period" concept.
- **React (deferred — not implemented, parity kept):** no future dates in the date control (a recorded value for a future day cannot exist anyway); everything else is a backend/product matter.
- **Backend — EE-12 (product):** lock reported periods; reject future dates; sanity ranges.

### B.14 Fragile server parsing / response — *Robustness, Low–Medium*
- **Problem:** a row whose `tag` JSON is missing/invalid makes `Gson` return null → `NullPointerException` for **the whole list** (HTTP 500); non-numeric `site`/`plant` → `NumberFormatException` (500); `formatStrings` shows the literal `[]` for an empty type.
- **React (deferred — not implemented, parity kept):** a friendly empty/error state; type labels formatted with a safe fallback (not `[]`).
- **Backend — EE-13/EE-10:** skip/flag bad rows instead of failing the list; validate params; clean DTO.

### B.15 Hardcoded string matching on types, dead/test code — *Maintainability, Low*
- `process()` dispatches on `type.equalsIgnoreCase("mobile")…`; `System.out`/`printStackTrace` everywhere. **Backend — EE-13.**

---

## C. Backend backlog (work list for the backend team)

Priority: **P1** security / data integrity / compliance, **P2** correctness & UX, **P3** hygiene.

| ID | Title | Pri | What to do | Impact if NOT fixed | Why improve | Acceptance test | Frontend impact |
|---|---|---|---|---|---|---|---|
| **EE-1** | Parameterise the get/save SQL | P1 | Bind params in `getEditDetails`, `batchInsert` (`DELETE`/`INSERT`); parse date to `LocalDate` | SQL injection; tag names with `'` fail to save | Closes a vulnerability and a silent-failure class | Injection string → 400; tag `O'Brien` saves | none |
| **EE-2** | Authorise GET/POST by role + site | P1 | Role (SUPER_ADMIN/ADMIN) + per-site on every row; `site=-1` returns only accessible sites | Any user can read/overwrite any site's emission data | UI is not a security boundary | `USER`→403; ADMIN w/o site X→403 for X rows | none (UI rules match) |
| **EE-3** | Per-row site (and plant) in processing | P1 | Process each row with its own site/plant, not the first row's | Edits mis-attributed or dropped in multi-site submissions | Correctness independent of client | Two-site payload → each site updated | can submit all sites in one request (per-site split becomes optional) |
| **EE-4** | Identify rows by id, not tag name | P1/P2 | Use config `id` + type + plant; stop `split(",")[0]` | Wrong equipment edited / lost for names with commas or duplicates | Unambiguous identity | Duplicate tag names in 2 plants update the right one | send `id` (already in payload) |
| **EE-5** | Audit trail + versioning | P1 | Audit table (user, time, keys, old/new, source); keep prior row; optional approval | No traceability; irreversible edits to reported data | Audits, forensics, recovery | Edit → audit row; revert restores old value | add history/"changed by" UI later |
| **EE-6** | Transactional save with per-row results | P1 | One transaction; per-row `applied/skipped/failed`; no swallowed exceptions; real status | Partial saves reported as success; dashboards show gaps | Caller must know the outcome | Forced calculator error → rollback + error | show per-row outcome instead of re-fetch inference |
| **EE-7** | Define 0 / blank / negative semantics; apply recalculated zeros | P2 | `null`=unchanged, `0`=set 0, negative→400; replace even if `co2e=0` | Can't correct to 0; stale rows stay with "success" | Honest, complete edits | `newValue=0` updates; `-5` → 400 | allow 0 in the UI |
| **EE-8** | Return all configured tags (enable real "Enter") | P2 (product) | Left join so tags with no history appear (value null) | Gaps cannot be repaired; title misleading | Complete the feature | Tag without history for the day is listed and saveable | rows with empty Value become editable |
| **EE-9** | Unit/range validation + return ranges | P2 | Server-side range/unit checks; return limits per tag | Order-of-magnitude input errors go in unnoticed | Data quality | Out-of-range value → 400 with reason | show hints/limits |
| **EE-10** | Real HTTP statuses + JSON error body; param validation | P2 | 400/403/500 + `{message,row}`; validate `timestamp/site/plant` | HTTP-200-with-error; 500s on bad input | Standard, debuggable API | Bad date → 400 | simplify error mapping |
| **EE-11** | Performance: reuse engine/reference data, batch writes or async job | P2 | Cache org + `dropdown_field`; batch; optional async | Slow saves; client timeouts → duplicate resubmits | Reliability | 500 rows save in < N s | drop long timeout / add progress |
| **EE-12** | Period locking, future-date rejection, sanity limits | P2 (product) | Lock reported periods; reject future dates | Reported periods can be altered | Governance | Locked period → 409 | disable locked dates |
| **EE-13** | Robust list building; remove string-typed dispatch | P3 | Skip/flag bad rows (null tag JSON); enum for types; logging | One bad row 500s the whole list | Robustness | List survives a malformed row | none |

**Suggested order:** EE-1, EE-2, EE-6, EE-3, EE-4 (security/integrity/correctness) → EE-5 (compliance; can start in parallel) → EE-7, EE-10, EE-9 → EE-8, EE-12 (product decisions) → EE-11, EE-13.

---

## D. Frontend ideas not planned yet (need a decision or backend support)

1. Bulk paste / Excel import of values (the backend already has an Excel path — separate feature).
2. History / "last changed by" column after EE-5.
3. Per-row outcome icons after EE-6.
4. Range/unit hints after EE-9.
5. Locked-date handling after EE-12.
6. Keyboard-first grid editing (Tab/Enter navigation) — comes mostly free with DataGrid cell editing.

---

## E. React: what is implemented now, and the deferred changes

### E.1 Implemented now — exact port of Angular (no behavioural changes)

**Files:** `src/pages/dashboard/edit/EditEnterDataPage.jsx`; `src/services/editEnterDataService.js`; `endpoints.emissions.getEditDetails / postEditDetails`; `queryKeys.editEnterData.*`; route `/dashboard/edit-enter-data` (protected) in `routes/index.jsx`. The sidebar entry already existed (hidden for `USER`).

| Angular behaviour | React (same) |
|---|---|
| Page title / top bar "Edit GHG Data" | `PageTitle` + header "Edit GHG Data" |
| Filters: **Time stamp** (default today), **Site** ("All" = −1 + write-access sites), **Plant** ("All" = −1 + that site's plants) | Native date input (default today, **no max** — Angular had none), two `Dropdown`s with the same options |
| Changing the site resets the plant to "All" | same |
| Table `GET emissions/getEditDetails?timestamp=YYYY-MM-DD&site=<id|-1>&plant=<id|-1|0>` after sites load and on every filter change | same query (re-fetched on every filter change, and after a save) |
| Columns `Emission Type · ID/Tag · Site · Plant · Value · New Value`; type via `formatStrings` (underscores → spaces, Title Case, empty → `[]`); Value `1.0-2` decimals; **no Unit column** | same (MUI X DataGrid) |
| "New Value" is a click-to-edit number cell | click on the cell opens a number editor (DataGrid's default double-click is overridden to a single click) |
| Empty table → "No data available" | same |
| **Submit** enabled whenever the table has rows, edited or not | same (additionally disabled while a save is in flight, to avoid an accidental double click — the only tiny addition; see E.3) |
| Submit posts the **entire table** (every row, with `newValue` set only where typed) to `POST emissions/postEditDetails` | same payload shape (the original row objects) |
| Success: only when the body `status === 200` → toast "Data saved successfully" and re-fetch; any other body status ignored; HTTP errors show nothing | same |
| Role `USER`: Angular redirects to `/report/equipment` (old dashboard) | redirects to `/dashboard/emission-dashboard` (the old page is not ported — the only necessary difference) |
| No validation, no confirmation, no dirty tracking, no leave guard | same — none |
| Edits are discarded when the table is replaced (filter change / refetch) | same (edits are tied to the data they were typed against) |

### E.2 Behaviours reproduced that look like bugs (kept on purpose; see Section B/H)
Whole-table POST; Submit enabled with no edits; no unit shown; zero/negative/blank accepted by the editor (the backend ignores them); success toast regardless of what the server actually did; silent HTTP errors; "All" shows every site's rows; unsaved edits vanish on filter change.

### E.3 Differences from Angular that exist today (complete list)
1. `USER` redirect target (`/dashboard/emission-dashboard` instead of the old `/report/equipment`).
2. Submit button is also disabled while a save request is in flight.
3. Native date input instead of PrimeNG's `dd/mm/yy` calendar (date control only; same value format sent, `YYYY-MM-DD`).
4. Plant list is not requested when Site = "All" (Angular requested `emissions/plant/-1`, which returns nothing); the plant list is "All" only in that case — same visible result.
5. The table is fetched as soon as the site list has loaded and again on each filter change; Angular additionally waited for the plant list to load after a site change (see B.10) — the visible result is the same or faster.

### E.4 Deferred frontend changes (NOT implemented — the later work list)
Each is described with its reasoning in Section B and H; implement together with the matching backend item where noted.

| # | Change | Related finding | Needs backend? |
|---|---|---|---|
| FE-1 | Submit **one POST per site, edited rows only** (stops the multi-site mis-attribution) | B.3 / H.3 | No (workaround); simplify after EE-3 |
| FE-2 | **Confirm/review dialog** before saving ("N values, date, sites — recalculates emissions and changes dashboards/reports") | B.5 / H.5 | No |
| FE-3 | Submit disabled until ≥ 1 valid edit; show the count | B.9 / H.9 | No |
| FE-4 | **Unit column** (backend already returns `uom`) | B.7 / H.7 | No |
| FE-5 | Client validation: value must be a number > 0 with an explanation | B.11 / H.11 | No (relax after EE-7) |
| FE-6 | "Discard unsaved changes?" prompt on filter change; edits kept per row | B.10 / H.10 | No |
| FE-7 | Meaningful success/failure feedback: re-fetch, flag rows whose Value did not change, real error messages | B.6, B.9 / H.6 | Better with EE-6 |
| FE-8 | Longer timeout (≈120 s) for the save call; "Saving…" state | B.12 / H.12 | No |
| FE-9 | No future dates in the date control; empty-state text "Only dates that already have data can be edited" | B.8, B.13 | No |
| FE-10 | Invalidate Emission Dashboard / report queries after a save | B.5 | No |
| FE-11 | Show per-row outcome / history / locked dates | D | After EE-6 / EE-5 / EE-12 |

## F. Decisions (taken / pending)

**Taken:** build the page as an **exact port of Angular** (parity first); record every suggested frontend and backend change here and work through them later using this document (Sections B, C, E.4, H). The table below keeps the earlier recommendations for when each deferred item is picked up.

| Q | Question | Recommendation |
|---|---|---|
| **Q1** | Route `/dashboard/edit-enter-data`; `USER` redirected to the emission dashboard? | **Done** |
| **Q2** | Date control: native `<input type="date">` via MUI `TextField` (no new dependency), or add `@mui/x-date-pickers` (the theme already has overrides ready)? | Native-based `TextField type="date"` with `max=today` — simplest and accessible; revisit if you want the calendar look |
| **Q3** | Submit **per site, edited rows only** (B.3 mitigation) instead of Angular's "whole table in one request"? | Yes — payload shape unchanged; avoids the backend mis-attribution until EE-3 |
| **Q4** | Add the confirm/review dialog before saving (B.5)? | Yes — it overwrites the system of record with no undo |
| **Q5** | Client validation: require values **> 0** and block 0/negative (B.11)? | Yes — the backend ignores them anyway; reconsider after EE-7 |
| **Q6** | Show the **Unit** column (B.7)? | Yes |
| **Q7** | Warn before discarding unsaved edits on filter change (B.10)? | Yes |
| **Q8** | "All" view: keep Angular's behaviour (shows all sites' rows even if not accessible), or hide rows of sites the user lacks access to client-side? | Keep Angular's behaviour — filtering display data only hides the gap (EE-2 is the fix); editing is still per-site |
| **Q9** | Longer timeout (120 s) for the save call? | Yes |
| **Q10** | Table: MUI X DataGrid with cell editing (default per CLAUDE.md) or a plain table with inputs? | DataGrid — virtualised, editable cells, keyboard navigation |
| **Q11** | Design handoff available? | None known — build on existing tokens/components and restyle later |
| **Q12** | Loading/error states for the read panels? | Deferred project-wide |

---

## G. Status & verification

Legend: ✅ done · 🟡 implemented, unverified · ⏸ deferred · 🚧 blocked

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Investigation / this document | ✅ | |
| 2 | Route `/dashboard/edit-enter-data`, service, endpoints, query keys | 🟡 | exact port of Angular |
| 3 | Filter bar (date / site / plant) | 🟡 | |
| 4 | Editable table (click-to-edit "New Value", `formatStrings` types, `1.0-2` values) | 🟡 | |
| 5 | Submit (whole table, body-status check, toast, refetch) | 🟡 | **not exercised against a real backend** |
| 6 | `USER` redirect | 🟡 | |
| 7 | Deferred frontend changes FE-1…FE-11 | ⏸ | Section E.4 |
| 8 | Backend items EE-1…EE-13 | ⏸ | Section C |
| 9 | End-to-end verification against live data | 🚧 | backend unreachable from the build environment |

**Verification performed (implementation)**
- `npm run lint` (0 errors) and `npm run build` pass.
- Headless-Chrome render with mock API-shaped data: header + filters, the six columns, formatted type/value, tinted editable column, Submit; a click on a "New Value" cell opens the number editor.
- **Not performed:** any real API call (including the POST), the `USER` redirect, the access-filtered site list, a plant list load, side-by-side comparison with the Angular page, multi-row edit-and-submit.

**Verification performed (investigation phase)**
- Read in full: `edit-enter-data.component.{ts,html,scss}`, `monitor-routing.module.ts`, `format-strings.pipe.ts`, `side-bar.component.ts` / `report.json` (entry + role filter);
  backend `EmissionsController` (the three routes), `EnterEditDataServiceImpl` (whole), `EnterEditDataModel`, `MobileExcelData`, `ProcessBackFillingServiceImpl.buildMobileAndProcess/process/batchInsert`; callers of `buildMobileAndProcess` (Aspen load, Excel upload, this page).
- **Not performed**: running the Angular page or the backend (unreachable here); a live response capture (tag format, `uom` casing, empty-state shapes); reading the individual calculators (`processStationary`, `processMobile`, …) to confirm exactly how they use `siteId`/tag names (B.3/B.4 are derived from the grouping + single-`siteId` call, and should be confirmed with a two-site test when the backend is reachable); confirming `calculation_history.timestamp`'s column type.


---

## H. Detailed findings (evidence, reproduction, impact)

*Code references are to the repositories at the time of writing. "Evidence" = where to look; "Reproduce" = how to see it once a backend is reachable; "Impact" = who is affected and how.*

### H.1 SQL injection through the date (B.1 / EE-1) — **Security, High**
- **Evidence:** `EnterEditDataServiceImpl.getEditDetails`, lines 42, 49, 56, 62, 69, 76, 83 — each of the seven `UNION ALL` branches ends `… where t5.type='<type>' and t5.timestamp='" + timestamp + "'`. `timestamp` is `@RequestParam String` (`EmissionsController.getTemplate`, line 87–92) with no validation. `site`/`plant` are parsed with `Integer.parseInt` (lines 35–36), so they are safe from injection but a non-number throws `NumberFormatException` → HTTP 500. The save path (`ProcessBackFillingServiceImpl.batchInsert`, lines 151–152 and the `INSERT` after it) concatenates `tag`, `type`, `timestamp` and ids the same way.
- **Reproduce:** `GET /emissions/getEditDetails?timestamp=2026-01-01' OR '1'='1&site=-1&plant=-1` returns every row of every day (or a 500 if the quote breaks the SQL). A tag named `O'Brien` makes its `DELETE`/`INSERT` fail silently (the exception is caught).
- **Impact:** anyone who can log in can read or alter database content through a URL; legitimate tag names containing an apostrophe cannot be edited at all while the page says "saved".
- **Why it matters here more than elsewhere:** the same database holds the reported emission figures.

### H.2 No server-side authorisation; "All" exposes other sites (B.2 / EE-2) — **Security, High**
- **Evidence:** `EmissionsController` (lines 87–97) has no role/site checks; `getEditDetails` with `site=-1` applies no site filter (`siteId > 0 ? … : ""`, lines 44, 51, 58, 64, 71, 78, 85); `postEditDetails` accepts any rows. Angular enforces role/site only in the browser: `edit-enter-data.component.ts` `ngOnInit` (lines 41–47: `hasDashboardAccess()` → navigate away) and `getSite()` (lines 79–92: `isWriteAccess` filter); `side-bar.component.ts` removes the menu item for `USER`.
- **Reproduce:** with a `USER` token, `POST /emissions/postEditDetails` with a valid body succeeds; with an ADMIN who has access to one site, `GET …&site=-1` still lists other sites' rows.
- **Impact:** a low-privilege user can silently change emissions data for any site; site-level confidentiality is not enforced. The change flows into every dashboard and report (see H.5).

### H.3 Multi-site submissions are processed against the wrong site (B.3 / EE-3) — **Correctness, High**
- **Evidence:** `postEditDetails` (lines 97–120): `resp = groupingBy(type)`; per type `siteId` is resolved from `map.getValue().get(0).getSite()` — the **first row** of that type (lines 106–115) — and `buildMobileAndProcess(list, type, siteId)` is called once for the whole group (line 116). `buildMobileAndProcess` → `process(..., siteId)` passes that single id into the calculators and into `batchInsert`'s `DELETE … and site_id=<id>`.
- **Reproduce:** show Site = "All", edit one stationary row of site A and one of site B, Submit. Both are processed with site A's id: site B's value is calculated with A's configuration (or dropped) and written/deleted against `site_id = A`. (To be confirmed with a two-site test; the calculators were not read in detail.)
- **Impact:** edits made in the default "All" view — the view the page opens in — can be lost or attributed to the wrong site while the UI shows "Data saved successfully". Wrong site totals on dashboards.

### H.4 Rows are identified by the first tag *name* (B.4 / EE-4) — **Correctness, Medium–High**
- **Evidence:** `getEditDetails` lines 88–93 replace the row's JSON `tag` by the dropdown names joined with `", "` for display; `postEditDetails` line 102 maps each row to `MobileExcelData(timestamp, tag.split(",")[0], newValue)`. The row's `id`, `plant` and `uom` are not used by the save.
- **Reproduce:** a tag whose name contains a comma ("Boiler, North") is cut to "Boiler"; two equipment with the same tag name in different plants are indistinguishable to the save.
- **Impact:** the wrong equipment is updated, or none, with "success" returned.

### H.5 No audit trail, no history, no approval; changes flow straight into reports (B.5 / EE-5) — **Compliance, High**
- **Evidence:** `batchInsert` lines 150–157 `DELETE` the existing `calculation_history` row for `(tag, type, timestamp, site_id)` and lines 161–176 `INSERT` the recalculated one. No user, no old value, no reason is stored anywhere. The same function is used by the nightly Aspen load (`ApenDataLoadServiceImpl` lines 197, 208) and Excel uploads (`EmissionServiceImpl` lines 776, 788), so a manual edit is indistinguishable from automated data afterwards.
- **Impact:** a changed reported figure cannot be traced or reverted; an unauthorised or mistaken edit (H.2, H.3, H.7) is permanent. Dashboards (Emission Dashboard, Monthly Summary, Annual Report) read this table live — edits change them immediately.

### H.6 Save is not atomic and always reports success (B.6 / EE-6) — **Data integrity, High**
- **Evidence:** `postEditDetails` line 119 `return new ResponseModel(200, "success")` unconditionally. `buildMobileAndProcess` lines 84–86 catch and print any exception per date; `batchInsert` wraps each `DELETE` (lines 153–157) and each `INSERT` (lines 172–176) in `try/catch (Exception) { printStackTrace }`; there is no transaction. Angular `saveTable()` (component lines 65–77) shows the success toast on body `status == 200` and has an empty `error:` handler (lines 73–75).
- **Impact:** a calculation that throws leaves the old row deleted (or the new one missing) while the user sees success; partial saves are invisible; the dashboards then show gaps or stale values with no explanation.

### H.7 The unit is hidden (B.7 / EE-9) — **Data quality, Medium**
- **Evidence:** the SQL selects `t4.name as uom` from `dropdown_field` for six of seven types (fugitive returns `''`) and the model carries `uom`, but `edit-enter-data.component.html` has no unit column (columns: Emission Type, ID/Tag, Site, Plant, Value, New Value) — the React port reproduces this.
- **Impact:** a user typing "1500" cannot tell whether the field expects kg, tonnes, kWh or MWh — the most likely real-world data-entry error, silently multiplying a site's emissions by 10³.

### H.8 Only existing history rows can be edited — "Enter" does not exist (B.8 / EE-8) — **Functionality, Medium**
- **Evidence:** every branch is `emissions_X t1 … LEFT JOIN calculation_history t5 ON t1.id = CAST(t5.tag AS INTEGER) WHERE t5.type='X' AND t5.timestamp='<day>'` (lines 38–85). The `WHERE` on `t5` removes rows where the left join found nothing, so a configured tag with no history row that day is not listed.
- **Impact:** a day lost to a failed nightly load (see `emission-dashboard-fix-summary.md`) cannot be repaired from this page; the page title ("Edit/Enter") over-promises.
- **Note:** the join `t1.id = CAST(t5.tag AS INTEGER)` assumes `calculation_history.tag` holds the config row id as text; a non-numeric tag makes `CAST` fail for the whole query (HTTP 500).

### H.9 Misleading controls and silent failures (B.9 / EE-10) — **UX, Medium**
- **Evidence:** html line 71 `<button (click)="saveTable()" [disabled]="tables.length==0">` — enabled whenever rows exist; `saveTable()` posts the whole array every time; component lines 73–75 an empty error handler; a non-200 body status is not handled at all.
- **Impact:** clicking Submit with no edits posts every row and still shows "saved"; a failed request shows nothing; users cannot tell whether anything happened.

### H.10 Stale rows and lost edits when filters change (B.10) — **Frontend, Medium**
- **Evidence:** Angular `onSiteChange` → `getPlant()` (component lines 102–126) which fetches the table only in its success callback; until then the previous rows remain editable and postable. Every refetch replaces the `tables` array, discarding typed values with no warning.
- **Impact:** typed work is lost; a user can submit rows that are no longer the selected site's.

### H.11 Zero / negative / blank values are ignored silently (B.11 / EE-7) — **Correctness, Medium**
- **Evidence:** `postEditDetails` line 101 `filter(f -> f.getNewValue() != null && f.getNewValue() > 0)`; `batchInsert` lines 142–148 additionally drop recalculated rows with `co2e ≤ 0` or `value ≤ 0` (for every type except fugitive/process rules) **before** the delete loop (lines 150–157) — so the old row is not deleted either. The Angular input is a plain `type="number"` (html line 54) with no validation.
- **Reproduce:** enter 0 (or −5, or clear the cell) and Submit: success toast, the table re-fetches, the value is unchanged.
- **Impact:** an over-reported value cannot be corrected down to 0; users believe they corrected it.

### H.12 Long synchronous processing vs a 30-second client timeout (B.12 / EE-11) — **Performance, Medium**
- **Evidence:** `process()` (`ProcessBackFillingServiceImpl` lines 105–134) builds a `ScriptEngineManager().getEngineByName("graal.js")`, calls `decardService.getOrg()` and loads the whole `dropdown_field` table **for every date × type**; `batchInsert` runs two statements per row sequentially. The React client's axios timeout is `VITE_API_TIMEOUT=30000` (Angular's `ApiService` has its own default).
- **Impact:** a large submission can exceed the timeout; the client reports a failure (or nothing, since errors are silent) while the server keeps working; the user resubmits and doubles the work.

### H.13 Fragile server parsing (B.14 / EE-13) — **Robustness, Low–Medium**
- **Evidence:** lines 88–93 `new Gson().fromJson(item.getTag(), listType)` returns `null` for a missing/invalid tag → `NullPointerException` on `tagsItem.stream()` for the **whole list** (HTTP 500); `Integer.parseInt` on `site`/`plant`; the page shows the literal `[]` for an empty type via `formatStrings`.
- **Impact:** one malformed configuration row makes the entire page fail to load for everyone viewing that date/site.

### H.14 What the backend returns that the UI never uses
`EnterEditDataModel` includes `uom` (H.7), `id` (config row id — the correct key, H.4) and `timestamp`. The `id`/`plant` fields are ignored by the save; they are the natural basis for the fix (EE-4).

### H.15 Summary table — finding → who is affected → severity → where fixed

| Finding | Affects | Severity | Backend item | Frontend item (deferred) |
|---|---|---|---|---|
| H.1 SQL injection (date, tags) | everyone / data store | High | EE-1 | — |
| H.2 No server-side authorisation | `USER`s, other sites | High | EE-2 | — |
| H.3 Wrong site on multi-site save | any "All" submission | High | EE-3 | FE-1 |
| H.4 Rows identified by first tag name | names with commas / duplicates | Med–High | EE-4 | — |
| H.5 No audit/history | auditors, reported numbers | High | EE-5 | FE-2, FE-10, FE-11 |
| H.6 Non-atomic save, always "success" | all saves | High | EE-6 | FE-7 |
| H.7 Unit hidden | data-entry accuracy | Medium | EE-9 | FE-4 |
| H.8 Cannot enter missing days | repairing gaps | Medium | EE-8 | FE-9 |
| H.9 Submit always enabled; silent errors | usability | Medium | EE-10 | FE-3, FE-7 |
| H.10 Lost edits / stale rows | usability | Medium | — | FE-6 |
| H.11 0 / negative ignored | corrections | Medium | EE-7 | FE-5 |
| H.12 Slow save vs timeout | large submissions | Medium | EE-11 | FE-8 |
| H.13 Fragile parsing | page availability | Low–Med | EE-13 | — |
