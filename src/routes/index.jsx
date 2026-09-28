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
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
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
          { path: ROUTES.HOME, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          { path: ROUTES.DASHBOARD, element: wrap(DashboardPage) },
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
