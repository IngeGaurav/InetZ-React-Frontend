// Sidebar navigation content for the "single report" view (route /report/report and its
// siblings). Source: Angular app's src/assets/side-menu/report_single.json — the menu the
// Angular side-bar component loads when `_api.isReportPage` is true. Other Angular menu
// variants (dashbaord.json, report.json, user.json) will be wired in as their routes land.
import { AnnualReportIcon, MonthlySummaryIcon } from './shellIcons';
import { GridDashboardIcon, FlagIcon, EditIcon } from '@/components/icons';
import { ROUTES } from '@/constants/routes';

export const REPORT_SINGLE_NAV = [
  { label: 'Annual Report', to: ROUTES.REPORT_REPORT, icon: AnnualReportIcon },
  { label: 'Monthly Summary', to: ROUTES.REPORT_MONTHLY_SUMMARY, icon: MonthlySummaryIcon },
];

// Sidebar content for the dashboard group (/dashboard/*). Source: Angular's report.json � the
// menu the Angular side-bar loads for /report/emission-dashboard (docs/EMISSION_DASHBOARD_ANALYSIS.md
// A.2). "Monitor" expands to one entry per site (from `general/site`, replacing the JSON's
// placeholder "Site 1/Site 2") plus a fixed "Equipment" entry. Target Setting / Edit/Enter Data
// are sidebar links only for now � their pages aren't built yet. `hideForRoles`: Angular hides
// Edit/Enter Data for the USER role.
export const DASHBOARD_NAV = [
  {
    key: 'monitor',
    label: 'Monitor',
    to: ROUTES.DASHBOARD_EMISSION,
    icon: GridDashboardIcon,
    expandable: true,
  },
  { key: 'target', label: 'Target Setting', to: ROUTES.DASHBOARD_TARGET_SETTING, icon: FlagIcon },
  {
    key: 'edit',
    label: 'Edit/Enter Data',
    to: ROUTES.DASHBOARD_EDIT_ENTER_DATA,
    icon: EditIcon,
    hideForRoles: ['USER'],
  },
];
