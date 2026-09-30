// MUI theme — generated from Design System.dc.html (finalised component CSS), supplied by the
// user as theme.js and adapted here: the internal token object is renamed `componentTokens`
// (this project's own dashboard/data-viz tokens already live in ./tokens.js and are exported
// separately — see src/theme/index.js), and `font.body`/`font.ui` were repointed to the actual
// self-hosted variable font families (`'DM Sans Variable'`/`'Noto Sans Variable'`, loaded via
// @fontsource-variable in main.jsx) — the original plain `'DM Sans'`/`'Noto Sans'` names assumed
// a Google Fonts CDN load this project doesn't use, and would have silently fallen back to the
// browser default sans-serif.
//
// Variant map (design system → MUI):
//   Button   Primary=contained · Secondary=outlined · Ghost=text · Tonal=variant="tonal"
//            On-brand (on header gradient)=variant="onBrand" · Destructive=contained color="error"
//   Chip     Filter=variant="outlined" · Filter selected / removable token=variant="filled" (color primary)
//            Metric badge=variant="metric" (color="secondary" for load-factor) · Count=variant="count" (color="error"|"primary")
//            Status badge=variant="status" + sx={statusChipSx('Running')}
//   Tabs     Underline (default) · Pill=sx={tabsPillSx} · Tabs-with-count: put <Badge variant="tab"> in label
//   Segmented=ToggleButtonGroup (default) · Enclosed=ToggleButtonGroup variant="enclosed"
//   Dialog   Compact=maxWidth="xs" (420) · Default=maxWidth="md" (720) · Wide=maxWidth="lg" (820)
//   Spacing  theme.spacing(n) = n × 4px → space-1…space-10 map 1:1 (spacing(4) = 16px)

import * as React from 'react';
import { createTheme } from '@mui/material/styles';

// ───────────────────────── Tokens ─────────────────────────
export const componentTokens = {
  brand: {
    orange: '#F2A056',
    orangeHover: '#E4863A',
    orangePressed: '#D67C31',
    orangeDeep: '#E08A3C',
    orangeText: '#B4682A',
    gray: '#666666',
    teal: '#92E3DD',
    tealSoft: '#CFF1F0',
  },
  tint: {
    orange: '#FCEAD5',
    orangeSoft: '#FDF3E8',
    orangeHover: '#FBF3E9',
    orangeRow: '#FDF6EE',
    orangeBorder: '#F6DEC3',
  },
  neutral: {
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
  },
  text: {
    heading: '#2F2F2F',
    title: '#3E3E3E',
    body: '#4A4A4A',
    key: '#363636',
    muted: '#5A554E',
    secondary: '#7C766D',
    label: '#8A847B',
    helper: '#9A9A9A',
    faint: '#A5A5A5',
    disabled: '#B8B2A8',
  },
  surface: {
    canvas: '#F4F1EC',
    card: '#FFFFFF',
    sunken: '#FBFAF8',
    tableHead: '#FAF7F2',
    hoverRow: '#FBF8F3',
  },
  border: {
    default: '#ECE5DB',
    control: '#E2DACE',
    controlHover: '#CFC7BA',
    menu: '#EFE8DF',
    row: '#F5F1EB',
    divider: '#F0EBE3',
    chip: '#E9E2D9',
    pager: '#EDE6DC',
    disabled: '#EDE6DC',
    field: '#EDE6DC', // read-only field border (same value as `pager`, named for that use)
    tableDivider: '#E5DDD0', // vertical rule between grouped table columns
  },
  semantic: {
    success: '#34A853',
    successText: '#2E7D5B',
    warning: '#F2A056',
    error: '#D9534F',
    errorHover: '#C64641',
    errorText: '#B23935',
    info: '#3E938C',
    infoText: '#2C7C75',
  },
  status: {
    Running: { dot: '#34A853', bg: '#E7F5EC', text: '#2E7D5B', border: '#CBE9D5' },
    Normal: { dot: '#3EA9A0', bg: '#E4F5F3', text: '#2C7C75', border: '#C9EAE6' },
    Standby: { dot: '#92E3DD', bg: '#EAFAF8', text: '#2C7C75', border: '#CDEFEB' },
    Idle: { dot: '#A5A5A5', bg: '#F0EDE8', text: '#6E6E6E', border: '#E2DDD5' },
    Maintenance: { dot: '#E8622C', bg: '#FCEBE4', text: '#B0491F', border: '#F6D5C6' },
    Critical: { dot: '#D9534F', bg: '#FBE7E6', text: '#B23935', border: '#F3C9C7' },
    Shutdown: { dot: '#7A4B8F', bg: '#F0E9F4', text: '#5E3A70', border: '#E0D2E8' },
    Offline: { dot: '#6E6E6E', bg: '#EEEBE6', text: '#565656', border: '#DDD8D0' },
  },
  trend: { up: { text: '#2E7D5B', bg: '#E7F5EC' }, down: { text: '#B23935', bg: '#FBE7E6' } },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, pill: 20 },
  shadow: {
    base: '0 1px 2px rgba(38,32,26,0.05), 0 1px 3px rgba(120,110,95,0.05)',
    hover: '0 2px 4px rgba(38,32,26,0.06), 0 8px 18px rgba(120,110,95,0.09)',
    focus: '0 0 0 3px rgba(242,160,86,0.40)',
    focusInput: '0 0 0 3px rgba(242,160,86,0.35)',
    active: '0 1px 2px rgba(38,32,26,0.10) inset',
    selected: '0 0 0 1px #F2A056, 0 2px 8px rgba(242,160,86,0.18)',
    drag: '0 12px 28px rgba(40,30,20,0.18)',
    floating: '0 8px 22px rgba(242,160,86,0.28)',
    dropdown: '0 6px 20px rgba(60,50,40,0.12)',
    popover: '0 8px 24px rgba(60,50,40,0.14)',
    tooltip: '0 4px 12px rgba(40,30,20,0.16)',
    modal: '0 24px 60px rgba(40,30,20,0.24)',
    buttonPrimary: '0 2px 6px rgba(242,160,86,0.3)',
    buttonDestructive: '0 2px 6px rgba(217,83,79,0.28)',
  },
  gradient: {
    header: 'linear-gradient(100deg,#ED9850,#F2A056,#F5AE6A)',
    selectedPanel: 'linear-gradient(135deg,#FDF6EE,#FCEAD5)',
    warm: 'linear-gradient(135deg,#FFFFFF,#FFF6EC)',
    cool: 'linear-gradient(135deg,#FFFFFF,#F1FBFA)',
  },
  scrim: 'rgba(46,40,34,0.46)',
  font: {
    body: "'Noto Sans Variable', 'Noto Sans', sans-serif",
    ui: "'DM Sans Variable', 'DM Sans', sans-serif",
  },
  // App shell (topbar + collapsible sidebar) — pixel/color spec taken verbatim from the
  // reference "SideBar and TopBar" mockup. Values not already covered by the tokens above
  // (rail bg reuses brand.gray, header gradient reuses gradient.header, avatar gradient is
  // built from brand.orange/orangeHover) live here as the shell's own extension of the tokens.
  shell: {
    headerHeight: 50,
    railWidth: 165,
    railActiveBg: '#796F63',
    mainBg: '#faf9fe',
  },
  // Extra tones the GHG Report design handoff introduced (2026-09-30) with no existing match
  // above — used by the shared custom-built controls in src/components/common/ (Dropdown,
  // YearPicker, AppTabs, TonalButton, FieldTrigger) plus this report page's own Card/icon tiles.
  // Centralized here (not left as literals in those components) for the same reason every other
  // group in this file is: one place to change a value, one place to check for drift.
  chrome: {
    navBg: '#F7F3EC', // YearPicker prev/next button background
    navBgHover: '#EFE8DD', // YearPicker prev/next button hover background
    navIcon: '#6E6E6E', // YearPicker prev/next chevron color
    iconAccent: '#B08A5E', // muted icon accent (dropdown/year-picker chevron, calendar icon)
    disabledText: '#D5CFC6', // YearPicker: year outside the selectable range
    mutedBadgeText: '#A59F95', // AppSegmentedTabs: unselected pill number badge
    tonalHover: '#F9DDBE', // TonalButton / tinted icon-button hover background
    tintIconBorderHover: '#F2C999', // tinted icon-button hover border
    iconTileBg: '#FBEBD9', // warm icon-tile background (report header icon, Card letter badge)
    cardHeaderBorder: '#F2EEE7', // Card's title-row bottom border
    pageBaseText: '#3A3A3A', // GHG Report page root text color
  },
};

