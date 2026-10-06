// Design tokens for the Monthly GHG Summary page — ported from the approved Claude-design
// handoff (C:\Users\gpetkar\Desktop\report page code\MonthlyGHGSummary.jsx). Every hex was
// cross-checked against src/theme/{muiTheme.js,tokens.js} and mapped to the closest/matching
// existing token — no new tokens were added for this page (unlike the earlier GHG Report pass,
// which added a handful to muiTheme.js's `chrome` section). Only `grid` has no exact match
// anywhere in the theme; it uses the closest existing token (`tokens.chart.gridline`, off by a
// few hex units, imperceptible) rather than a new literal.
//
// Chart *series* colors (the ones actually passed to Highcharts `series[].color`) are listed
// separately below as CHART_COLORS — per instruction, these stay exactly as the design specified
// (not restyled), even though they happen to resolve through the same token references.
import { componentTokens, tokens } from '@/theme';

const t = componentTokens;

export const C = {
  page: t.shell.mainBg, // '#FAF9FE'
  card: t.surface.card, // '#FFFFFF'
  pageText: t.chrome.pageBaseText, // '#3A3A3A' — same token added for the Annual Report page
  border: t.border.divider, // '#F0EBE3' — muiTheme's own `divider` key (not tokens.js's)
  ink: t.text.heading, // '#2F2F2F'
  title: t.text.title, // '#3E3E3E'
  body: t.text.body, // '#4A4A4A'
  muted: t.brand.gray, // '#666666'
  subtle: t.text.label, // '#8A847B'
  faint: t.text.faint, // '#A5A5A5'
  orange: t.brand.orange, // '#F2A056'
  orangeDeep: t.brand.orangeDeep, // '#E08A3C'
  tintBg: t.chrome.iconTileBg, // '#FBEBD9'
  tintBorder: t.tint.orangeBorder, // '#F6DEC3'
  hoverTint: t.tint.orangeHover, // '#FBF3E9'
  teal: tokens.color.teal.strong, // '#3E938C'
  tealLight: tokens.color.teal.soft, // '#92E3DD'
  tealDeep: tokens.color.teal.text, // '#245B57'
  copper: t.brand.orangeText, // '#B4682A'
  n200: t.neutral[200], // '#E4DDD2'
  n300: t.neutral[300], // '#CFC7BA'
  n400: t.neutral[400], // '#ADA69C'
  grid: tokens.chart.gridline, // closest match — design '#F4EFE8' vs token '#F2ECE3'; same role (chart gridline), no exact hex in the theme
  success: tokens.color.semantic.successText, // '#2E7D5B'
  error: t.semantic.error, // '#D9534F'
  errorHalo: tokens.color.semantic.errorBg, // '#FBE7E6'
};

// Chart series colors only — kept as literal aliases of the design's own values (not restyled;
// see docs/MONTHLY_SUMMARY_ANALYSIS.md "Deliberate deviations" for why this stays as-is for now).
export const CHART_COLORS = {
  prev: C.tealLight,
  curr: C.orange,
  intensityAxis: C.tealDeep,
  categorical: [C.tealLight, C.teal, C.orange, C.copper, C.n400],
};

export const noto = t.font.body;
export const dm = t.font.ui;
