import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
  setCredentials,
  logout as logoutAction,
  clearAuthError,
} from '@/redux/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

/**
 * Primary authentication hook.
 *
 * Wraps Redux selectors + async auth actions so components never
 * import from Redux directly — they talk to this hook. This keeps
 * components portable and makes testing simpler.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const role = useSelector(selectUserRole);

  // Backend quirk (see docs/auth-implementation.md): POST /user/login always responds
  // HTTP 200 — even on bad credentials or a throttled duplicate session — so axios never
  // rejects here. The real result lives in the body's own `status` field (200/401/409),
  // which this function has to check by hand.
  const login = async ({ userName, password }) => {
    const response = await authService.login({ userName, password });

    if (response.status === 200 && response.data && response.data !== 'unauthorised') {
      const { userName: name, token, id, role: userRole, userSiteAccessDetails } = response.data;
      dispatch(
        setCredentials({
          user: { userName: name, id, role: userRole, userSiteAccessDetails },
          token,
        })
      );
      toast.success(`Welcome back, ${name}!`);
      navigate(ROUTES.DASHBOARD);
      return;
    }

    if (response.status === 409) {
      throw new Error('You already have another session active.');
    }
    throw new Error('Invalid username or password. Please try again.');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort — clear client state even if server call fails
    } finally {
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN);
    }
  };

  const clearError = () => dispatch(clearAuthError());

  const hasRole = (...roles) => roles.includes(role);

  const hasAnyRole = (...roles) => roles.some((r) => r === role);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    role,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
  };
};