const t = componentTokens;

// ───────────────────────── sx helpers (variants MUI can't express as props) ─────────────────────────
export const statusChipSx = (name) => {
  const s = t.status[name] || t.status.Idle;
  return {
    color: s.text,
    bgcolor: s.bg,
    borderColor: s.border,
    '& .MuiChip-icon': { color: s.dot },
  };
};
// Leading status dot for Chip icon slot: <Chip icon={<StatusDot color="#34A853" />} … />
export const StatusDot = ({ color }) =>
  React.createElement('span', {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: color,
      display: 'inline-block',
      flexShrink: 0,
    },
  });

export const trendChipSx = (dir) => ({
  color: t.trend[dir].text,
  bgcolor: t.trend[dir].bg,
  borderColor: 'transparent',
});

export const tabsPillSx = {
  minHeight: 0,
  borderBottom: 'none',
  '& .MuiTabs-indicator': { display: 'none' },
  '& .MuiTabs-flexContainer': { gap: '8px' },
  '& .MuiTab-root': { fontSize: 12.5, padding: '6px 15px', borderRadius: '20px' },
  '& .MuiTab-root.Mui-selected': { color: t.brand.orangeText, backgroundColor: t.tint.orange },
};

// Modal close (×) icon button
export const closeButtonSx = {
  width: 28,
  height: 28,
  border: 'none',
  borderRadius: '8px',
  color: '#6E6E6E',
  backgroundColor: '#F4F0EA',
  '&:hover': { backgroundColor: '#ECE6DD' },
};

// ───────────────────────── Checkbox / Radio icons (exact DS geometry) ─────────────────────────
const box = (style, child) =>
  React.createElement(
    'span',
    {
      style: Object.assign(
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          boxSizing: 'border-box',
          borderRadius: 5,
          color: '#FFFFFF',
        },
        style
      ),
    },
    child
  );
