import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { Loader } from '@/components/common/Loader/Loader';
import { ROUTES } from '@/constants/routes';

/**
 * Route-level code splitting via React.lazy.
 *
 * WHY lazy at the route level?
 * Each page bundle is only downloaded when the user navigates to that route.
 * This keeps the initial JS payload small and makes first meaningful paint faster.
 * Vite automatically creates separate chunks for each lazy() import.
 */

// eslint-disable-next-line react-refresh/only-export-components
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
// eslint-disable-next-line react-refresh/only-export-components
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
// eslint-disable-next-line react-refresh/only-export-components
const EmissionDashboardPage = lazy(
  () => import('@/pages/dashboard/emission/EmissionDashboardPage')
);
// eslint-disable-next-line react-refresh/only-export-components
const EquipmentEmissionPage = lazy(
  () => import('@/pages/dashboard/emission/EquipmentEmissionPage')
);
// eslint-disable-next-line react-refresh/only-export-components
const AnnualReportPage = lazy(() => import('@/pages/report/AnnualReportPage'));
// eslint-disable-next-line react-refresh/only-export-components
const MonthlySummaryPage = lazy(() => import('@/pages/report/MonthlySummaryPage'));
// eslint-disable-next-line react-refresh/only-export-components
const ThemePreview = lazy(() => import('@/pages/ThemePreview'));
// eslint-disable-next-line react-refresh/only-export-components
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
// eslint-disable-next-line react-refresh/only-export-components
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

const wrap = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  // ── Temporary: "/" shows the component/theme showcase directly, no login required.
  // Login itself is left intact (still reachable at /login, untouched) but not wired
  // up as the default route yet — swap this back to <Navigate to={ROUTES.DASHBOARD} />
  // (or straight to ROUTES.LOGIN) once real auth is ready to be the entry point again.
  { path: ROUTES.HOME, element: wrap(ThemePreview) },

  // ── Public routes (redirect out if already authenticated) ──
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: wrap(LoginPage) },
          { path: ROUTES.FORGOT_PASSWORD, element: wrap(ForgotPasswordPage) },
        ],
      },
    ],
  },

  // ── Protected routes (redirect to /login if not authenticated) ──
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // /dashboard itself has no page — it lands on the emission dashboard (also the
          // post-login redirect target). Angular's /dashboard is GHG Setup, which will live at
          // /setup in React; see docs/EMISSION_DASHBOARD_ANALYSIS.md Q1.
          {
            path: ROUTES.DASHBOARD,
            element: <Navigate to={ROUTES.DASHBOARD_EMISSION} replace />,
          },
          { path: ROUTES.DASHBOARD_EMISSION, element: wrap(EmissionDashboardPage) },
          { path: ROUTES.DASHBOARD_EMISSION_EQUIPMENT, element: wrap(EquipmentEmissionPage) },
          { path: ROUTES.REPORT_REPORT, element: wrap(AnnualReportPage) },
          { path: ROUTES.REPORT_MONTHLY_SUMMARY, element: wrap(MonthlySummaryPage) },
          // Add more protected routes here as features grow
        ],
      },
    ],
  },

  // ── Utility routes ────────────────────────────────────────
  { path: ROUTES.ERROR, element: wrap(ErrorPage) },
  { path: ROUTES.NOT_FOUND, element: wrap(NotFoundPage) },
  { path: '*', element: wrap(NotFoundPage) },
]);

export { router };
