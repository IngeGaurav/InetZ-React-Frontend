/**
 * Design tokens distilled from docs/design-system.md (iEnerZ Design System v1.0).
 * Single source of truth for color / type / spacing / radius / shadow values —
 * muiTheme.js and src/styles/globals.css both derive from this file. Update here first.
 */

export const color = {
  brand: {
    orange: '#F2A056',
    orangeDeep: '#E08A3C',
    gray: '#666666',
  },
  action: {
    orange: '#F2A056',
    orangeHover: '#E08A3C',
    orangePressed: '#D67C31',
    tint: '#FCEAD5',
    tintBorder: '#F6DEC3',
    tintText: '#B4682A',
    tintHoverBg: '#FBF3E9',
  },
  teal: {
    strong: '#3E938C',
    soft: '#92E3DD',
    light: '#CFF1F0',
    wash: '#EAF6F5',
    text: '#245B57',
    pagination: '#3EA9A0',
  },
  surface: {
    canvas: '#F4F1EC',
    panel: '#F1EDE8',
    card: '#FFFFFF',
    sunken: '#FBFAF8',
    headerBar: '#FAF7F2',
  },
  text: {
    heading: '#2F2F2F',
    bodyStrong: '#363636',
    body: '#4A4A4A',
    control: '#5A554E',
    secondary: '#7C766D',
    caption: '#8A847B',
    faint: '#A5A5A5',
    disabled: '#B8B2A8',
    onBrand: '#FFFFFF',
  },
  border: {
    card: '#ECE5DB',
    soft: '#EFE8DF',
    input: '#E2DACE',
    inputHover: '#CFC7BA',
    divider: '#F5F1EB',
    headerDivider: '#F0EBE3',
  },
  semantic: {
    success: '#34A853',
    successBg: '#E7F5EC',
    successText: '#2E7D5B',
    warning: '#F2A056',
    warningBg: '#FDF3E8',
    warningText: '#B4682A',
    error: '#D9534F',
    errorHover: '#C64641',
    errorBg: '#FBE7E6',
    errorText: '#B23935',
    info: '#3E938C',
    infoBg: '#EAF6F5',
    infoText: '#245B57',
  },
  disabledFill: '#F1ECE4',
  scrim: 'rgba(46,40,34,0.46)',
  focusRing: 'rgba(242,160,86,0.40)',
  closeControl: '#F4F0EA', // icon-button rest bg for the (×) close control in overlays
};

// Fixed per-utility colors (section "11 · Utility colours" — same everywhere, not theme-derived).
export const utility = {
  steam: '#a64c4c',
  fuel: '#ffb732', // Gas / Oil
  electricity: '#b29533',
  coolingWater: '#81BA27',
  hotWater: '#FE6D6D',
  chilledWater: '#5AD1EE',
};

// Equipment/asset operating status — hex (dot/fill), halo (tinted background), text (readable label
// color on the halo), meaning (what the status represents).
export const status = {
  running: {
    hex: '#34A853',
    halo: '#E7F5EC',
    text: '#2E7D5B',
    meaning: 'Equipment actively operating within limits',
  },
  normal: {
    hex: '#3EA9A0',
    halo: '#E4F5F3',
    text: '#2C7C75',
    meaning: 'Reading inside its expected band',
  },
  standby: {
    hex: '#92E3DD',
    halo: '#EAFAF8',
    text: '#2C7C75',
    meaning: 'Ready but not currently producing',
  },
  idle: { hex: '#A5A5A5', halo: '#F0EDE8', text: '#6E6E6E', meaning: 'Powered, no active load' },
  maintenance: {
    hex: '#E8622C',
    halo: '#FCEBE4',
    text: '#B0491F',
    meaning: 'Under planned service / intervention',
  },
  critical: {
    hex: '#D9534F',
    halo: '#FBE7E6',
    text: '#B23935',
    meaning: 'Threshold breach — needs immediate attention',
  },
  shutdown: {
    hex: '#7A4B8F',
    halo: '#F0E9F4',
    text: '#5E3A70',
    meaning: 'Intentionally stopped / offline for work',
  },
  offline: {
    hex: '#6E6E6E',
    halo: '#EEEBE6',
    text: '#565656',
    meaning: 'No signal / not reporting',
  },
};

// Trend/delta rules — which color a change in a metric should render in, based on whether the
// direction is favorable, not just up/down.
export const trend = {
  increaseGood: { text: '#3E938C', bg: '#DDF3F1', arrow: '▲', rule: 'value up + higher is better' },
  decreaseGood: {
    text: '#3E938C',
    bg: '#DDF3F1',
    arrow: '▼',
    rule: 'value down + lower is better',
  },
  increaseBad: { text: '#D98A3A', bg: '#FBEFE1', arrow: '▲', rule: 'value up + lower is better' },
  criticalBreach: { text: '#D9534F', bg: '#FBE7E6', arrow: '▲', rule: 'threshold exceeded' },
  flat: { text: '#8A847B', bg: '#F1ECE4', arrow: '—', rule: '|Δ| below noise floor' },
  positiveChip: { text: '#2E7D5B', bg: '#E7F5EC' }, // e.g. "▲ 8.2%" favorable-change chip
  negativeChip: { text: '#B23935', bg: '#FBE7E6' }, // e.g. "▼ 3.1%" unfavorable-change chip
};

