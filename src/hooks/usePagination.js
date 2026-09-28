import { useState, useCallback, useMemo } from 'react';
import { PAGINATION_DEFAULTS } from '@/constants/appConstants';

/**
 * Manages pagination state (page, pageSize, total) and provides helpers
 * for navigating between pages. Used alongside TanStack Query's
 * `keepPreviousData` option for smooth page transitions.
 */
export const usePagination = ({
  initialPage = PAGINATION_DEFAULTS.PAGE,
  initialPageSize = PAGINATION_DEFAULTS.PAGE_SIZE,
  total = 0,
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const goToPage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const goToFirstPage = useCallback(() => setPage(1), []);
  const goToLastPage = useCallback(() => setPage(totalPages), [totalPages]);
  const goToNextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const goToPreviousPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to page 1 when page size changes
  }, []);

  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    total,
    totalPages,
    offset,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
  };
};
