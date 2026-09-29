import { createTheme } from '@mui/material/styles';
import { color, fontFamily, radius, shadow } from './tokens';

/**
 * The MUI theme is the single styling system for components (per CLAUDE.md).
 * Tailwind utilities are layout-only (flex/grid/gap/p-/m-/w-/h-) — never reach for
 * a Tailwind color/border/shadow utility on an MUI component; use `sx` or extend
 * this file instead, so every route stays visually identical without re-deriving it.
 *
 * Component coverage in this pass: Button, TextField/Select inputs, Chip, Checkbox,
 * Radio, Switch, Tabs (underline variant), Dialog, Alert, Pagination, Table, DataGrid.
 * Anything not covered here (date-range popover, toast, status pills, trend chips,
 * modal-with-footer patterns, pill/segmented/enclosed tab variants) is documented in
 * docs/design-system.md as a composed pattern to build with these primitives when
 * that route needs it — see that file before inventing new styling for them.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: color.action.orange,
      dark: color.action.orangeHover,
      light: color.action.tint,
      contrastText: color.text.onBrand,
    },
    secondary: {
      main: color.teal.strong,
      dark: color.teal.text,
      light: color.teal.soft,
      contrastText: color.text.onBrand,
    },
    error: {
      main: color.semantic.error,
      dark: color.semantic.errorHover,
      light: color.semantic.errorBg,
      contrastText: color.text.onBrand,
    },
    warning: {
      main: color.semantic.warning,
      light: color.semantic.warningBg,
      dark: color.action.orangeHover,
      contrastText: color.text.onBrand,
    },
    success: {
      main: color.semantic.success,
      light: color.semantic.successBg,
      dark: color.semantic.successText,
      contrastText: color.text.onBrand,
    },
    info: {
      main: color.semantic.info,
      light: color.semantic.infoBg,
      dark: color.teal.text,
      contrastText: color.text.onBrand,
    },
    text: {
      primary: color.text.bodyStrong,
      secondary: color.text.secondary,
      disabled: color.text.disabled,
    },
    divider: color.border.card,
    background: {
      default: color.surface.canvas,
      paper: color.surface.card,
    },
    action: {
      hover: color.action.tintHoverBg,
      selected: color.action.tint,
      disabled: color.text.disabled,
      disabledBackground: color.disabledFill,
      focus: color.focusRing,
    },
  },

  shape: {
    borderRadius: radius.md,
  },

  // Sizes/weights below are pulled directly from the doc's "Type scale" section (typeScale array:
  // dashboardTitle/sectionTitle/kpiValue.../tableCellValue etc — see tokens.js `typeScale` for the
  // exact named roles). This is a dense dashboard-admin scale, not a marketing h1–h6 scale, so the
  // MUI variants below map onto the closest-fitting doc role rather than an invented generic ramp.
  typography: {
    fontFamily: fontFamily.body,
    h1: {
      fontFamily: fontFamily.display,
      fontWeight: 800,
      fontSize: '27px',
      letterSpacing: '-0.02em',
    }, // KPI Value · Large
    h2: {
      fontFamily: fontFamily.display,
      fontWeight: 800,
      fontSize: '16px',
      letterSpacing: '-0.02em',
    }, // KPI Value
    h3: {
      fontFamily: fontFamily.display,
      fontWeight: 700,
      fontSize: '15px',
      letterSpacing: '-0.01em',
    }, // Section / Card Title
    h4: { fontFamily: fontFamily.display, fontWeight: 700, fontSize: '13px', letterSpacing: 0 },
    h5: { fontFamily: fontFamily.display, fontWeight: 700, fontSize: '12px', letterSpacing: 0 },
    h6: { fontFamily: fontFamily.display, fontWeight: 700, fontSize: '11px', letterSpacing: 0 },
    subtitle1: { fontFamily: fontFamily.body, fontSize: '12px', fontWeight: 500, color: '#9A9A9A' }, // Helper / Subtitle
    subtitle2: { fontFamily: fontFamily.body, fontSize: '11px', fontWeight: 700, color: '#6E6E6E' }, // Value Sub-figure
    body1: {
      fontFamily: fontFamily.body,
      fontSize: '11px',
      fontWeight: 600,
      color: color.text.body,
    }, // Table Cell · Value
    body2: {
      fontFamily: fontFamily.body,
      fontSize: '10.5px',
      fontWeight: 500,
      color: color.text.faint,
    }, // Caption / Note
    caption: {
      fontFamily: fontFamily.body,
      fontSize: '10px',
      fontWeight: 700,
      color: color.text.caption,
      letterSpacing: '0.03em',
    }, // Card Micro-label
    overline: {
      fontFamily: fontFamily.body,
      fontSize: '8.5px',
      fontWeight: 700,
      letterSpacing: '0.03em',
      color: color.text.faint,
      textTransform: 'uppercase',
    }, // Table Header
    button: {
      fontFamily: fontFamily.display,
      fontWeight: 700,
      fontSize: '13px',
      textTransform: 'none',
      letterSpacing: 0,
    }, // Button Text
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: color.surface.canvas },
      },
    },

    // ---- Button ---------------------------------------------------------
    MuiButtonBase: {
      defaultProps: { disableRipple: false },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          '&:focus-visible': { boxShadow: shadow.focus },
        },
        sizeSmall: { fontSize: '0.6875rem', padding: '5px 11px', height: 28 },
        sizeMedium: { fontSize: '0.8125rem', padding: '9px 18px', height: 38 },
        sizeLarge: {
          fontSize: '0.875rem',
          padding: '12px 24px',
          height: 46,
          borderRadius: radius.lg,
        },
        containedPrimary: {
          boxShadow: '0 2px 6px rgba(242,160,86,0.3)',
          '&:hover': { backgroundColor: color.action.orangeHover },
          '&:active': { backgroundColor: color.action.orangePressed },
          '&.Mui-disabled': { backgroundColor: color.disabledFill, color: color.text.disabled },
        },
        containedError: {
          boxShadow: '0 2px 6px rgba(217,83,79,0.28)',
          '&:hover': { backgroundColor: color.semantic.errorHover },
        },
        outlined: {
          color: color.text.control,
          borderColor: color.border.input,
          backgroundColor: color.surface.card,
          '&:hover': { backgroundColor: color.surface.headerBar, borderColor: color.border.input },
        },
        text: {
          color: color.text.secondary,
          '&:hover': { backgroundColor: '#F4EFE8' },
        },
      },
      variants: [
        {
          props: { variant: 'tonal' },
          style: {
            color: color.action.orangeHover,
            backgroundColor: color.semantic.warningBg,
            border: `1px solid ${color.action.tintBorder}`,
            '&:hover': { backgroundColor: '#FBE9D6' },
          },
        },
        {
          props: { variant: 'onBrand' },
          style: {
            color: color.text.onBrand,
            backgroundColor: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.55)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.26)' },
          },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          '&:focus-visible': { boxShadow: shadow.focus },
        },
      },
    },

    // ---- Inputs (TextField / Select) ------------------------------------
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: color.text.caption,
          '&.Mui-focused': { color: color.action.orange },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: color.surface.card,
          fontSize: '0.78125rem',
          fontWeight: 600,
          color: color.text.bodyStrong,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: color.border.input },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: color.border.inputHover },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: color.action.orange,
            borderWidth: 1.5,
          },
          '&.Mui-focused': { boxShadow: shadow.focus },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: color.semantic.error },
          '&.Mui-disabled': {
            backgroundColor: color.disabledFill,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#EDE6DC' },
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.65625rem',
          marginLeft: 0,
          '&.Mui-error': { color: color.semantic.error },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: radius.lg,
          border: `1px solid ${color.border.soft}`,
          boxShadow: shadow.dropdown,
        },
        list: { padding: 5 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          color: color.text.control,
          borderRadius: radius.sm + 1,
          '&:hover': { backgroundColor: color.action.tintHoverBg, color: color.action.tintText },
          '&.Mui-selected': {
            backgroundColor: color.action.tint,
            color: color.action.tintText,
            fontWeight: 700,
          },
          '&.Mui-selected:hover': { backgroundColor: color.action.tint },
        },
      },
    },

    // ---- Selection controls ---------------------------------------------
    MuiCheckbox: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        root: {
          color: color.border.inputHover,
          '&.Mui-disabled': { color: color.disabledFill },
        },
      },
    },
    MuiRadio: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        root: {
          color: color.border.inputHover,
          '&.Mui-disabled': { color: color.disabledFill },
        },
      },
    },
    MuiSwitch: {
      defaultProps: { color: 'primary' },
      styleOverrides: {
        track: { backgroundColor: '#D8D1C6', opacity: 1 },
        thumb: { boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },
      },
    },

    // ---- Tabs (underline variant — see docs/design-system.md for the rest) ----
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 40, borderBottom: `1px solid ${color.border.soft}` },
        indicator: { backgroundColor: color.action.orange, height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: fontFamily.display,
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'none',
          color: color.text.caption,
          minHeight: 40,
          '&.Mui-selected': { color: color.action.orangeHover, fontWeight: 700 },
        },
      },
    },

    // ---- Chip -------------------------------------------------------------
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: fontFamily.body,
          fontSize: '0.71875rem',
          fontWeight: 700,
          borderRadius: radius.pill,
        },
        outlined: {
          backgroundColor: color.surface.card,
          borderColor: '#E9E2D9',
          color: color.text.body,
        },
        filledPrimary: { backgroundColor: color.action.tint, color: color.action.tintText },
        filledSecondary: { backgroundColor: color.teal.light, color: color.teal.text },
        filledError: { backgroundColor: color.semantic.errorBg, color: color.semantic.errorText },
        filledWarning: {
          backgroundColor: color.semantic.warningBg,
          color: color.semantic.warningText,
        },
        filledSuccess: {
          backgroundColor: color.semantic.successBg,
          color: color.semantic.successText,
        },
        deleteIcon: { color: 'inherit', opacity: 0.55, '&:hover': { opacity: 0.85 } },
      },
    },

    // ---- Overlays: Dialog / Backdrop / Alert -------------------------------
    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: color.scrim },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radius.xl, boxShadow: shadow.modal },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: fontFamily.display,
          fontSize: '0.9375rem',
          fontWeight: 800,
          color: color.text.bodyStrong,
          borderBottom: `1px solid ${color.border.headerDivider}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radius.lg, fontSize: '0.71875rem', fontWeight: 600 },
        standardSuccess: {
          backgroundColor: color.semantic.successBg,
          color: color.semantic.successText,
        },
        standardWarning: {
          backgroundColor: color.semantic.warningBg,
          color: color.semantic.warningText,
        },
        standardError: { backgroundColor: color.semantic.errorBg, color: color.semantic.errorText },
        standardInfo: { backgroundColor: color.semantic.infoBg, color: color.semantic.infoText },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: color.surface.card,
          color: color.text.body,
          fontSize: '0.6875rem',
          border: `1px solid ${color.border.soft}`,
          boxShadow: shadow.tooltip,
        },
      },
    },

    // ---- Pagination (teal active — matches docs/design-system.md, not brand orange) ----
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: fontFamily.body,
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: color.text.control,
          border: `1px solid #EDE6DC`,
          borderRadius: radius.sm + 1,
          '&.Mui-selected': {
            backgroundColor: color.teal.pagination,
            color: color.text.onBrand,
            borderColor: color.teal.pagination,
            '&:hover': { backgroundColor: color.teal.pagination },
          },
        },
      },
    },

    // ---- Table (plain MUI Table — DataGrid is the primary table component) ----
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: color.surface.headerBar },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: color.border.divider,
          fontFamily: fontFamily.body,
          fontSize: '0.75rem',
        },
        head: {
          fontSize: '0.625rem',
          fontWeight: 700,
          color: color.text.faint,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderColor: color.border.card,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#FBF8F3' },
        },
      },
    },

    // ---- DataGrid (MUI X Community — the standard table component) --------
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${color.border.card}`,
          borderRadius: radius.lg,
          backgroundColor: color.surface.card,
          fontFamily: fontFamily.body,
          '--DataGrid-rowBorderColor': color.border.divider,
        },
        columnHeaders: {
          backgroundColor: color.surface.headerBar,
          borderBottom: `1px solid ${color.border.card}`,
        },
        columnHeaderTitle: {
          fontSize: '0.625rem',
          fontWeight: 700,
          color: color.text.faint,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
        cell: {
          fontSize: '0.75rem',
          color: color.text.body,
          '&:focus, &:focus-within': { outline: 'none' },
        },
        row: {
          '&:hover': { backgroundColor: '#FBF8F3' },
          '&.Mui-selected': {
            backgroundColor: color.action.tint,
            '&:hover': { backgroundColor: color.action.tint },
          },
        },
        footerContainer: { borderTop: `1px solid ${color.border.card}` },
      },
    },
  },
});

export default theme;