// Visual weight tiers for dashboard content — what should draw the eye first vs. recede.
export const hierarchy = {
  critical: {
    accent: '#D9534F',
    bg: '#FBE7E6',
    desc: 'Must be seen first: breaches, faults, active alarms, primary KPI values.',
  },
  important: {
    accent: '#E08A3C',
    bg: '#FCEAD5',
    desc: 'The main actions & selections: primary buttons, active filters, key highlights.',
  },
  supporting: {
    accent: '#3E938C',
    bg: '#EAF6F5',
    desc: 'Analysis and context: teal widgets, trends, secondary metrics, labels.',
  },
  background: {
    accent: '#B4ADA2',
    bg: '#F4F1EC',
    desc: 'The quiet base: surfaces, borders, dividers, muted captions.',
  },
};

// Per-domain accent/background used to color-code dashboard sections by subject matter
// (source var name: "engineeringUI"). Use to tint a section header, icon, or badge by domain.
export const domain = {
  equipment: {
    accent: '#666666',
    bg: '#FBFAF8',
    note: 'Neutral surface + brand grey — equipment is identity-neutral.',
  },
  energy: {
    accent: '#F2A056',
    bg: '#FDF3E8',
    note: "Brand orange family — energy is the platform's core action theme.",
  },
  utilities: {
    accent: '#3E938C',
    bg: '#EAF6F5',
    note: 'Teal — supporting/analytical utility flows.',
  },
  emissions: {
    accent: '#2E7D5B',
    bg: '#E7F5EC',
    note: 'Green — sustainability & within-limit environmental data.',
  },
  production: {
    accent: '#B4682A',
    bg: '#FCEAD5',
    note: 'Deep orange — output & throughput emphasis.',
  },
  analytics: {
    accent: '#245B57',
    bg: '#CFF1F0',
    note: 'Light-teal — compliance & analytical panels.',
  },
  monitoring: {
    accent: '#D9534F',
    bg: '#FBE7E6',
    note: 'Red — live monitoring & critical attention only.',
  },
};

// Site/Plant/Unit/Asset dashboards each get their own base hue + a 10-step tint ramp
// (index 0 = base, index 9 = near-white), e.g. for level-scoped chart series or accents.
export const dashboardLevel = {
  site: {
    base: '#a66a3f',
    desc: 'Warm copper — Site-level dashboards.',
    tints: [
      '#a66a3f',
      '#ae7852',
      '#b78765',
      '#c09678',
      '#c9a58b',
      '#d2b49f',
      '#dbc3b2',
      '#e4d2c5',
      '#ede1d8',
      '#f6f0eb',
    ],
  },
  plant: {
    base: '#5a544c',
    desc: 'Warm taupe — Plant-level dashboards.',
    tints: [
      '#5a544c',
      '#6a655d',
      '#7a766f',
      '#8b8781',
      '#9c9893',
      '#aca9a5',
      '#bdbab7',
      '#cdcbc9',
      '#dedcdb',
      '#eeeeed',
    ],
  },
  unit: {
    base: '#6b7c6f',
    desc: 'Sage green — Unit-level dashboards.',
    tints: [
      '#6b7c6f',
      '#79897d',
      '#88968b',
      '#97a39a',
      '#a6b0a8',
      '#b5bdb7',
      '#c3cac5',
      '#d2d7d3',
      '#e1e4e2',
      '#f0f1f0',
    ],
  },
  asset: {
    base: '#426c6b',
    desc: 'Teal-green — Asset-level dashboards.',
    tints: [
      '#426c6b',
      '#547a79',
      '#678988',
      '#7a9897',
      '#8da6a6',
      '#a0b5b5',
      '#b3c4c3',
      '#c6d2d2',
      '#d9e1e1',
      '#ecf0f0',
    ],
  },
};

