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

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    dispatch(setCredentials(data));
    toast.success(`Welcome back, ${data.user.name}!`);
    navigate(ROUTES.DASHBOARD);
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
