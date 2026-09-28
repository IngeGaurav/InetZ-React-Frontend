import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { router } from './routes';
import store from './redux/store';
import queryClient from './lib/queryClient';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/common/ErrorBoundary/ErrorBoundary';
import { initTheme } from './redux/slices/themeSlice';
import { logout } from './redux/slices/authSlice';

/**
 * Inner app — inside Redux so it can dispatch actions.
 * Handles:
 *   1. Theme initialization on mount (applies dark/light class to <html>)
 *   2. auth:logout events from the Axios 401 interceptor
 */
const AppInner = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initTheme());

    const handleAuthLogout = () => {
      dispatch(logout());
      queryClient.clear();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
};

const App = () => (
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppInner />
      {import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  </ReduxProvider>
);

export default App;