// Structural gradients (header bar, selected-panel wash) and hero/feature gradients (banners,
// FABs, dark export headers).
export const gradient = {
  header: 'linear-gradient(100deg,#ED9850,#F2A056,#F5AE6A)',
  selectedPanel: 'linear-gradient(135deg,#FDF6EE,#FCEAD5)',
  warmHero: 'linear-gradient(120deg,#F2A056,#E4863A)',
  tealHero: 'linear-gradient(120deg,#3EA9A0,#2C7C75)',
  aquaAnalytic: 'linear-gradient(120deg,#92E3DD,#3E938C)',
  sunsetAccent: 'linear-gradient(120deg,#F5AE6A,#EE8F6F)',
  tealToOrange: 'linear-gradient(120deg,#3E938C,#F2A056)', // use sparingly — cross-metric comparison hero only
  deepSlate: 'linear-gradient(135deg,#4A4A4A,#2F2F2F)',
  warmSurface: 'linear-gradient(135deg,#FFFFFF,#FFF6EC)', // subtle warm-tinted surface (vs. the bolder warmHero)
  coolSurface: 'linear-gradient(135deg,#FFFFFF,#F1FBFA)', // subtle teal-tinted surface (vs. the bolder tealHero)
};

// KPI/summary tile background gradients, keyed by what they're for, each with a matching
// "tone" (readable label/value color on that gradient).
export const cardGradient = {
  neutral: {
    css: 'linear-gradient(135deg,#FFFFFF,#F7F3EC)',
    tone: '#6A645B',
    use: 'Total / count tiles',
  },
  warm: {
    css: 'linear-gradient(135deg,#FFF7EF,#FCEAD5)',
    tone: '#B4682A',
    use: 'Alarms / this-month tiles',
  },
  amber: {
    css: 'linear-gradient(135deg,#FFF6EC,#FBE6CC)',
    tone: '#C4762A',
    use: 'Medium severity / watch',
  },
  critical: {
    css: 'linear-gradient(135deg,#FFF6F5,#FBE1DE)',
    tone: '#B23935',
    use: 'High / critical severity',
  },
  teal: {
    css: 'linear-gradient(135deg,#F4FBFA,#DAF2F0)',
    tone: '#2C7C75',
    use: 'Resolved / low / healthy',
  },
  lightTeal: {
    css: 'linear-gradient(135deg,#FFFFFF,#EAF6F5)',
    tone: '#245B57',
    use: 'EnPI / analytics tiles',
  },
  aqua: {
    css: 'linear-gradient(135deg,#F1FBFA,#CFF1F0)',
    tone: '#245B57',
    use: 'Compliance / coverage tiles',
  },
  success: {
    css: 'linear-gradient(135deg,#F5FBF7,#E1F2E7)',
    tone: '#2E7D5B',
    use: 'Within-limit / healthy tiles',
  },
  sand: {
    css: 'linear-gradient(135deg,#FCFAF6,#F1ECE4)',
    tone: '#6A645B',
    use: 'Neutral secondary metrics',
  },
  peach: {
    css: 'linear-gradient(135deg,#FFF8F1,#F9DFC6)',
    tone: '#B4682A',
    use: 'Energy / utility emphasis',
  },
  blush: {
    css: 'linear-gradient(135deg,#FFF7F6,#F7DAD6)',
    tone: '#B23935',
    use: 'Deviation / breach tiles',
  },
  mist: {
    css: 'linear-gradient(135deg,#FAFBFB,#E9F1F0)',
    tone: '#3E938C',
    use: 'Analytical secondary metrics',
  },
};

// Chart-specific surface/gridline/axis/tooltip colors — distinct from the general chartSupport
// section because charts need lighter gridlines than the border scale provides.
export const chart = {
  container: '#FFFFFF',
  gridline: '#F2ECE3',
  axisLine: '#E4DDD2',
  axisLabel: '#8A8A8A',
  tooltipSurface: '#FFFFFF',
  tooltipBorder: '#EFE8DF',
  comparisonHighlight: '#FCEAD5', // baseline/compare band, e.g. SEC vs baseline
  // area/bar fill pairs — deliberately lighter than the semantic success/error hex so large
  // filled regions (CUSUM, deviation charts) stay soft instead of solid-colored.
  positiveFill: { line: '#2E7D5B', fill: '#6DC499' },
  negativeFill: { line: '#B23935', fill: '#F09692' },
};

// Canonical 50–900 neutral/gray ramp (separate from the role-based `text`/`border` groups above —
// this is the raw scale they were derived from; prefer `text`/`border` for UI roles and reach for
// this only when you need a specific step, e.g. a custom neutral chart series).
export const neutral = {
  50: '#FAF8F5',
  100: '#F1ECE4',
  200: '#E4DDD2',
  300: '#CFC7BA',
  400: '#ADA69C',
  500: '#8A847B',
  600: '#666666',
  700: '#4A4A4A',
  800: '#333333',
  900: '#222222',
};

