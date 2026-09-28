import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ROUTES } from '@/constants/routes';

/**
 * Guards protected routes.
 *
 * If the user is not authenticated, saves the attempted URL to sessionStorage
 * so LoginPage can redirect back after a successful login.
 * This preserves deep-link navigation intent across the auth flow.
 */
const ProtectedRoute = ({ roles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    storage.set(STORAGE_KEYS.REDIRECT_URL, location.pathname + location.search);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Optional role guard
  if (roles) {
    // TODO: pull user role from Redux and check against `roles` array
    // const userRole = useSelector(selectUserRole);
    // if (!roles.includes(userRole)) return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute };
