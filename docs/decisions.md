# Architecture decisions

Dated log of decisions that future sessions need to know about but that don't belong in code comments. Newest first.

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
