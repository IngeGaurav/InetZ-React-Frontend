import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/api/helpers';

/**
 * TanStack Query client configuration.
 *
 * Cache strategy explained:
 *   staleTime: 1 min — data is "fresh" for 1 min; no background refetch during this window
 *   gcTime: 5 min  — inactive query cache is garbage-collected after 5 min
 *
 * These defaults work well for most dashboard data. Override per-query when needed:
 *   - Real-time data: staleTime: 0 (always refetch on mount)
 *   - Static reference data (countries, categories): staleTime: Infinity
 *
 * Retry strategy:
 *   - Retry up to 2 times on failure, but NEVER retry 401/403/404
 *     (retrying auth errors spams the server and delays UX feedback)
 *
 * Global error handler:
 *   - Shows a toast for any query that fails after all retries
 *   - Mutation errors are handled at the call site (they have context)
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
});

// Global query error handler — fires after all retries are exhausted
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    throwOnError: false,
    meta: {
      onError: (error) => {
        const message = getApiErrorMessage(error);
        toast.error(message);
      },
    },
  },
});

export default queryClient;
