// Design tokens for the Emission Dashboard routes, from the approved "Emission Overview" design
// handoff (C:\Users\gpetkar\Desktop\Dashboard page handof\EmissionOverview.jsx). Per instruction
// the handoff's own hex literals are NOT used: each is mapped to the closest token in src/theme
// (comment shows the handoff value it stood in for). Same role as monthlySummaryTheme.js.
import { componentTokens, tokens } from '@/theme';

const t = componentTokens;

export const C = {
  page: t.shell.mainBg, // #FAF9FE
  card: t.surface.card, // #FFFFFF
  pageText: t.chrome.pageBaseText, // #3A3A3A
  cardBorder: t.border.default, // #ECE5DB
  divider: t.border.divider, // #F0EBE3
  rowLine: t.border.row, // #F5F1EB
  headBg: t.surface.tableHead, // #FAF7F2
  rowHover: t.surface.hoverRow, // #FBF8F3
  ink: t.text.heading, // handoff #2E2A25 — nearest: #2F2F2F
  title: t.text.heading, // #2F2F2F
  body: t.text.body, // handoff #4A453E — nearest: #4A4A4A
  muted: t.text.muted, // handoff #6A645B — nearest: #5A554E
  subtle: t.text.label, // #8A847B
  axisLabel: t.text.helper, // handoff #9A948B — nearest: #9A9A9A
  faint: t.text.faint, // handoff #A5A093 — nearest: #A5A5A5
  dash: t.neutral[300], // handoff #C9C1B5 — nearest: #CFC7BA
  orange: t.brand.orange, // #F2A056
  orangeDeep: t.brand.orangeDeep, // #E08A3C
  copper: t.brand.orangeText, // #B4682A
  tintBg: t.chrome.iconTileBg, // #FBEBD9
  tintBorder: t.tint.orangeBorder, // #F6DEC3
  hoverTint: t.tint.orangeHover, // #FBF3E9
  iconBtnHover: t.chrome.tintIconBorderHover, // handoff #E0A465 — nearest: #F2C999
  teal: tokens.color.teal.strong, // #3E938C
  tealLight: tokens.color.teal.soft, // #92E3DD
  tealDeep: tokens.color.teal.text, // #245B57
  tealText: t.semantic.infoText, // handoff #2C7A74 — nearest: #2C7C75
  tealTint: tokens.color.teal.wash, // handoff #E6F4F1 — nearest: #EAF6F5 (KPI "under target" pill)
  colTint: tokens.color.teal.wash, // handoff #EAF5F2 (selected table column header)
  cellTint: t.status.Standby.bg, // handoff #F3FAF8 — nearest: #EAFAF8 (selected table column cells)
  n200: t.neutral[200], // #E4DDD2
  n300: t.neutral[300], // #CFC7BA
  n400: t.neutral[400], // #ADA69C
  track: t.neutral[100], // #F1ECE4
  grid: tokens.chart.gridline, // handoff #F2EDE6 — nearest: #F2ECE3
  tooltipBorder: tokens.chart.tooltipBorder, // #EFE8DF
  error: t.semantic.error, // #D9534F
  errorText: t.semantic.errorText, // handoff #C2413C — nearest: #B23935
  errorTint: tokens.color.semantic.errorBg, // handoff #FCEAE8 — nearest: #FBE7E6
  neutralTint: t.status.Idle.bg, // handoff #F3EFE9 — nearest: #F0EDE8
  success: tokens.color.semantic.success,
  warning: tokens.color.semantic.warning,
};

// `#RRGGBB` + alpha → rgba(), so translucent fills (target bars, "Target years" band) are derived
// from the theme colour instead of being separate literals.
export const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Series colours: Scope 1 = light teal, Scope 2 = teal, target = orange, baseline = copper.
export const SCOPE_COLORS = { total: C.orange, scope1: C.tealLight, scope2: C.teal };

// Categorical order for pies / contributors / per-site colouring (wraps).
export const CATEGORICAL = [C.teal, C.tealLight, C.orange, C.copper, C.n400, C.tealDeep];

export const noto = t.font.body;
export const dm = t.font.ui;
