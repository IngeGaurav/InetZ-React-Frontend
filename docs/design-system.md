# Design System (iEnerZ v1.0) — implementation reference

> Source: the "Design System.html" mockup the user provided (2026-09-28), an interactive
> reference covering colors, typography, spacing, shadows, icons, and full component specs.
> This doc records how that mockup maps into code, not the mockup's content verbatim —
> for exact pixel/state detail not covered below, the original HTML is the source of truth
> (ask the user for it again if needed; it wasn't saved into the repo).

## Where this lives in code

- `src/theme/tokens.js` — single source of truth for raw values (color, fontFamily, spacing, radius, shadow). Change brand values here first.
- `src/theme/muiTheme.js` — MUI `createTheme()` call consuming `tokens.js`; defines `palette`, `typography`, `shape`, and per-component `styleOverrides`/`variants`.
- `src/theme/index.js` — barrel export (`theme`, `tokens`).
- `src/styles/globals.css` — a bounded subset of shadcn's Tailwind-mapped CSS variables (`--primary`, `--background`, etc.) were repointed to HSL equivalents of the same brand tokens, so Tailwind's `bg-primary`/`bg-accent`/etc. utility classes don't visually drift from MUI. `.dark` and `--sidebar-*` were deliberately left untouched (out of scope — see CLAUDE.md).

## Fonts

- **DM Sans Variable** (`@fontsource-variable/dm-sans`) — titles/headings, KPI values, buttons, chip/pill labels. `tokens.fontFamily.display`.
- **Noto Sans Variable** (`@fontsource-variable/noto-sans`) — body text, labels, captions, tables, inputs. `tokens.fontFamily.body`.
- Self-hosted (not Google Fonts CDN links) for offline reliability. Imported once in `src/main.jsx`.
- **Known inconsistency in the source doc, resolved:** the mockup's own `typeScale` data table labels most roles `font: 'Inter'` or `font: 'Noto Sans'` — but only **DM Sans** and **Noto Sans** actually have `@font-face` rules in the document (`Inter` is never loaded, confirmed by inspecting all 42 `@font-face` blocks). The doc's own prose is unambiguous and was treated as authoritative instead: *"DM Sans carries titles, KPI values, and buttons; Noto Sans carries labels, captions, and all dense tabular text."* — and that's what `tokens.fontFamily`/`muiTheme.js` implement. Don't "fix" this back to match the `typeScale.font` field if re-reading the source doc; the field is leftover from an earlier draft.

## Type scale (dashboard density, not marketing h1–h6)

The doc defines a dense, dashboard-specific type scale (`tokens.js` → `typeScale`), e.g. `kpiValueLarge` 27px/800, `sectionTitle` 15px/700, `tableCellValue` 11px/600, `tableHeader` 8.5px/700 uppercase. `muiTheme.js`'s `typography.h1`–`h6`/`body1`/`body2`/`caption`/`overline`/`button` map onto the closest-fitting doc role (see comments in that file). Roles with no direct MUI variant slot (`valueUnit`, `pillChipText`, `trendDelta`, `headerInfoLabel`) should be read from `tokens.typeScale` directly via the `sx` prop when building the composed component that needs them, rather than inventing a new size.

## Color system

See `tokens.js` for exact hex values. Core UI groups: `brand` (orange family), `action` (button/interactive states: default/hover/pressed/tint), `teal` (secondary/analytical accent, also used for pagination active state — not brand orange), `surface` (canvas/panel/card/sunken/headerBar elevation levels), `text` (heading→disabled ramp), `border` (card/soft/input/divider ramp), `semantic` (success/warning/error/info, each with a `Bg`/`Text` pair for tinted alert/chip/badge styles), `closeControl` (icon-button rest bg for overlay × buttons).

**Dashboard/data-visualization groups** (added after an initial pass missed them — these are per-instance content colors, not global MUI component styles, so they're exposed as data from `tokens.js` for composed components to consume via `sx`, not baked into `muiTheme.js` overrides):

- `utility` — fixed color per utility type, same everywhere: Steam `#a64c4c`, Fuel (Gas/Oil) `#ffb732`, Electricity `#b29533`, Cooling Water `#81BA27`, Hot Water `#FE6D6D`, Chilled Water `#5AD1EE`. *(Manager sign-off on these specific values is still pending per the source doc's own note — flag if asked to finalize a utility-tag-chip component.)*
- `status` — 8 equipment states (`running`/`normal`/`standby`/`idle`/`maintenance`/`critical`/`shutdown`/`offline`), each with `hex` (dot/fill), `halo` (tinted bg), `text` (readable label color on the halo), and `meaning` (description) — for status pills/badges.
- `trend` — which color a metric's change renders in, keyed by whether the *direction* is favorable (not just up/down): `increaseGood`/`decreaseGood`/`increaseBad`/`criticalBreach`/`flat`, plus shorthand `positiveChip`/`negativeChip` for simple ▲/▼ delta chips.
- `hierarchy` — the 4 visual-weight tiers for dashboard content: `critical` (breaches/alarms) → `important` (primary actions) → `supporting` (analysis/context) → `background` (quiet base). This is the "dashboard hierarchy" ramp — use it to decide how loud an element should be, independent of semantic meaning.
- `domain` — per-subject-matter accent+bg used to color-code a dashboard section: `equipment`/`energy`/`utilities`/`emissions`/`production`/`analytics`/`monitoring`, each with a `note` explaining the color choice.
- `dashboardLevel` — `site`/`plant`/`unit`/`asset`, each with a `base` hue and a 10-step `tints` ramp (index 0 = base, index 9 = near-white) for level-scoped chart series or accents.
- `gradient` — structural gradients: `header` (the one hero gradient, dashboard header bar), `selectedPanel`; plus hero/feature gradients (`warmHero`, `tealHero`, `aquaAnalytic`, `sunsetAccent`, `tealToOrange` — use sparingly, cross-metric only, `deepSlate` — dark/export contexts).
- `cardGradient` — 12 KPI/summary-tile background gradients keyed by purpose (`neutral`, `warm`, `amber`, `critical`, `teal`, `lightTeal`, `aqua`, `success`, `sand`, `peach`, `blush`, `mist`), each with a matching `tone` (readable text color on that gradient) and `use`.
- `chart` — chart-specific surface/gridline/axis/tooltip colors (lighter gridlines than the general border scale provides): `container`, `gridline`, `axisLine`, `axisLabel`, `tooltipSurface`, `tooltipBorder`, `comparisonHighlight`, plus `positiveFill`/`negativeFill` (line+fill color pairs for CUSUM/deviation area charts — deliberately lighter than the semantic success/error hex so large filled regions stay soft).
- `neutral` — the raw 50–900 gray ramp that `text`/`border` were derived from. Prefer `text`/`border` for UI roles; reach for this only when you need a specific numbered step (e.g. a neutral chart series).
- `threshold` — color+bg per numeric threshold band for metrics whose "good/watch/bad" color depends on a rule rather than a fixed status enum: `deviationIndex`, `seuCompliancePct`, `availabilityDot`, each with a `ranges` array of `{ t: label, c: color, bg: tinted background }`.

When building a KPI tile, status pill, trend chip, or domain-tinted section header, pull from these token groups via `import { tokens } from '@/theme'` rather than hand-picking a hex value — that's the whole point of having them centralized.

## Component coverage — implemented now vs. deferred

Scoped to the highest-value, most-reused primitives first rather than transcribing every documented state in one pass. Build deferred items as composed patterns (using the primitives below) when the route that needs them is actually developed — don't pre-build them speculatively.

**Implemented in `muiTheme.js`** (as of the 2026-09-29 rewrite — see `docs/decisions.md`):
- Button — `contained`/`outlined`/`text` + custom `variants`: `tonal`, `onBrand`. Sizes match the doc's 28/38/46px heights.
- IconButton — square, bordered secondary style by default; `color="primary"` = filled orange.
- Inputs — `MuiOutlinedInput`, `MuiInputLabel`, `MuiFormHelperText`, `MuiInputAdornment`. `MuiTextField` defaults to `variant="outlined" size="small" fullWidth`.
- Select/Menu/Autocomplete — `MuiSelect`, `MuiMenu`, `MuiMenuItem`, `MuiAutocomplete` (multi-select with checkbox rows + filled chips).
- Selection controls — Checkbox/Radio use **custom SVG tick/ring icons** (not MUI's defaults) matching the doc's exact geometry; Switch is brand-colored.
- Tabs — underline (default) **and** pill variant (`sx={tabsPillSx}`).
- Toggle buttons — `ToggleButtonGroup`/`ToggleButton`, default = segmented, `variant="enclosed"` = enclosed tabs.
- Chip — outlined/filled + custom `variants`: `metric` (teal, or orange via `color="secondary"`), `count` (orange or `color="error"`), `status` (`sx={statusChipSx('Running')}`, one entry per equipment status), `trend` (`sx={trendChipSx('up'|'down')}`).
- Badge — default + `variant="tab"` (static count pill for use inside a tab label).
- Card/CardHeader/CardContent/CardActionArea — hover-lift only when wrapped in `CardActionArea`; `.Mui-selected` gets the selected-shadow keyline.
- Accordion/AccordionSummary/AccordionDetails — single-open group pattern for modals.
- LinearProgress — `color="info"` (health/teal), `color="primary"` (warning band), `color="error"` (critical band).
- Dialog / Backdrop / Alert / Tooltip / Popover.
- Pagination — active state uses teal (`#3EA9A0`), not brand orange, per the doc.
- Table (plain MUI `<Table>`) — light-touch header/cell/row styling.
- DataGrid (MUI X Community) — header/cell/row/border styling matching the Table anatomy spec; this is the **standard table component** going forward, not `<Table>`.
- Full 25-slot elevation `shadows` array wired into `createTheme`, plus sx helpers for variants MUI can't express as props: `statusChipSx(name)`, `StatusDot`, `trendChipSx(dir)`, `tabsPillSx`, `closeButtonSx`. Import these from `@/theme` alongside `theme`.

**Deferred:**
- Date picker (`MuiPickersPopper`/`MuiPickersDay`/`MuiDayCalendar`/`MuiPickersCalendarHeader` overrides exist in the theme, ready to go, but `@mui/x-date-pickers` itself isn't installed — add it when a route actually needs a date picker).
- Feedback/overlay "Planned" components: skeleton loader, stepper, timeline, drawer content, toast/snackbar composition beyond MUI's base `Alert`.
- KPI-card composed patterns using `cardGradient` — compositions of Card + Typography + the `cardGradient` token group, not new theme entries; build where first needed under `src/components/`, then note it here.
- Figma export values (x/y/blur/spread per shadow tier) — present in the source doc for designer handoff, not needed for the CSS implementation (the `box-shadow` strings in `tokens.js`/`componentTokens.shadow` are the actual values, already exact).

When you build one of the deferred items, move it from this list into "Implemented" and note which file the reusable component lives in.

## Icons

The mockup's full custom icon set (76 icons across 8 groups: Site hierarchy, Navigation & shell, Actions, Arrows & chevrons, Data & charts, Status & alerts, Process & industrial, Files & misc) ships as **individual tree-shakeable React components**, not static SVG files and not a data-driven generic `<Icon name="..." />` renderer:

- `src/components/icons/icons.jsx` — the 76 components, one named export each (`SiteIcon`, `DownloadIcon`, `AlertTriangleIcon`, ...), built via a shared `createIcon()` factory. Import only what a route actually uses — unused icons are dropped from that route's bundle by the bundler, which is the whole point of this over the earlier static-file/data-object approaches (see `docs/decisions.md`, 2026-09-29 entries, for why those were replaced).
- `src/components/icons/iconRegistry.js` — grouping/usage metadata (`iconGroups`, `iconCount`) for the **"/" theme-preview page only**. It necessarily imports all 76 components to build the "show everything" grid, so don't import this file from real feature code — import icon components directly from `./icons` (or the barrel) instead, or this registry's blanket import defeats the tree-shaking the split exists for.
- `src/components/icons/index.js` — barrel: `export * from './icons'`. `import { SiteIcon, DownloadIcon } from '@/components/icons'`.

Usage:
```jsx
<SiteIcon />                        // bare 20px glyph, color = currentColor
<SiteIcon size={16} color="#E08A3C" />
<SiteIcon theme="light" />          // 34×34 tile: bg #FCEAD5, icon #E08A3C
<SiteIcon theme="dark" />           // 34×34 tile: bg #F2A056, icon #FFFFFF
```
Stroke icons use the doc's exact recipe (24×24 viewBox, `fill="none"`, `stroke="currentColor"`, 1.9px, round caps/joins). One icon (`AssetIcon`, the compass/gear glyph for asset-level nav) is filled instead of stroked, 48×48 viewBox — handled automatically by `createIcon`'s `filled` flag.

This custom set is for domain/nav iconography that matches the mockup exactly (equipment, utilities, site hierarchy, status, etc.). `@mui/icons-material` is still fine for generic MUI-component-adjacent icons (e.g. a Dialog's close button) where pixel-matching the mockup doesn't matter. Don't duplicate an icon that already exists here by pulling the equivalent from `lucide-react`/`@mui/icons-material` instead — prefer the custom one so usage stays consistent with the mockup.

All 76 icons are rendered on the `/` showcase route (`src/pages/ThemePreview.jsx`, via `iconRegistry.js`) for a visual check against the mockup.

## Conventions (see also CLAUDE.md)

- MUI is the standard component library. Tailwind is layout-only (`flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`) — never use a Tailwind color/border/shadow/typography utility on an MUI component; extend `muiTheme.js` or use the `sx` prop instead.
- MUI X DataGrid (`@mui/x-data-grid`, Community/free edition) is the standard table component for all routes.
- Existing shadcn/Radix components under `src/components/ui/*` and `src/components/forms/*` are legacy/superseded — kept for now, not deleted, but new work should use MUI instead of extending them.
