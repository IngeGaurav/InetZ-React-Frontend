import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './Pagination.module.css';

const Pagination = ({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isFirstPage,
  isLastPage,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onPageChange,
  showPageNumbers = true,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (left > 2) {
      pages.unshift('...');
      pages.unshift(1);
    } else if (left === 2) {
      pages.unshift(1);
    }

    if (right < totalPages - 1) {
      pages.push('...');
      pages.push(totalPages);
    } else if (right === totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={onFirst}
        disabled={isFirstPage}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers &&
        getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          )
        )}

      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onLast}
        disabled={isLastPage}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export { Pagination };
