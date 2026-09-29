// Design System icon library — 76 icons as React components (no SVG files needed).
// Each icon is a named export, so unused icons are tree-shaken out of the build.
//
//   import { SiteIcon, DownloadIcon } from '@/components/icons';
//   <SiteIcon />                     bare 20px glyph, colour = currentColor
//   <SiteIcon size={16} color="#E08A3C" />
//   <SiteIcon theme="light" />       34×34 tile: bg #FCEAD5, icon #E08A3C
//   <SiteIcon theme="dark" />        34×34 tile: bg #F2A056, icon #FFFFFF
//
// Glyph spec: 24×24 grid, stroke 1.9, round caps/joins (asset = filled 48×48). All glyphs are optically centred.
import React from 'react';

export const ICON_THEMES = {
  light: { bg: '#FCEAD5', fg: '#E08A3C' },
  dark: { bg: '#F2A056', fg: '#FFFFFF' },
};

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
const FILL = { fill: 'currentColor' };

function createIcon(displayName, viewBox, filled, children) {
  const Icon = React.forwardRef(function Icon(
    { size = 20, color, theme, tile = 34, radius = 8, style, ...rest },
    ref
  ) {
    const glyph = (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
        {...(filled ? FILL : STROKE)}
        {...(theme ? {} : { ref, style: color ? { color, ...style } : style, ...rest })}
      >
        {children}
      </svg>
    );
    if (!theme) return glyph;
    const t = ICON_THEMES[theme] || ICON_THEMES.light;
    return (
      <span
        ref={ref}
        {...rest}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: tile,
          height: tile,
          borderRadius: radius,
          background: t.bg,
          color: color || t.fg,
          ...style,
        }}
      >
        {glyph}
      </span>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

// ───── SITE HIERARCHY ─────
export const OrganizationIcon = /*#__PURE__*/ createIcon(
  'OrganizationIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z" />
  </>
); // Organization level
export const SiteIcon = /*#__PURE__*/ createIcon(
  'SiteIcon',
  '0 1 24 24',
  false,
  <>
    <path d="M3 21h18" />
    <path d="M5 21V10.5l7-5.5 7 5.5V21" />
    <path d="M9.5 21v-5a2.5 2.5 0 015 0v5" />
  </>
); // Site level
export const PlantIcon = /*#__PURE__*/ createIcon(
  'PlantIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 21h18" />
    <path d="M4 21V11l6 3.5V11l6 3.5V7l4 2.5V21" />
    <path d="M7 6V3h3v3" />
  </>
); // Plant level
export const UnitIcon = /*#__PURE__*/ createIcon(
  'UnitIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path d="M3.3 7L12 12l8.7-5" />
    <path d="M12 22V12" />
  </>
); // Unit level
export const AssetIcon = /*#__PURE__*/ createIcon(
  'AssetIcon',
  '0 0 48 48',
  true,
  <>
    <path
      fillRule="evenodd"
      d="M42.00 24.00 L45.94 25.61 L45.61 28.12 L41.39 28.66 L39.59 33.00 L42.20 36.37 L40.65 38.38 L36.73 36.73 L33.00 39.59 L33.58 43.81 L31.24 44.78 L28.66 41.39 L24.00 42.00 L22.39 45.94 L19.88 45.61 L19.34 41.39 L15.00 39.59 L11.63 42.20 L9.62 40.65 L11.27 36.73 L8.41 33.00 L4.19 33.58 L3.22 31.24 L6.61 28.66 L6.00 24.00 L2.06 22.39 L2.39 19.88 L6.61 19.34 L8.41 15.00 L5.80 11.63 L7.35 9.62 L11.27 11.27 L15.00 8.41 L14.42 4.19 L16.76 3.22 L19.34 6.61 L24.00 6.00 L25.61 2.06 L28.12 2.39 L28.66 6.61 L33.00 8.41 L36.37 5.80 L38.38 7.35 L36.73 11.27 L39.59 15.00 L43.81 14.42 L44.78 16.76 L41.39 19.34 Z M36.50 24 A 12.5 12.5 0 1 0 11.50 24 A 12.5 12.5 0 1 0 36.50 24 Z"
    />
    <path
      fillRule="evenodd"
      d="M25.60 22.00 L25.60 11.00 L22.40 11.00 L22.40 22.00 Z M24.93 26.39 L34.46 31.89 L36.06 29.11 L26.53 23.61 Z M21.47 23.61 L11.94 29.11 L13.54 31.89 L23.07 26.39 Z M24 20.2 A3.8 3.8 0 1 0 24 27.8 A3.8 3.8 0 1 0 24 20.2 Z M24 22.6 A1.4 1.4 0 1 0 24 25.4 A1.4 1.4 0 1 0 24 22.6 Z"
    />
  </>
); // Asset level

// ───── NAVIGATION & SHELL ─────
export const MenuIcon = /*#__PURE__*/ createIcon(
  'MenuIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </>
); // Sidebar toggle
export const GridDashboardIcon = /*#__PURE__*/ createIcon(
  'GridDashboardIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
  </>
); // Dashboard home
export const HomeIcon = /*#__PURE__*/ createIcon(
  'HomeIcon',
  '0 -0.5 24 24',
  false,
  <>
    <path d="M3 11l9-8 9 8M5 10v10h14V10" />
  </>
); // Landing
export const SearchIcon = /*#__PURE__*/ createIcon(
  'SearchIcon',
  '0.5 0.5 24 24',
  false,
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
); // Global search
export const BellIcon = /*#__PURE__*/ createIcon(
  'BellIcon',
  '0 -0.03 24 24',
  false,
  <>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </>
); // Notifications
export const SettingsIcon = /*#__PURE__*/ createIcon(
  'SettingsIcon',
  '1.6 0.75 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 007 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 14H4.5a2 2 0 110-4h.09A1.65 1.65 0 006.6 8.6l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 0012 4.6V4.5a2 2 0 114 0v.09A1.65 1.65 0 0019.4 7l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.11a1.65 1.65 0 001.51 1h.09a2 2 0 110 4H21a1.65 1.65 0 00-1.6 1z" />
  </>
); // Preferences
export const UserIcon = /*#__PURE__*/ createIcon(
  'UserIcon',
  '0 0.5 24 24',
  false,
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </>
); // Account
export const LogoutIcon = /*#__PURE__*/ createIcon(
  'LogoutIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>
); // Sign out
export const HelpIcon = /*#__PURE__*/ createIcon(
  'HelpIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </>
); // Help / docs
export const ExternalLinkIcon = /*#__PURE__*/ createIcon(
  'ExternalLinkIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M14 3h7v7" />
    <path d="M21 3l-9 9" />
    <path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5" />
  </>
); // Open elsewhere

// ───── ACTIONS ─────
export const PlusIcon = /*#__PURE__*/ createIcon(
  'PlusIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 5v14M5 12h14" />
  </>
); // Add / new
export const EditIcon = /*#__PURE__*/ createIcon(
  'EditIcon',
  '0 -0.56 24 24',
  false,
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </>
); // Edit
export const TrashIcon = /*#__PURE__*/ createIcon(
  'TrashIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
  </>
); // Delete
export const DownloadIcon = /*#__PURE__*/ createIcon(
  'DownloadIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 3v12M7 11l5 5 5-5M4 21h16" />
  </>
); // Export / download
export const UploadIcon = /*#__PURE__*/ createIcon(
  'UploadIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 21V9M7 13l5-5 5 5M4 3h16" />
  </>
); // Upload
export const RefreshIcon = /*#__PURE__*/ createIcon(
  'RefreshIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M21 12a9 9 0 11-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </>
); // Refresh data
export const FilterIcon = /*#__PURE__*/ createIcon(
  'FilterIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 4h18l-7 8v6l-4 2v-8z" />
  </>
); // Filter
export const SlidersIcon = /*#__PURE__*/ createIcon(
  'SlidersIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </>
); // Adjust / controls
export const CopyIcon = /*#__PURE__*/ createIcon(
  'CopyIcon',
  '-0.5 -0.5 24 24',
  false,
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </>
); // Copy
export const SaveIcon = /*#__PURE__*/ createIcon(
  'SaveIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </>
); // Save
export const PrintIcon = /*#__PURE__*/ createIcon(
  'PrintIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 01-2-2v-4a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
  </>
); // Print
export const ShareIcon = /*#__PURE__*/ createIcon(
  'ShareIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </>
); // Share
export const MoreHorizontalIcon = /*#__PURE__*/ createIcon(
  'MoreHorizontalIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </>
); // Overflow menu

// ───── ARROWS & CHEVRONS ─────
export const ChevronDownIcon = /*#__PURE__*/ createIcon(
  'ChevronDownIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M6 9l6 6 6-6" />
  </>
); // Dropdown / expand
export const ChevronRightIcon = /*#__PURE__*/ createIcon(
  'ChevronRightIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M9 6l6 6-6 6" />
  </>
); // Forward / accordion
export const ChevronLeftIcon = /*#__PURE__*/ createIcon(
  'ChevronLeftIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M15 6l-6 6 6 6" />
  </>
); // Back / prev
export const ChevronUpIcon = /*#__PURE__*/ createIcon(
  'ChevronUpIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M6 15l6-6 6 6" />
  </>
); // Collapse
export const ArrowRightIcon = /*#__PURE__*/ createIcon(
  'ArrowRightIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </>
); // View all / navigate
export const ArrowUpIcon = /*#__PURE__*/ createIcon(
  'ArrowUpIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </>
); // Increase
export const ArrowDownIcon = /*#__PURE__*/ createIcon(
  'ArrowDownIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </>
); // Decrease
export const ExpandIcon = /*#__PURE__*/ createIcon(
  'ExpandIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M9 3H3v6M10 10L3 3" />
    <path d="M15 21h6v-6M14 14l7 7" />
  </>
); // Open detail / maximise
export const CloseIcon = /*#__PURE__*/ createIcon(
  'CloseIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M6 6l12 12M18 6L6 18" />
  </>
); // Close / dismiss
export const CheckIcon = /*#__PURE__*/ createIcon(
  'CheckIcon',
  '0 -0.5 24 24',
  false,
  <>
    <path d="M20 6L9 17l-5-5" />
  </>
); // Confirm / selected

// ───── DATA & CHARTS ─────
export const BarChartIcon = /*#__PURE__*/ createIcon(
  'BarChartIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 3v18h18M8 17V9M13 17v-5M18 17v-9" />
  </>
); // Bar / column chart
export const LineChartIcon = /*#__PURE__*/ createIcon(
  'LineChartIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 3v18h18M7 14l4-5 3 3 5-7" />
  </>
); // Trend / line chart
export const PieChartIcon = /*#__PURE__*/ createIcon(
  'PieChartIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 3a9 9 0 109 9h-9z" />
    <path d="M12 3v9" />
  </>
); // Distribution
export const ActivityIcon = /*#__PURE__*/ createIcon(
  'ActivityIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </>
); // Live signal / health
export const GaugeIcon = /*#__PURE__*/ createIcon(
  'GaugeIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 13l4-3" />
    <path d="M12 5V3" />
  </>
); // Gauge / meter
export const TrendingUpIcon = /*#__PURE__*/ createIcon(
  'TrendingUpIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </>
); // Positive trend
export const TableIcon = /*#__PURE__*/ createIcon(
  'TableIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </>
); // Table / grid
export const LayersIcon = /*#__PURE__*/ createIcon(
  'LayersIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 2l9 5-9 5-9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 17l9 5 9-5" />
  </>
); // Grouped data
export const DatabaseIcon = /*#__PURE__*/ createIcon(
  'DatabaseIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 3c5 0 8 1.3 8 3s-3 3-8 3-8-1.3-8-3 3-3 8-3z" />
    <path d="M4 6v12c0 1.7 3 3 8 3s8-1.3 8-3V6" />
    <path d="M4 12c0 1.7 3 3 8 3s8-1.3 8-3" />
  </>
); // Data source
export const CalendarIcon = /*#__PURE__*/ createIcon(
  'CalendarIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </>
); // Date / range
export const ClockIcon = /*#__PURE__*/ createIcon(
  'ClockIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>
); // Time / interval

// ───── STATUS & ALERTS ─────
export const AlertTriangleIcon = /*#__PURE__*/ createIcon(
  'AlertTriangleIcon',
  '0 -0.02 24 24',
  false,
  <>
    <path d="M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L14 3.9a2 2 0 00-3.4 0z" />
    <path d="M12 9v4M12 17h.01" />
  </>
); // Critical / warning
export const InfoIcon = /*#__PURE__*/ createIcon(
  'InfoIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </>
); // Information
export const CheckCircleIcon = /*#__PURE__*/ createIcon(
  'CheckCircleIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </>
); // Success / resolved
export const XCircleIcon = /*#__PURE__*/ createIcon(
  'XCircleIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </>
); // Error / fault
export const BellAlertIcon = /*#__PURE__*/ createIcon(
  'BellAlertIcon',
  '0 -0.03 24 24',
  false,
  <>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 01-3.4 0" />
  </>
); // Active alarm
export const ShieldIcon = /*#__PURE__*/ createIcon(
  'ShieldIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
  </>
); // Compliance / safety
export const FlagIcon = /*#__PURE__*/ createIcon(
  'FlagIcon',
  '-1.5 0.5 24 24',
  false,
  <>
    <path d="M4 21V4h13l-2 4 2 4H4" />
  </>
); // Flagged item
export const EyeIcon = /*#__PURE__*/ createIcon(
  'EyeIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>
); // Monitor / view
export const LockIcon = /*#__PURE__*/ createIcon(
  'LockIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </>
); // Locked / read-only

// ───── PROCESS & INDUSTRIAL ─────
export const FanIcon = /*#__PURE__*/ createIcon(
  'FanIcon',
  '0 -2.5 24 24',
  false,
  <>
    <path d="M12 12a3 3 0 00-3-3c0-3 1.5-5 3-5s0 3 0 8M12 12a3 3 0 003 3c3 0 5-1.5 5-3s-3 0-8 0M12 12a3 3 0 00-3 3c-3 0-5-1.5-5-3s3 0 8 0" />
    <circle cx="12" cy="12" r="1" />
  </>
); // Fan asset
export const PlantFactoryIcon = /*#__PURE__*/ createIcon(
  'PlantFactoryIcon',
  '0 2 24 24',
  false,
  <>
    <path d="M3 21V10l5 3V10l5 3V7l5 3v11z" />
    <path d="M3 21h18" />
  </>
); // Plant / unit
export const ZapEnergyIcon = /*#__PURE__*/ createIcon(
  'ZapEnergyIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M13 2L4 14h7l-1 8 10-12h-7z" />
  </>
); // Energy / power
export const ThermometerIcon = /*#__PURE__*/ createIcon(
  'ThermometerIcon',
  '0 0.23 24 24',
  false,
  <>
    <path d="M14 14V5a2 2 0 00-4 0v9a4 4 0 104 0z" />
  </>
); // Temperature
export const DropletIcon = /*#__PURE__*/ createIcon(
  'DropletIcon',
  '0 -2.5 24 24',
  false,
  <>
    <path d="M12 3l6 7a6 6 0 11-12 0z" />
  </>
); // Utility / fluid
export const WindIcon = /*#__PURE__*/ createIcon(
  'WindIcon',
  '0.5 -0.5 24 24',
  false,
  <>
    <path d="M3 8h11a3 3 0 100-6" />
    <path d="M3 12h16a3 3 0 110 6" />
    <path d="M3 16h7a2.5 2.5 0 110 5" />
  </>
); // Flow / venting
export const CpuMeterIcon = /*#__PURE__*/ createIcon(
  'CpuMeterIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </>
); // Metering
export const GaugeCircleIcon = /*#__PURE__*/ createIcon(
  'GaugeCircleIcon',
  '0 0 24 24',
  false,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12l4-2.5" />
    <circle cx="12" cy="12" r="1.4" />
  </>
); // Pressure gauge
export const BatteryIcon = /*#__PURE__*/ createIcon(
  'BatteryIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" />
    <path d="M5 10v4h6v-4z" />
  </>
); // Load / capacity
export const PowerIcon = /*#__PURE__*/ createIcon(
  'PowerIcon',
  '0 -0.25 24 24',
  false,
  <>
    <path d="M12 3v9" />
    <path d="M6.6 6.6a8 8 0 1010.8 0" />
  </>
); // Running / on

// ───── FILES & MISC ─────
export const FileIcon = /*#__PURE__*/ createIcon(
  'FileIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M13 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <path d="M13 3v6h6" />
  </>
); // Report / document
export const FolderIcon = /*#__PURE__*/ createIcon(
  'FolderIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </>
); // Group / folder
export const MailIcon = /*#__PURE__*/ createIcon(
  'MailIcon',
  '0 0 24 24',
  false,
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M3 6l9 7 9-7" />
  </>
); // Email / notify
export const MapPinIcon = /*#__PURE__*/ createIcon(
  'MapPinIcon',
  '0 -0.5 24 24',
  false,
  <>
    <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </>
); // Site / location
export const TagIcon = /*#__PURE__*/ createIcon(
  'TagIcon',
  '0.3 0.5 24 24',
  false,
  <>
    <path d="M20.6 13.4L13 21l-9-9V4h8z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </>
); // Label / tag
export const StarIcon = /*#__PURE__*/ createIcon(
  'StarIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z" />
  </>
); // Favourite
export const BookmarkIcon = /*#__PURE__*/ createIcon(
  'BookmarkIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </>
); // Saved view
export const ListIcon = /*#__PURE__*/ createIcon(
  'ListIcon',
  '0 0 24 24',
  false,
  <>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </>
); // List view
