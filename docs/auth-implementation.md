# Auth implementation (interim — matches current Angular/backend contract)

> Research/reverse-engineering source: `docs/backend-context.md` (condensed handoff) and
> `D:\InetZ\ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md`. This doc describes what's actually **built**
> in this React app, as of 2026-09-29, and is kept up to date as the implementation changes.

## ⚠️ This is deliberately a stopgap

The backend's auth will be revamped later (no timeline given). **Do not invest in this beyond
matching the current contract** — no polish, no speculative generalization (e.g. don't add a
refresh-token code path "for later"; there is no refresh token today). When the backend team
ships the new auth, this whole doc gets rewritten and most of the files below get touched.

## What's implemented right now

- **Login** (`/login`) — username + password form, wired to the real backend.
- **Logout** — topbar sign-out icon (`Header.jsx`) and any future call site via `useAuth().logout()`.
- **Route protection** — `ProtectedRoute` gates `/dashboard`, `/report/report`, `/report/monthly-summary`
  behind "is there a valid token", same as Angular's `AuthGuard`.
- **Session persistence** — survives a hard refresh (token + user re-hydrated from `sessionStorage`
  on app load), cleared automatically if the stored token has already expired.
- **401 handling** — any API call that comes back 401 clears the session and forces a re-login.

## What's explicitly NOT implemented (matches current Angular reality, or intentionally deferred)

- **No refresh token** — there isn't one on the backend either. A token simply expires after 5
  hours and the user has to log in again. Don't build a refresh flow speculatively.
- **No role-based UI/route gating** — `ProtectedRoute` only checks "is there a token", exactly
  like Angular's `AuthGuard`. Neither app enforces role server-side (confirmed by
  `docs/backend-context.md` — zero `@PreAuthorize`/`@Secured` on the backend). `selectUserRole`
  / `useAuth().role` / `.hasRole()` / `.hasAnyRole()` exist and work, but nothing calls them yet.
  Wire them up when a route/feature actually needs role gating — don't add it pre-emptively.
- **No inactivity auto-logout.** Angular has a 10-minute idle timer
  (`InactivityService`, reset on click/mousemove/keydown/scroll/touchstart, running app-wide even
  pre-login). Not ported. Add it as its own piece of work if/when the product actually wants it.
- **No role-polling.** Angular polls `GET /user/dtls` every 9 seconds while a token exists, to
  catch role changes without a re-login. Not ported.
- **Forgot Password page** (`ForgotPasswordPage.jsx`) is wired to the real `POST /user/forgot`
  endpoint (works), but its UI is still the old shadcn/CSS-Modules scaffold — not rebuilt in MUI.
  Only the Login page got the MUI treatment (per explicit ask). Do that rebuild in its own pass.
- **No reset-password page/flow.** `POST /user/resetnow` exists on the backend and is registered
  in `endpoints.js` for completeness, but nothing calls it — Angular doesn't surface it either.

## The backend contract (as implemented against)