// Color + background per threshold band, for metrics whose "good/watch/bad" color depends on a
// numeric rule (not a fixed status enum like `status` above). Each `ranges` entry has `t` (the
// human-readable rule/label), `c` (text/accent color), `bg` (tinted background).
export const threshold = {
  deviationIndex: {
    ranges: [
      { t: '< 1.00 — On target', c: '#3E938C', bg: '#DDF3F1' },
      { t: '1.00–1.09 — Watch', c: '#D98A3A', bg: '#FBEFE1' },
      { t: '≥ 1.10 — Breach', c: '#D9534F', bg: '#FBE7E6' },
    ],
  },
  seuCompliancePct: {
    ranges: [
      { t: '≥ 85% — Healthy', c: '#3EA9A0', bg: '#E4F5F3' },
      { t: '75–84% — Attention', c: '#F2A056', bg: '#FCEAD5' },
      { t: '< 75% — Non-compliant', c: '#E5766A', bg: '#FBE7E6' },
    ],
  },
  availabilityDot: {
    ranges: [
      { t: 'Available / pass', c: '#34A853', bg: '#E7F5EC' },
      { t: 'Partial', c: '#F2A056', bg: '#FCEAD5' },
      { t: 'Not available / fail', c: '#E5484D', bg: '#FBE7E6' },
    ],
  },
};

// Loaded via @fontsource-variable/dm-sans and @fontsource-variable/noto-sans (see main.jsx).
// DM Sans: titles, KPI values, buttons, chip/pill labels.
// Noto Sans: body text, labels, captions, tables, inputs.
export const fontFamily = {
  display: "'DM Sans Variable', 'DM Sans', sans-serif",
  body: "'Noto Sans Variable', 'Noto Sans', sans-serif",
};

// Dashboard micro-typography roles (source section "Type scale"), each exactly as documented:
// fontSize/weight/letterSpacing/color. This is much denser than a generic h1–h6 marketing scale,
// so muiTheme.js maps the closest role onto each MUI variant, and components needing an exact
// role not covered by a variant (e.g. `tableCellValue`, `pillChipText`) should read it from here
// directly via sx rather than inventing a new size.
// NOTE: the source doc's own `font` field on these entries says 'Inter'/'Noto Sans', but 'Inter'
// is never actually loaded (only DM Sans + Noto Sans @font-face rules exist in the doc) — that
// field is a leftover from an earlier version of the mockup. The authoritative rule is the doc's
// own prose: "DM Sans carries titles, KPI values, and buttons; Noto Sans carries labels,
// captions, and all dense tabular text." `family` below follows that prose, not the `font` field.
export const typeScale = {
  dashboardTitle: {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    color: '#FFFFFF',
    family: 'display',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: '#3E3E3E',
    family: 'display',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: '0',
    color: '#3E3E3E',
    family: 'display',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#2F2F2F',
    family: 'display',
  },
  kpiValueLarge: {
    fontSize: 27,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#2F2F2F',
    family: 'display',
  },
  valueSubFigure: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0',
    color: '#6E6E6E',
    family: 'display',
  },
  valueUnit: {
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: '0',
    color: '#A6A6A6',
    family: 'body',
  },
  cardMicroLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.03em',
    uppercase: true,
    color: '#8A847B',
    family: 'body',
  },
  headerInfoLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.02em',
    uppercase: true,
    color: '#B98A5A',
    family: 'body',
  },
  helperSubtitle: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0',
    color: '#9A9A9A',
    family: 'body',
  },
  captionNote: {
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: '0',
    color: '#A5A5A5',
    family: 'body',
  },
  tableHeader: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: '0.03em',
    uppercase: true,
    color: '#A5A5A5',
    family: 'body',
  },
  tableCellKey: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0',
    color: '#3E3E3E',
    family: 'body',
  },
  tableCellValue: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0',
    color: '#4A4A4A',
    family: 'body',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0',
    color: '#FFFFFF',
    family: 'display',
  },
  pillChipText: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0',
    color: 'context',
    family: 'body',
  },
  trendDelta: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0',
    color: 'context',
    family: 'body',
  },
};

export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40 }; // px, 8px base grid

export const radius = { sm: 6, md: 8, lg: 12, xl: 16, pill: 20 }; // px

export const shadow = {
  base: '0 1px 2px rgba(38,32,26,0.05), 0 1px 3px rgba(120,110,95,0.05)',
  hover: '0 2px 4px rgba(38,32,26,0.06), 0 8px 18px rgba(120,110,95,0.09)',
  focus: `0 0 0 3px ${color.focusRing}`,
  active: '0 1px 2px rgba(38,32,26,0.10) inset',
  selected: '0 0 0 1px #F2A056, 0 2px 8px rgba(242,160,86,0.18)',
  drag: '0 12px 28px rgba(40,30,20,0.18)',
  dropdown: '0 6px 20px rgba(60,50,40,0.12)',
  popover: '0 8px 24px rgba(60,50,40,0.14)',
  tooltip: '0 4px 12px rgba(40,30,20,0.16)',
  modal: '0 24px 60px rgba(40,30,20,0.24)',
  floating: '0 8px 22px rgba(242,160,86,0.28)',
};
