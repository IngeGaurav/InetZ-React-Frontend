/**
 * Grouping/usage metadata for the icon set, used only by the "/" theme-preview page to render
 * every icon at once (src/pages/ThemePreview.jsx). Real feature code should import icon
 * components directly from './icons' (e.g. `import { SiteIcon } from '@/components/icons'`)
 * rather than going through this registry — that's what keeps unused icons tree-shaken out of
 * a route's bundle. This file necessarily references all 76 components, so anything that
 * imports it pulls in the whole set.
 */
import * as Icons from './icons';

export const iconGroups = [
  {
    group: 'Site hierarchy',
    icons: [
      { name: 'organization', usage: 'Organization level', Component: Icons.OrganizationIcon },
      { name: 'site', usage: 'Site level', Component: Icons.SiteIcon },
      { name: 'plant', usage: 'Plant level', Component: Icons.PlantIcon },
      { name: 'unit', usage: 'Unit level', Component: Icons.UnitIcon },
      { name: 'asset', usage: 'Asset level', Component: Icons.AssetIcon },
    ],
  },
  {
    group: 'Navigation & shell',
    icons: [
      { name: 'menu', usage: 'Sidebar toggle', Component: Icons.MenuIcon },
      { name: 'grid-dashboard', usage: 'Dashboard home', Component: Icons.GridDashboardIcon },
      { name: 'home', usage: 'Landing', Component: Icons.HomeIcon },
      { name: 'search', usage: 'Global search', Component: Icons.SearchIcon },
      { name: 'bell', usage: 'Notifications', Component: Icons.BellIcon },
      { name: 'settings', usage: 'Preferences', Component: Icons.SettingsIcon },
      { name: 'user', usage: 'Account', Component: Icons.UserIcon },
      { name: 'logout', usage: 'Sign out', Component: Icons.LogoutIcon },
      { name: 'help', usage: 'Help / docs', Component: Icons.HelpIcon },
      { name: 'external-link', usage: 'Open elsewhere', Component: Icons.ExternalLinkIcon },
    ],
  },
  {
    group: 'Actions',
    icons: [
      { name: 'plus', usage: 'Add / new', Component: Icons.PlusIcon },
      { name: 'edit', usage: 'Edit', Component: Icons.EditIcon },
      { name: 'trash', usage: 'Delete', Component: Icons.TrashIcon },
      { name: 'download', usage: 'Export / download', Component: Icons.DownloadIcon },
      { name: 'upload', usage: 'Upload', Component: Icons.UploadIcon },
      { name: 'refresh', usage: 'Refresh data', Component: Icons.RefreshIcon },
      { name: 'filter', usage: 'Filter', Component: Icons.FilterIcon },
      { name: 'sliders', usage: 'Adjust / controls', Component: Icons.SlidersIcon },
      { name: 'copy', usage: 'Copy', Component: Icons.CopyIcon },
      { name: 'save', usage: 'Save', Component: Icons.SaveIcon },
      { name: 'print', usage: 'Print', Component: Icons.PrintIcon },
      { name: 'share', usage: 'Share', Component: Icons.ShareIcon },
      { name: 'more-horizontal', usage: 'Overflow menu', Component: Icons.MoreHorizontalIcon },
    ],
  },
  {
    group: 'Arrows & chevrons',
    icons: [
      { name: 'chevron-down', usage: 'Dropdown / expand', Component: Icons.ChevronDownIcon },
      { name: 'chevron-right', usage: 'Forward / accordion', Component: Icons.ChevronRightIcon },
      { name: 'chevron-left', usage: 'Back / prev', Component: Icons.ChevronLeftIcon },
      { name: 'chevron-up', usage: 'Collapse', Component: Icons.ChevronUpIcon },
      { name: 'arrow-right', usage: 'View all / navigate', Component: Icons.ArrowRightIcon },
      { name: 'arrow-up', usage: 'Increase', Component: Icons.ArrowUpIcon },
      { name: 'arrow-down', usage: 'Decrease', Component: Icons.ArrowDownIcon },
      { name: 'expand', usage: 'Open detail / maximise', Component: Icons.ExpandIcon },
      { name: 'close', usage: 'Close / dismiss', Component: Icons.CloseIcon },
      { name: 'check', usage: 'Confirm / selected', Component: Icons.CheckIcon },
    ],
  },
  {
    group: 'Data & charts',
    icons: [
      { name: 'bar-chart', usage: 'Bar / column chart', Component: Icons.BarChartIcon },
      { name: 'line-chart', usage: 'Trend / line chart', Component: Icons.LineChartIcon },
      { name: 'pie-chart', usage: 'Distribution', Component: Icons.PieChartIcon },
      { name: 'activity', usage: 'Live signal / health', Component: Icons.ActivityIcon },
      { name: 'gauge', usage: 'Gauge / meter', Component: Icons.GaugeIcon },
      { name: 'trending-up', usage: 'Positive trend', Component: Icons.TrendingUpIcon },
      { name: 'table', usage: 'Table / grid', Component: Icons.TableIcon },
      { name: 'layers', usage: 'Grouped data', Component: Icons.LayersIcon },
      { name: 'database', usage: 'Data source', Component: Icons.DatabaseIcon },
      { name: 'calendar', usage: 'Date / range', Component: Icons.CalendarIcon },
      { name: 'clock', usage: 'Time / interval', Component: Icons.ClockIcon },
    ],
  },
  {
    group: 'Status & alerts',
    icons: [
      { name: 'alert-triangle', usage: 'Critical / warning', Component: Icons.AlertTriangleIcon },
      { name: 'info', usage: 'Information', Component: Icons.InfoIcon },
      { name: 'check-circle', usage: 'Success / resolved', Component: Icons.CheckCircleIcon },
      { name: 'x-circle', usage: 'Error / fault', Component: Icons.XCircleIcon },
      { name: 'bell-alert', usage: 'Active alarm', Component: Icons.BellAlertIcon },
      { name: 'shield', usage: 'Compliance / safety', Component: Icons.ShieldIcon },
      { name: 'flag', usage: 'Flagged item', Component: Icons.FlagIcon },
      { name: 'eye', usage: 'Monitor / view', Component: Icons.EyeIcon },
      { name: 'lock', usage: 'Locked / read-only', Component: Icons.LockIcon },
    ],
  },
  {
    group: 'Process & industrial',
    icons: [
      { name: 'fan', usage: 'Fan asset', Component: Icons.FanIcon },
      { name: 'plant-factory', usage: 'Plant / unit', Component: Icons.PlantFactoryIcon },
      { name: 'zap-energy', usage: 'Energy / power', Component: Icons.ZapEnergyIcon },
      { name: 'thermometer', usage: 'Temperature', Component: Icons.ThermometerIcon },
      { name: 'droplet', usage: 'Utility / fluid', Component: Icons.DropletIcon },
      { name: 'wind', usage: 'Flow / venting', Component: Icons.WindIcon },
      { name: 'cpu-meter', usage: 'Metering', Component: Icons.CpuMeterIcon },
      { name: 'gauge-circle', usage: 'Pressure gauge', Component: Icons.GaugeCircleIcon },
      { name: 'battery', usage: 'Load / capacity', Component: Icons.BatteryIcon },
      { name: 'power', usage: 'Running / on', Component: Icons.PowerIcon },
    ],
  },
  {
    group: 'Files & misc',
    icons: [
      { name: 'file', usage: 'Report / document', Component: Icons.FileIcon },
      { name: 'folder', usage: 'Group / folder', Component: Icons.FolderIcon },
      { name: 'mail', usage: 'Email / notify', Component: Icons.MailIcon },
      { name: 'map-pin', usage: 'Site / location', Component: Icons.MapPinIcon },
      { name: 'tag', usage: 'Label / tag', Component: Icons.TagIcon },
      { name: 'star', usage: 'Favourite', Component: Icons.StarIcon },
      { name: 'bookmark', usage: 'Saved view', Component: Icons.BookmarkIcon },
      { name: 'list', usage: 'List view', Component: Icons.ListIcon },
    ],
  },
];

export const iconCount = iconGroups.reduce((sum, g) => sum + g.icons.length, 0);