Base URL: `VITE_API_BASE_URL` (see `.env.development` — currently
`http://192.168.11.62:8083/decarb`, taken verbatim from the Angular app's active
`src/environments/environment.ts`; **no** `/api/v1` prefix on this deployment despite what
`docs/backend-context.md`'s generic example URL suggests — confirm with the backend team before
pointing this at a different environment).

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/user/login` | POST | public | Body `{ userName, password }`. **HTTP status is always 200**, even on bad credentials — see quirk below. |
| `/user/logout` | DELETE | Bearer | Fire-and-forget; client clears local session regardless of the response. |
| `/user/forgot` | POST | public | Body `{ email }`. |
| `/user/resetnow` | POST | Bearer | Registered, unused (see above). |
| `/user/dtls` | GET | Bearer | Returns `{ role, userSiteAccessDetails }` only — **no username/name/email**. Those only ever come back from `/user/login`. Not currently called anywhere in React (no polling — see above). |

### The login response-shape quirk (the one thing you must not get wrong)

`POST /user/login` **always responds HTTP 200**, success or failure. The real result is inside
the JSON body:

```jsonc
// success
{ "status": 200, "data": { "userName": "...", "token": "...", "id": "...", "role": "...", "userSiteAccessDetails": [...] } }
// bad credentials
{ "status": 401, "data": "unauthorised" }
// already logged in elsewhere (throttled)
{ "status": 409, "data": null }
```

Because axios only rejects on a non-2xx *HTTP* status, a naive `.catch()` will never fire for bad
credentials — this always resolves. `useAuth().login()` (`src/hooks/useAuth.js`) checks
`response.status` from the body by hand and throws a plain `Error` for the caller
(`LoginPage.jsx`) to catch and display. Don't "simplify" this into a normal try/catch-on-HTTP-error
pattern — it will silently treat failed logins as successful.

### User shape stored in Redux/sessionStorage

```js
{ userName, id, role, userSiteAccessDetails }
```

No `name`, no `email` — the backend doesn't return either. Anywhere in the UI that wants a
display name uses `user.userName` (e.g. `Sidebar.jsx`'s profile block, `DashboardPage.jsx`'s
greeting). Don't add a fake `email` field — `Sidebar.jsx`'s second profile line shows `user.role`
instead, which is what's actually available.

## Storage strategy

`sessionStorage`, **not** `localStorage` — matches Angular's tab-scoped session model (Angular's
own keys: `token`, `rl`, `user`, `name`, `permissions`). This was a known divergence flagged in
`docs/backend-context.md` and is now resolved in favor of Angular's behavior.

React doesn't fragment the session into five separate keys the way Angular does — `token` is its
own key (named literally `token`, to match Angular's key for easy DevTools cross-checking), and
everything else (`userName`, `id`, `role`, `userSiteAccessDetails`) is one JSON blob under
`auth_user`. See `src/constants/storageKeys.js`.

- `src/utils/storageUtils.js` — `sessionStorage_` wrapper (already existed, unused until now).
- `src/utils/tokenUtils.js` — token get/set/clear + JWT expiry check (no refresh methods — deleted
  along with the rest of the old refresh-token scaffold).
- `src/redux/slices/authSlice.js` — `setCredentials({ user, token })` writes through to
  sessionStorage; `logout()` clears it; rehydrates on app load if the stored token isn't expired.

## Request/response plumbing

- `src/api/axios.js` — request interceptor attaches `Authorization: Bearer <token>` from
  `tokenUtils.getToken()`. Response interceptor: on 401, clears the token and dispatches a
  `window` `auth:logout` event (no refresh-and-retry — there's nothing to refresh with).
  `App.jsx` already listens for `auth:logout` and dispatches the Redux `logout()` action + clears
  the React Query cache — that listener predates this change and needed no edits.
- `src/api/endpoints.js` — `auth.*` now points at the real paths (`/user/login` etc.), not the
  scaffold's invented `/auth/*` paths.
- `src/services/authService.js` — thin wrappers around `api.post`/`api.delete`/`api.get`;
  `login()` deliberately returns the raw body (not further unwrapped) so the caller can inspect
  the `status` field.

## When the backend team upgrades auth

Rewrite this doc alongside the change. At minimum, expect to touch:

1. `src/api/axios.js` — if a refresh token shows up, the response interceptor needs the
   mutex/retry-queue pattern back (the old scaffold had one; git history has it if useful as a
   reference, but re-verify it against whatever the new contract actually is rather than
   restoring it blind).
2. `src/redux/slices/authSlice.js` / `src/utils/tokenUtils.js` — token storage shape, expiry
   handling.
3. `src/api/endpoints.js` / `src/services/authService.js` — endpoint paths + payload shapes if
   they change.
4. `src/hooks/useAuth.js` — the body-status-quirk workaround in `login()` should be deleted once
   the backend returns real HTTP status codes for login failures.
5. This file.
