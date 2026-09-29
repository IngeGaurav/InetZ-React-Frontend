# Backend & Auth Context (handoff from Angular migration analysis)

> Source: condensed handoff from the Angular/backend session (`inetz-dd`), 2026-09-28.
> Full code-grounded detail (file paths, line numbers, 27-route inventory, controller-to-module mapping): `D:\InetZ\ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md` (one level above this repo, same drive).

## ⚠️ Constraint from the user — read first

The backend's auth will be revamped later. **Until then, build the React auth flow to replicate the CURRENT Angular/backend contract exactly** (below) — not a generic access/refresh-token pattern. The React starter scaffold currently assumes `/auth/login`, `/auth/refresh`, `/auth/me` in `authService.js`, `axios.js` (response interceptor), and `endpoints.js` — **none of these endpoints exist on the real backend.** Don't over-invest in this interim implementation; expect to redo it when the backend auth revamp lands.

## 1. Backend API contracts

Spring Boot 3.3.4, context path `/api/v1` (e.g. `POST http://<host>:8080/api/v1/user/login`). No Swagger/OpenAPI spec — contract reverse-engineered from source.

Auth-relevant endpoints (`UserController`, `@RequestMapping("user")`):
- `POST /user/login` — public. Body `{ userName, password }`. **HTTP status is always 200, even on failure** — real result is in the JSON body's `status` field (200=ok, 401=bad creds, 409=already-logged-in-elsewhere throttle). Success: `ResponseModel{ status, data: { userName, token, id, role } }`. One token only, no refresh token.
- `DELETE /user/logout` — requires Bearer token.
- `POST /user/forgot` — public. Body `{ email }`.
- `POST /user/resetnow` — **requires Bearer token** (unusual for forgot-password, but real contract).
- `GET /user/dtls` — requires Bearer token. Closest thing to "current user" — returns `{ role, userSiteAccessDetails: [{id, access}] }` only (no name/email/userId — those only come back at login).

Other domain controllers (need real endpoint mapping before migrating those features): `DecarbController` (`/general/**`), `EmissionsController` (`/emissions/**`), `EmissionController` (`/database/upload`), `OutPutController` (`/output/**`, 60+ reporting/dashboard endpoints), `TargetSettingController` (`/target/**`), `CustomiseController` (`/customise/**`).

CORS is wide open (`*`) on the backend — no CORS blockers in dev.

## 2. Data models / DTOs

- `User` — single `role` string field (`SUPER_ADMIN`, `ADMIN`, `USER`; `GUEST` is only an Angular-side fallback default, not confirmed as a real backend value).
- No separate Role/Permission entities anywhere (frontend or backend).
- `userSiteAccessDetails` — array of `{ id, access: boolean }`, one per site — resource-scoping list, not a permission grid. Returned in both login response and `/user/dtls`.
- JWT claims are minimal: only `sub` (username), `iat`, `exp` — no role/userId embedded in the token.

## 3. Auth flow

- Token: JWT, HS512, backend-hardcoded secret, **fixed 5-hour expiry, no refresh mechanism at all**. On expiry: clear state, redirect to login.
- Storage (Angular): `sessionStorage`, keys `token`, `rl` (role), `user`, `name`, `permissions`. Tab-scoped. React's current scaffold uses `localStorage` — a divergence; confirm with user before assuming which the interim React implementation should use (Angular's is the source-of-truth behavior per the constraint above).
- Header: `Authorization: Bearer <token>` on every authenticated request.
- Role refresh: Angular polls `GET /user/dtls` every 9 seconds while a token exists, to catch role changes without re-login.
- Inactivity auto-logout: 10-minute timer (click/mousemove/keydown/scroll/touchstart resets it), app-wide, starts on app load even pre-login.
- **Authorization is enforced nowhere server-side** (zero `@PreAuthorize`/`@Secured`/`hasRole`, confirmed by full grep) and only loosely on the Angular frontend: router guard (`AuthGuard`) only checks "is there a token", not role. Real role gating happens ad hoc via `EmissionApiService.isWriteAccess(siteId)` / `.hasDashboardAccess()` / `.hasUserManagemtnAccess()`, plus hardcoded role-filtered arrays in the sidebar and landing-page tile list. A determined user can currently deep-link past a role restriction — worth closing in React (stricter, harmless), but confirm with user since it's a behavior change from current production.
- `ngx-permissions` library and `data.permissions.only` route declarations in Angular are **dead/vestigial** — nothing reads them at runtime. Don't treat as the real mechanism.

## 4. Core business rules / non-obvious logic

- Login's client-side permission derivation (`LoginComponent.getPermissions()`) has a JS bug (`case 'super_admin' || 'SUPER_ADMIN'` always evaluates to the first literal), making most branches dead code — harmless since nothing consults the resulting state. **Don't port this bug forward.**
- Site-level write access: `SUPER_ADMIN` always has write access everywhere; other roles are checked against their individual `userSiteAccessDetails` entry for that site.
- Sidebar menu content is chosen by a JSON file (`dashbaord.json`/`report.json`/`user.json`/`report_single.json` under Angular's `assets/side-menu/`), selected by route + a `sessionStorage['us']` flag, then role-filtered. React doesn't need the JSON-file mechanism, just the resulting role-filtered nav behavior.

## 5. Quirks / gotchas

- **Preserve:** body-status-carries-the-real-result login quirk (HTTP always 200) — naive HTTP-status login handling will silently treat failed logins as success.
- **Preserve (for now, per constraint above):** single-token, no-refresh, 5-hour-expiry session model.
- **Avoid porting:** 3 separate copy-pasted logout implementations in Angular (`InactivityService`, `LandingPageComponent`, `NavBarComponent`) — consolidate into one; React's `useAuth().logout()` already does this correctly.
- **Avoid porting:** dead `login-guard.guard.ts` and unregistered, buggy `interceptor.service.ts` — neither active in Angular.
- **Avoid porting as-is:** Angular's guard redirects to `/login`, a path that isn't itself a defined route (works only via fallthrough to the wildcard route). React should have (and already has) a real `/login` route.
- No dedicated 404 or unauthorized/403 page exists in Angular (wildcard re-renders login). React's scaffold already has a real `NotFoundPage` — keep it; add an `/unauthorized` route once role enforcement is wired up (none currently exists on either side).

## Not yet pulled in

Full 27-route inventory (6 lazy-loaded modules) and the backend controller-to-Angular-module mapping table exist in the full analysis doc referenced at the top of this file — pull into a separate doc on demand when route-by-route migration starts.