const tick = React.createElement(
  'svg',
  {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  React.createElement('path', { d: 'M20 6 9 17l-5-5' })
);
const CheckboxIcon = box({ border: '1.5px solid #CFC7BA', background: '#FFFFFF' });
const CheckboxChecked = box({ border: '1.5px solid #F2A056', background: '#F2A056' }, tick);
const CheckboxMixed = box(
  { border: '1.5px solid #F2A056', background: '#F2A056' },
  React.createElement('span', {
    style: { width: 9, height: 2, borderRadius: 1, background: '#FFFFFF' },
  })
);
const ring = (style) =>
  React.createElement('span', {
    style: Object.assign(
      {
        display: 'inline-block',
        width: 18,
        height: 18,
        boxSizing: 'border-box',
        borderRadius: '50%',
        background: '#FFFFFF',
      },
      style
    ),
  });
const RadioIcon = ring({ border: '1.5px solid #CFC7BA' });
const RadioChecked = ring({ border: '5px solid #F2A056' });

// ───────────────────────── Theme ─────────────────────────
const focusRing = { '&.Mui-focusVisible': { boxShadow: t.shadow.focus } };

const shadows = [
  'none',
  t.shadow.base,
  t.shadow.hover,
  t.shadow.dropdown,
  t.shadow.popover,
  t.shadow.tooltip,
  t.shadow.drag,
  t.shadow.floating,
];
while (shadows.length < 25) shadows.push(shadows.length < 16 ? t.shadow.popover : t.shadow.modal);
shadows[8] = t.shadow.dropdown; // Menu / Select / Autocomplete paper
shadows[24] = t.shadow.modal; // Dialog

const theme = createTheme({
  spacing: 4,
  shape: { borderRadius: t.radius.md },
  shadows,
  palette: {
    mode: 'light',
    primary: {
      main: t.brand.orange,
      dark: t.brand.orangeHover,
      light: t.tint.orange,
      contrastText: '#FFFFFF',
    },
    secondary: { main: '#3EA9A0', dark: '#2C7C75', light: '#E4F5F3', contrastText: '#FFFFFF' },
    error: {
      main: t.semantic.error,
      dark: t.semantic.errorHover,
      light: '#FBE7E6',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: t.semantic.warning,
      dark: t.brand.orangeHover,
      light: t.tint.orangeSoft,
      contrastText: '#FFFFFF',
    },
    success: {
      main: t.semantic.success,
      dark: t.semantic.successText,
      light: '#E7F5EC',
      contrastText: '#FFFFFF',
    },
    info: {
      main: t.semantic.info,
      dark: t.semantic.infoText,
      light: '#EAF6F5',
      contrastText: '#FFFFFF',
    },
    grey: t.neutral,
    text: { primary: t.text.title, secondary: t.text.secondary, disabled: t.text.disabled },
    background: { default: t.surface.canvas, paper: t.surface.card },
    divider: t.border.default,
    action: {
      hover: t.tint.orangeHover,
      selected: t.tint.orange,
      disabledBackground: t.neutral[100],
      disabled: t.text.disabled,
      focus: 'rgba(242,160,86,0.40)',
    },
    brand: t.brand,
    status: t.status,
  },

  typography: {
    fontFamily: t.font.body,
    fontSize: 13,
    htmlFontSize: 16,
    // Dashboard type scale
    dashboardTitle: {
      fontFamily: t.font.body,
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: '-0.01em',
      color: '#FFFFFF',
    },
    cardTitle: {
      fontFamily: t.font.body,
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: t.text.title,
    },
    modalTitle: { fontFamily: t.font.body, fontSize: 15, fontWeight: 800, color: t.text.title },
    kpi: {
      fontFamily: t.font.body,
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: t.text.heading,
    },
    kpiLarge: {
      fontFamily: t.font.body,
      fontSize: 27,
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: t.text.heading,
    },
    subFigure: { fontFamily: t.font.body, fontSize: 11, fontWeight: 700, color: '#6E6E6E' },
    unit: { fontFamily: t.font.body, fontSize: 8.5, fontWeight: 600, color: '#A6A6A6' },
    microLabel: {
      fontFamily: t.font.body,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: t.text.label,
    },
    headerInfo: {
      fontFamily: t.font.body,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: '#B98A5A',
    },
    helper: { fontFamily: t.font.body, fontSize: 12, fontWeight: 500, color: t.text.helper },
    note: { fontFamily: t.font.body, fontSize: 10.5, fontWeight: 500, color: t.text.faint },
    tableHeader: {
      fontFamily: t.font.body,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: t.text.faint,
    },
    tableKey: { fontFamily: t.font.body, fontSize: 12.5, fontWeight: 700, color: t.text.key },
    tableValue: { fontFamily: t.font.body, fontSize: 12, fontWeight: 600, color: t.text.body },
    chip: { fontFamily: t.font.body, fontSize: 11, fontWeight: 700 },
    trend: { fontFamily: t.font.body, fontSize: 11, fontWeight: 700 },
    // MUI defaults mapped onto the same scale
    h1: { fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em', color: t.text.heading },
    h2: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: t.text.heading },
    h3: { fontSize: 16, fontWeight: 800, color: t.text.heading },
    h4: { fontSize: 15, fontWeight: 800, color: t.text.title },
    h5: { fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: t.text.title },
    h6: { fontSize: 13, fontWeight: 700, color: t.text.title },
    subtitle1: { fontSize: 12, fontWeight: 500, color: t.text.helper },
    subtitle2: { fontSize: 11, fontWeight: 600, color: t.text.label },
    body1: { fontSize: 13, lineHeight: 1.55, color: t.text.body },
    body2: { fontSize: 12, lineHeight: 1.5, color: t.text.muted },
    caption: { fontSize: 10.5, fontWeight: 500, color: t.text.faint },
    overline: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.03em',
      lineHeight: 1.4,
      color: t.text.label,
    },
    button: { fontFamily: t.font.ui, fontSize: 13, fontWeight: 700, textTransform: 'none' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: t.surface.canvas,
          color: t.text.body,
          fontFamily: t.font.body,
          WebkitFontSmoothing: 'antialiased',
        },
        a: {
          color: t.brand.orangeDeep,
          textDecoration: 'none',
          '&:hover': { color: t.brand.orangeText },
        },
      },
    },

    MuiTypography: {
      defaultProps: {
        variantMapping: {
          dashboardTitle: 'h1',
          cardTitle: 'h3',
          modalTitle: 'h2',
          kpi: 'span',
          kpiLarge: 'span',
          subFigure: 'span',
          unit: 'span',
          microLabel: 'span',
          headerInfo: 'span',
          helper: 'p',
          note: 'span',
          tableHeader: 'span',
          tableKey: 'span',
          tableValue: 'span',
          chip: 'span',
          trend: 'span',
        },
      },
    },

    MuiButtonBase: { defaultProps: { disableRipple: true } },

    // ── Buttons ──
    MuiButton: {
      defaultProps: { disableElevation: true, variant: 'contained', size: 'medium' },
      styleOverrides: {
        root: {
          fontFamily: t.font.ui,
          fontWeight: 700,
          textTransform: 'none',
          borderRadius: t.radius.md,
          minWidth: 0,
          gap: 6,
          transition: 'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
          ...focusRing,
          '&.Mui-disabled': {
            color: t.text.disabled,
            backgroundColor: t.neutral[100],
            borderColor: 'transparent',
            boxShadow: 'none',
            cursor: 'not-allowed',
            pointerEvents: 'auto',
          },
        },
        sizeSmall: { fontSize: 11, lineHeight: '18px', padding: '5px 11px' },
        sizeMedium: { fontSize: 13, lineHeight: '20px', padding: '9px 18px' },
        sizeLarge: { fontSize: 14, lineHeight: '22px', padding: '12px 24px', borderRadius: 10 },
        startIcon: { marginLeft: 0, marginRight: 0, '& > *:nth-of-type(1)': { fontSize: 15 } },
        endIcon: { marginLeft: 0, marginRight: 0, '& > *:nth-of-type(1)': { fontSize: 15 } },
        // Primary
        containedPrimary: {
          color: '#FFFFFF',
          backgroundColor: t.brand.orange,
          boxShadow: t.shadow.buttonPrimary,
          '&:hover': { backgroundColor: t.brand.orangeHover, boxShadow: t.shadow.buttonPrimary },
          '&:active': { backgroundColor: t.brand.orangePressed, transform: 'translateY(1px)' },
          '&.Mui-focusVisible': { boxShadow: t.shadow.focus },
        },
        // Destructive
        containedError: {
          color: '#FFFFFF',
          backgroundColor: t.semantic.error,
          boxShadow: t.shadow.buttonDestructive,
          '&:hover': {
            backgroundColor: t.semantic.errorHover,
            boxShadow: t.shadow.buttonDestructive,
          },
          '&.Mui-focusVisible': { boxShadow: '0 0 0 3px rgba(217,83,79,0.35)' },
        },
        // Secondary
        outlined: {
          color: t.text.muted,
          backgroundColor: '#FFFFFF',
          border: `1px solid ${t.border.control}`,
          '&:hover': { backgroundColor: '#FAF7F2', borderColor: t.border.control },
        },
        outlinedSizeSmall: { padding: '4px 10px' },
        outlinedSizeMedium: { padding: '8px 17px' },
        outlinedSizeLarge: { padding: '11px 23px' },
        // Ghost
        text: {
          color: t.text.secondary,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: '#F4EFE8' },
          '&.Mui-disabled': { backgroundColor: 'transparent' },
        },
      },
      variants: [
        {
          props: { variant: 'tonal' },
          style: {
            color: t.brand.orangeDeep,
            backgroundColor: t.tint.orangeSoft,
            border: `1px solid ${t.tint.orangeBorder}`,
            '&:hover': { backgroundColor: '#FBE9D6' },
            '&.MuiButton-sizeSmall': { padding: '4px 10px' },
            '&.MuiButton-sizeMedium': { padding: '8px 17px' },
            '&.MuiButton-sizeLarge': { padding: '11px 23px' },
          },
        },
        {
          props: { variant: 'onBrand' },
          style: {
            color: '#FFFFFF',
            backgroundColor: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.55)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.26)' },
            '&.Mui-focusVisible': { boxShadow: '0 0 0 3px rgba(255,255,255,0.45)' },
            '&.MuiButton-sizeSmall': { padding: '4px 10px' },
            '&.MuiButton-sizeMedium': { padding: '8px 17px' },
            '&.MuiButton-sizeLarge': { padding: '11px 23px' },
          },
        },
      ],
    },

    // Icon-only button: square, Secondary style by default; color="primary" = filled orange
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 38,
          height: 38,
          padding: 0,
          borderRadius: t.radius.md,
          color: '#6E6E6E',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${t.border.control}`,
          '& .MuiSvgIcon-root': { fontSize: 16 },
          '&:hover': { backgroundColor: '#FAF7F2' },
          ...focusRing,
          '&.Mui-disabled': {
            color: t.text.disabled,
            backgroundColor: t.neutral[100],
            borderColor: 'transparent',
          },
        },
        sizeSmall: { width: 28, height: 28 },
        sizeLarge: { width: 46, height: 46, borderRadius: 10 },
        colorPrimary: {
          color: '#FFFFFF',
          backgroundColor: t.brand.orange,
          border: 'none',
          '&:hover': { backgroundColor: t.brand.orangeHover },
        },
      },
    },

    // ── Form inputs ──
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        fullWidth: true,
        slotProps: { inputLabel: { shrink: true } },
      },
    },
    MuiFormControl: { styleOverrides: { root: { gap: 4 } } },
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          position: 'static',
          transform: 'none',
          fontFamily: t.font.body,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.4,
          color: t.text.label,
          '&.Mui-focused': { color: t.text.label },
          '&.Mui-error': { color: t.text.label },
          '&.Mui-disabled': { color: t.text.label },
        },
        asterisk: { color: t.semantic.error },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: 11,
          fontWeight: 600,
          color: t.text.label,
          '&.Mui-focused': { color: t.text.label },
        },
      },
    },
    MuiOutlinedInput: {
      defaultProps: { notched: false },
      styleOverrides: {
        root: {
          fontFamily: t.font.body,
          fontSize: 12.5,
          fontWeight: 600,
          color: t.text.title,
          backgroundColor: '#FFFFFF',
          borderRadius: t.radius.md,
          transition: 'box-shadow 120ms ease-out',
          '& .MuiOutlinedInput-notchedOutline': {
            top: 0,
            borderColor: t.border.control,
            borderWidth: 1,
            '& legend': { display: 'none' },
          },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.border.controlHover },
          '&.Mui-focused': { boxShadow: t.shadow.focusInput },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: t.brand.orange,
            borderWidth: 1.5,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: t.semantic.error,
            borderWidth: 1.5,
          },
          '&.Mui-error.Mui-focused': { boxShadow: '0 0 0 3px rgba(217,83,79,0.35)' },
          '&.Mui-disabled': {
            backgroundColor: t.neutral[100],
            color: t.text.disabled,
            cursor: 'not-allowed',
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: t.border.disabled },
          '&.Mui-readOnly': { backgroundColor: t.surface.sunken, color: t.text.muted },
          '&.Mui-readOnly .MuiOutlinedInput-notchedOutline': { borderColor: t.border.disabled },
        },
        input: {
          padding: '9px 12px',
          height: 'auto',
          lineHeight: '18px',
          '&::placeholder': { color: t.text.faint, fontWeight: 400, opacity: 1 },
          '&.Mui-disabled': { WebkitTextFillColor: t.text.disabled, cursor: 'not-allowed' },
        },
        inputSizeSmall: { padding: '9px 12px' },
        adornedStart: { paddingLeft: 12 },
        adornedEnd: { paddingRight: 12 },
        inputAdornedStart: { paddingLeft: 0 },
        inputAdornedEnd: { paddingRight: 0 },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: t.text.faint,
          marginRight: 0,
          '& .MuiSvgIcon-root': { fontSize: 15 },
          '& .MuiTypography-root': { fontSize: 11, fontWeight: 600, color: t.text.faint },
        },
        positionStart: { marginRight: 8 },
        positionEnd: { marginLeft: 8 },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: 0,
          fontFamily: t.font.body,
          fontSize: 10.5,
          color: t.text.label,
          '&.Mui-error': { color: t.semantic.error },
        },
      },
    },

    // ── Dropdown & Select ──
    MuiSelect: {
      defaultProps: {
        size: 'small',
        MenuProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          PaperProps: { sx: { mt: '8px' } },
        },
      },
      styleOverrides: {
        select: { fontSize: 12.5, fontWeight: 600, color: t.text.body, minHeight: 'auto' },
        icon: { color: '#B08A5E', right: 10, fontSize: 18 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${t.border.menu}`,
          borderRadius: 10,
          boxShadow: t.shadow.dropdown,
        },
        list: { padding: 5, display: 'flex', flexDirection: 'column', gap: 2 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: t.font.body,
          fontSize: 12,
          fontWeight: 400,
          color: t.text.muted,
          padding: '8px 11px',
          borderRadius: 7,
          minHeight: 'auto',
          gap: 9,
          '&:hover': { backgroundColor: t.tint.orangeHover, color: t.brand.orangeText },
          '&.Mui-selected': {
            fontWeight: 700,
            color: t.brand.orangeText,
            backgroundColor: t.tint.orange,
          },
          '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
            backgroundColor: t.tint.orange,
          },
          '&.Mui-focusVisible': { backgroundColor: t.tint.orangeHover },
          '& .MuiCheckbox-root': { padding: 0 },
        },
      },
    },
    // Multi-select (chips inside field, checkbox rows)
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
        disableCloseOnSelect: true,
        slotProps: { chip: { size: 'small', variant: 'filled', color: 'primary' } },
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { padding: '5px 36px 5px 8px', gap: 5 },
          '& .MuiOutlinedInput-root .MuiAutocomplete-input': { padding: '4px 4px' },
        },
        paper: {
          marginTop: 8,
          border: `1px solid ${t.border.menu}`,
          borderRadius: 10,
          boxShadow: t.shadow.dropdown,
        },
        listbox: {
          padding: 5,
          '& .MuiAutocomplete-option': {
            fontSize: 12,
            color: t.text.muted,
            padding: '7px 10px',
            borderRadius: 7,
            minHeight: 'auto',
            gap: 9,
            '&.Mui-focused': { backgroundColor: t.tint.orangeHover },
            '&[aria-selected="true"]': {
              fontWeight: 700,
              color: t.brand.orangeText,
              backgroundColor: t.tint.orangeRow,
            },
            '&[aria-selected="true"].Mui-focused': { backgroundColor: t.tint.orangeHover },
          },
        },
        tag: { margin: 0 },
        popupIndicator: {
          color: '#B08A5E',
          border: 'none',
          width: 24,
          height: 24,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: 'transparent' },
        },
        clearIndicator: { border: 'none', width: 24, height: 24, backgroundColor: 'transparent' },
        noOptions: { fontSize: 12, color: t.text.faint },
      },
    },

    // ── Selection controls ──
    MuiCheckbox: {
      defaultProps: {
        icon: CheckboxIcon,
        checkedIcon: CheckboxChecked,
        indeterminateIcon: CheckboxMixed,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: 6,
          '&.Mui-focusVisible > span': { boxShadow: t.shadow.focus },
          '&.Mui-disabled > span': {
            background: `${t.neutral[100]} !important`,
            borderColor: `${t.neutral[200]} !important`,
            color: 'transparent',
          },
        },
      },
    },
    MuiRadio: {
      defaultProps: { icon: RadioIcon, checkedIcon: RadioChecked, disableRipple: true },
      styleOverrides: {
        root: {
          padding: 6,
          '&.Mui-focusVisible > span': { boxShadow: t.shadow.focus },
          '&.Mui-disabled > span': {
            background: `${t.neutral[100]} !important`,
            border: `1.5px solid ${t.neutral[200]} !important`,
          },
        },
      },
    },
    MuiSwitch: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: { width: 40, height: 22, padding: 0, overflow: 'visible' },
        switchBase: {
          padding: 2,
          '&.Mui-checked': { transform: 'translateX(18px)', color: '#FFFFFF' },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: t.brand.orange, opacity: 1 },
          '&.Mui-focusVisible + .MuiSwitch-track': { boxShadow: t.shadow.focus },
          '&.Mui-disabled + .MuiSwitch-track': { backgroundColor: t.neutral[200], opacity: 0.7 },
          '&.Mui-disabled .MuiSwitch-thumb': { color: '#FFFFFF' },
        },
        thumb: {
          width: 18,
          height: 18,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        },
        track: {
          borderRadius: 20,
          backgroundColor: '#D8D1C6',
          opacity: 1,
          transition: 'background-color 150ms ease',
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: { marginLeft: -6, gap: 4 },
        label: {
          fontFamily: t.font.body,
          fontSize: 12,
          color: t.text.muted,
          '&.Mui-disabled': { color: t.text.disabled },
        },
      },
    },

    // ── Tabs (underline default) ──
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 0, borderBottom: `1px solid ${t.border.menu}` },
        flexContainer: { gap: 22 },
        indicator: { height: 2, backgroundColor: t.brand.orange },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: 0,
          minHeight: 0,
          padding: '0 0 10px',
          fontFamily: t.font.ui,
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'none',
          color: t.text.label,
          flexDirection: 'row',
          gap: 7,
          '&.Mui-selected': { color: t.brand.orangeDeep, fontWeight: 700 },
          '&:hover': { color: t.brand.orangeDeep },
          '&.Mui-focusVisible': { boxShadow: t.shadow.focus, borderRadius: 4 },
        },
      },
    },

    // ── Segmented control / Enclosed tabs ──
    MuiToggleButtonGroup: {
      defaultProps: { exclusive: true },
      styleOverrides: {
        root: {
          display: 'inline-flex',
          backgroundColor: t.neutral[100],
          borderRadius: 9,
          padding: 3,
          gap: 0,
        },
        grouped: { border: 'none', borderRadius: '7px !important', margin: 0 },
      },
      variants: [
        {
          props: { variant: 'enclosed' },
          style: {
            backgroundColor: t.surface.sunken,
            border: `1px solid ${t.border.menu}`,
            padding: 4,
            gap: 4,
            '& .MuiToggleButton-root': {
              borderRadius: '6px !important',
              padding: '6px 14px',
              border: '1px solid transparent',
            },
            '& .MuiToggleButton-root.Mui-selected': {
              color: t.brand.orangeDeep,
              backgroundColor: '#FFFFFF',
              border: `1px solid ${t.tint.orangeBorder}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            },
          },
        },
      ],
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          fontFamily: t.font.ui,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '18px',
          textTransform: 'none',
          color: t.text.label,
          padding: '6px 16px',
          border: 'none',
          '&:hover': { backgroundColor: 'transparent', color: t.text.body },
          '&.Mui-selected': {
            color: t.text.body,
            fontWeight: 700,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          },
          '&.Mui-selected:hover': { backgroundColor: '#FFFFFF' },
          ...focusRing,
        },
      },
    },

    // ── Chips & badges ──
    MuiChip: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          height: 'auto',
          fontFamily: t.font.body,
          fontSize: 11.5,
          fontWeight: 700,
          lineHeight: '16px',
          borderRadius: t.radius.pill,
          padding: '5px 12px',
          gap: 6,
          border: '1px solid transparent',
          transition: 'background-color 120ms ease',
          '&.Mui-disabled': { opacity: 0.45 },
          '&.Mui-focusVisible': { boxShadow: t.shadow.focus },
        },
        label: { padding: 0 },
        sizeSmall: { fontSize: 11, padding: '2px 8px', gap: 5 },
        icon: { margin: 0, fontSize: 14 },
        deleteIcon: {
          margin: 0,
          fontSize: 14,
          color: '#C79A6A',
          '&:hover': { color: t.brand.orangeText },
        },
        // Filter chip (rest)
        outlined: { color: t.brand.gray, backgroundColor: '#FFFFFF', borderColor: t.border.chip },
        clickable: {
          '&.MuiChip-outlined:hover': {
            color: t.brand.orangeText,
            backgroundColor: t.tint.orangeHover,
            borderColor: '#F3E4D0',
          },
        },
        // Filter selected / removable token
        filled: {
          color: t.brand.orangeText,
          backgroundColor: t.tint.orange,
          borderColor: t.tint.orangeBorder,
          '&.MuiChip-clickable:hover': { backgroundColor: t.tint.orange },
        },
        filledPrimary: {
          color: t.brand.orangeText,
          backgroundColor: t.tint.orange,
          borderColor: t.tint.orangeBorder,
        },
      },
      variants: [
        {
          props: { variant: 'metric' },
          style: {
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: t.radius.sm,
            color: '#245B57',
            backgroundColor: t.brand.tealSoft,
            borderColor: 'transparent',
          },
        },
        {
          props: { variant: 'metric', color: 'secondary' },
          style: {
            borderRadius: t.radius.md,
            color: t.brand.orangeDeep,
            backgroundColor: t.tint.orangeSoft,
            borderColor: t.tint.orangeBorder,
          },
        },
        {
          props: { variant: 'count' },
          style: {
            fontSize: 11,
            padding: '3px 9px',
            color: '#FFFFFF',
            backgroundColor: t.brand.orange,
            borderColor: 'transparent',
          },
        },
        {
          props: { variant: 'count', color: 'error' },
          style: { backgroundColor: t.semantic.error },
        },
        {
          props: { variant: 'status' },
          style: { fontSize: 11.5, padding: '5px 12px', ...statusChipSx('Idle') },
        },
        {
          props: { variant: 'trend' },
          style: {
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: t.radius.sm,
            borderColor: 'transparent',
          },
        },
      ],
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: t.font.body,
          fontSize: 10,
          fontWeight: 700,
          height: 18,
          minWidth: 18,
          padding: '0 5px',
          borderRadius: t.radius.pill,
        },
        colorPrimary: { backgroundColor: t.brand.orange, color: '#FFFFFF' },
        colorError: { backgroundColor: t.semantic.error, color: '#FFFFFF' },
      },
      variants: [
        // Count inside a tab label: <Badge variant="tab" badgeContent={12} color="primary" />
        {
          props: { variant: 'tab' },
          style: {
            '& .MuiBadge-badge': {
              position: 'static',
              transform: 'none',
              height: 'auto',
              minWidth: 0,
              padding: '1px 7px',
              lineHeight: '14px',
            },
          },
        },
      ],
    },

    // ── Cards & surfaces ──
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: t.radius.lg },
        outlined: { borderColor: t.border.default },
        elevation1: { border: `1px solid ${t.border.default}`, boxShadow: t.shadow.base },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: t.surface.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: t.radius.lg,
          boxShadow: t.shadow.base,
          transition: 'box-shadow 180ms ease-out, transform 180ms ease-out',
          '&:has(.MuiCardActionArea-root):hover': {
            boxShadow: t.shadow.hover,
            transform: 'translateY(-2px)',
          },
          '&.Mui-selected': { boxShadow: t.shadow.selected },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: '16px 18px 0' },
        title: { fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: t.text.title },
        subheader: { fontSize: 12, fontWeight: 500, color: t.text.helper, marginTop: 2 },
        action: { margin: 0, alignSelf: 'center' },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: '16px 18px', '&:last-child': { paddingBottom: 16 } } },
    },
    MuiCardActionArea: { styleOverrides: { focusHighlight: { display: 'none' } } },
    MuiDivider: { styleOverrides: { root: { borderColor: t.border.default } } },

    // ── Tables ──
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: `1px solid ${t.border.default}`,
          borderRadius: 14,
          boxShadow: t.shadow.base,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: t.surface.tableHead,
          '& .MuiTableCell-head': {
            fontFamily: t.font.body,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: t.text.faint,
            backgroundColor: t.surface.tableHead,
            borderBottom: `1px solid ${t.border.default}`,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: t.surface.hoverRow },
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: t.tint.orangeRow,
            boxShadow: `inset 3px 0 0 ${t.brand.orange}`,
          },
          '&:last-child .MuiTableCell-body': { borderBottom: 'none' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: t.font.body,
          padding: '12px 18px',
          borderBottom: `1px solid ${t.border.row}`,
        },
        body: {
          fontSize: 12,
          fontWeight: 600,
          color: t.text.body,
          fontVariantNumeric: 'tabular-nums',
          // First column = row key
          '&:first-of-type': { fontSize: 12.5, fontWeight: 700, color: t.text.key },
        },
        sizeSmall: {
          padding: '8px 14px',
          '&.MuiTableCell-body': { fontSize: 11 },
          '&.MuiTableCell-body:first-of-type': { fontSize: 11 },
        },
        stickyHeader: { backgroundColor: t.surface.tableHead },
      },
    },

    // ── Pagination ──
    MuiPagination: {
      defaultProps: { variant: 'outlined', shape: 'rounded' },
      styleOverrides: { ul: { gap: 6 } },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: t.font.body,
          fontSize: 11,
          fontWeight: 700,
          minWidth: 26,
          height: 26,
          margin: 0,
          padding: '0 8px',
          borderRadius: 7,
          color: '#6E6E6E',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${t.border.pager}`,
          '&:hover': { backgroundColor: '#FAF7F2' },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: '#FFFFFF',
            backgroundColor: '#3EA9A0',
            borderColor: '#3EA9A0',
          },
          '&.Mui-disabled': { opacity: 1, color: '#C4BDB2', borderColor: '#EFEAE1' },
          ...focusRing,
        },
        previousNext: { fontWeight: 600, padding: '0 11px' },
        ellipsis: {
          border: 'none',
          backgroundColor: 'transparent',
          color: '#B4ADA2',
          fontWeight: 600,
        },
        icon: { fontSize: 16 },
      },
    },

    // ── Progress (health / SEU bars) ── color: "info"=health teal · "primary"=warning band · "error"=critical band
    MuiLinearProgress: {
      defaultProps: { variant: 'determinate', color: 'info' },
      styleOverrides: {
        root: { height: 8, borderRadius: t.radius.pill, backgroundColor: t.neutral[100] },
        bar: { borderRadius: t.radius.pill },
        colorPrimary: { backgroundColor: t.neutral[100] },
        colorInfo: { backgroundColor: t.neutral[100] },
        colorError: { backgroundColor: t.neutral[100] },
        barColorInfo: { backgroundColor: t.brand.teal },
        barColorPrimary: { backgroundColor: t.brand.orange },
        barColorError: { backgroundColor: '#E5766A' },
      },
    },

    // ── Overlays ──
    MuiTooltip: {
      defaultProps: { arrow: false, enterDelay: 150 },
      styleOverrides: {
        tooltip: {
          fontFamily: t.font.body,
          fontSize: 11,
          fontWeight: 500,
          color: t.text.body,
          backgroundColor: '#FFFFFF',
          border: `1px solid ${t.border.menu}`,
          borderRadius: t.radius.md,
          padding: '6px 10px',
          boxShadow: t.shadow.tooltip,
        },
        arrow: { color: '#FFFFFF', '&::before': { border: `1px solid ${t.border.menu}` } },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `1px solid ${t.border.menu}`,
          borderRadius: 10,
          boxShadow: t.shadow.popover,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: { root: { '&:not(.MuiBackdrop-invisible)': { backgroundColor: t.scrim } } },
    },
    MuiDialog: {
      defaultProps: { maxWidth: 'md', fullWidth: true, scroll: 'paper' },
      styleOverrides: {
        paper: {
          margin: 32,
          borderRadius: t.radius.xl,
          boxShadow: t.shadow.modal,
          border: 'none',
          maxHeight: '88vh',
          maxWidth: '96vw',
        },
        paperWidthXs: { maxWidth: 420 },
        paperWidthSm: { maxWidth: 560 },
        paperWidthMd: { maxWidth: 720 },
        paperWidthLg: { maxWidth: 820 },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontFamily: t.font.body,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.35,
          color: t.text.title,
          padding: '16px 22px',
          borderBottom: `1px solid ${t.border.divider}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '18px 22px',
          fontSize: 12.5,
          color: t.text.muted,
          '.MuiDialogTitle-root + &': { paddingTop: 18 },
        },
        dividers: { borderColor: t.border.divider },
      },
    },
    MuiDialogContentText: {
      styleOverrides: { root: { fontSize: 12.5, lineHeight: 1.55, color: t.text.muted } },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '14px 22px',
          gap: 12,
          borderTop: `1px solid ${t.border.divider}`,
          '& > :not(style) ~ :not(style)': { marginLeft: 0 },
        },
      },
    },

    // ── Accordion (single-open groups inside modals) ──
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${t.border.default}`,
          borderRadius: t.radius.lg,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          '&::before': { display: 'none' },
          '& + &': { marginTop: 8 },
          '&.Mui-expanded': { borderColor: t.tint.orangeBorder },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 0,
          padding: '12px 16px',
          '&.Mui-expanded': { minHeight: 0, backgroundColor: t.surface.tableHead },
          ...focusRing,
        },
        content: {
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: t.text.title,
          '&.Mui-expanded': { margin: 0 },
        },
        expandIconWrapper: { color: '#B08A5E', '&.Mui-expanded': { color: t.brand.orangeDeep } },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: { root: { padding: '0 16px 14px', borderTop: `1px solid ${t.border.row}` } },
    },

    // ── Date picker (only applies if @mui/x-date-pickers is installed) ──
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: `1px solid ${t.border.menu}`,
          boxShadow: '0 10px 30px rgba(40,30,20,0.12)',
        },
      },
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          fontFamily: t.font.body,
          fontSize: 10.5,
          fontWeight: 600,
          color: t.text.body,
          borderRadius: 6,
          '&:hover': { backgroundColor: t.tint.orangeHover },
          '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
            backgroundColor: t.brand.orange,
            color: '#FFFFFF',
            fontWeight: 800,
          },
          '&.MuiPickersDay-today:not(.Mui-selected)': {
            border: `1px solid ${t.tint.orangeBorder}`,
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          fontFamily: t.font.body,
          fontSize: 10,
          fontWeight: 700,
          color: t.text.faint,
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        label: { fontFamily: t.font.body, fontSize: 12, fontWeight: 800, color: t.text.title },
      },
    },
  },
});

export default theme;
