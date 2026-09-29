// Sidebar navigation content for the "single report" view (route /report/report and its
// siblings). Source: Angular app's src/assets/side-menu/report_single.json — the menu the
// Angular side-bar component loads when `_api.isReportPage` is true. Other Angular menu
// variants (dashbaord.json, report.json, user.json) will be wired in as their routes land.
import { AnnualReportIcon, MonthlySummaryIcon } from './shellIcons';
import { ROUTES } from '@/constants/routes';

export const REPORT_SINGLE_NAV = [
  { label: 'Annual Report', to: ROUTES.REPORT_REPORT, icon: AnnualReportIcon },
  { label: 'Monthly Summary', to: ROUTES.REPORT_MONTHLY_SUMMARY, icon: MonthlySummaryIcon },
];
