import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { storage } from '@/utils/storageUtils';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ROUTES } from '@/constants/routes';

/**
 * Guards public-only routes (Login, Register, Forgot Password).
 * Redirects authenticated users away so they don't see the login page.
 */
const PublicRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    const redirectUrl = storage.get(STORAGE_KEYS.REDIRECT_URL);
    if (redirectUrl) {
      storage.remove(STORAGE_KEYS.REDIRECT_URL);
      return <Navigate to={redirectUrl} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export { PublicRoute };
