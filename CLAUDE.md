# InetZ React Frontend

## Before working on auth or any backend-calling code

Read `docs/auth-implementation.md` first — it documents what's actually **built** (login/logout,
route protection, storage, the login response-shape quirk, and an explicit list of what's
deliberately NOT implemented yet: no refresh token, no role gating, no inactivity auto-logout,
no role polling). `docs/backend-context.md` is the underlying research doc it was built from
(reverse-engineered from the Angular app + backend source) — read it for the "why", not the
"what's implemented".

The backend auth will be revamped later; until then, match the *current* Angular/backend contract
exactly rather than a generic access/refresh-token pattern — this is a deliberate interim choice,
not an oversight. Don't extend the auth implementation beyond matching that contract (e.g. don't
add refresh-token handling "for later" — there isn't one today).

For full route-level and controller-level detail beyond the condensed handoff, see `D:\InetZ\ANGULAR_TO_REACT_MIGRATION_ANALYSIS.md` (one directory above this repo).

## Design system

**Material UI (`@mui/material`) is the standard component library.** Tailwind CSS (v4, already scaffolded) is kept but is layout-only — utility classes for `flex`/`grid`/`gap-*`/`p-*`/`m-*`/`w-*`/`h-*`. Never use a Tailwind color/border/shadow/typography utility to restyle an MUI component; use the `sx` prop or extend the theme instead. This keeps one visual system instead of two fighting each other.

**Tables use MUI X DataGrid, Community/free edition** (`@mui/x-data-grid`) — not the plain MUI `<Table>`, not a hand-rolled table.

Theme setup:
- `src/theme/tokens.js` — raw design values (color, font, spacing, radius, shadow). Change brand values here first.
- `src/theme/muiTheme.js` — the actual `createTheme()` call (palette/typography/shape/component overrides), consuming `tokens.js`.
- `src/theme/index.js` — barrel export (`import { theme } from '@/theme'`), wired into `ThemeProvider`+`CssBaseline` in `App.jsx`.
- `src/styles/globals.css` — a bounded subset of shadcn's Tailwind-mapped CSS variables were repointed to match the same brand tokens (so `bg-primary` etc. don't drift from MUI); `.dark` and `--sidebar-*` are untouched.
- Fonts: DM Sans Variable (titles/buttons/KPI values) + Noto Sans Variable (body/labels/tables), self-hosted via `@fontsource-variable/*`, imported in `main.jsx`.

Full component coverage (implemented vs. deferred) is tracked in `docs/design-system.md`. The architecture rationale is logged in `docs/decisions.md` (2026-09-28 entry).

**Existing shadcn/Radix components** (`src/components/ui/*`, `src/components/forms/*`) are legacy/superseded — kept, not deleted, but don't extend them for new work; use MUI instead.

## Working across sessions

This project is built up route-by-route across multiple Claude Code sessions. Sessions don't share memory automatically — durable, cross-session context belongs in this file and in `docs/`, not in any one conversation. When you learn something in a session that a future session (on this route or another) would need, write it here or add a doc under `docs/` and link it from this file.
