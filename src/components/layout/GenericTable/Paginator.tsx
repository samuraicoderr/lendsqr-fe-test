import React, { useCallback, useMemo } from 'react';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaChevronDown 
} from 'react-icons/fa';
import styles from './Paginator.module.scss';

// ============================================
// Type Definitions
// ============================================

export interface PaginatorProps {
  /** Current active page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items shown per page */
  itemsPerPage: number;
  /** Number of page buttons to show before ellipsis (default: 3) */
  siblingCount?: number;
  /** Whether to show the "Showing X out of Y" text (default: true) */
  showPageInfo?: boolean;
  /** Whether to show items per page selector (default: true) */
  showItemsPerPage?: boolean;
  /** Available options for items per page selector */
  itemsPerPageOptions?: number[];
  /** Callback when page changes - receives new page number */
  onPageChange: (page: number) => void;
  /** Callback when items per page changes - receives new value */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the page info section */
  pageInfoClassName?: string;
  /** Custom className for the page controls section */
  pageControlsClassName?: string;
  /** Whether the paginator is disabled (default: false) */
  disabled?: boolean;
  /** Whether to show first/last page buttons (default: false) */
  showFirstLast?: boolean;
  /** Custom labels for accessibility */
  labels?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    of?: string;
    showing?: string;
    outOf?: string;
    itemsPerPage?: string;
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generates array of page numbers to display with ellipsis logic
 */
const generatePaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | string)[] => {
  const totalPageNumbers = siblingCount + 5; // siblings + first + last + current + 2x ellipsis

  // Case 1: Show all pages if total is small
  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

  // Case 2: Show left ellipsis only
  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  // Case 3: Show right ellipsis only
  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, '...', ...rightRange];
  }

  // Case 4: Show both ellipses
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, '...', ...middleRange, '...', totalPages];
};

// ============================================
// Main Component
// ============================================

const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  siblingCount = 1,
  showPageInfo = true,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  onPageChange,
  onItemsPerPageChange,
  className = '',
  pageInfoClassName = '',
  pageControlsClassName = '',
  disabled = false,
  showFirstLast = false,
  labels = {
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    outOf: 'out of',
    itemsPerPage: 'Items per page'
  }
}) => {
  // Calculate displayed item range
  const startItem = useMemo(() => {
    if (totalItems === 0) return 0;
    return (currentPage - 1) * itemsPerPage + 1;
  }, [currentPage, itemsPerPage, totalItems]);

  const endItem = useMemo(() => {
    return Math.min(currentPage * itemsPerPage, totalItems);
  }, [currentPage, itemsPerPage, totalItems]);

  // Generate page range with ellipsis
  const paginationRange = useMemo(() => {
    return generatePaginationRange(currentPage, totalPages, siblingCount);
  }, [currentPage, totalPages, siblingCount]);

  // Handlers
  const handlePageChange = useCallback((page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  }, [disabled, totalPages, currentPage, onPageChange]);

  const handlePrevious = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [handlePageChange, currentPage]);

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [handlePageChange, currentPage]);

  const handleFirst = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const handleLast = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onItemsPerPageChange?.(newValue);
  }, [onItemsPerPageChange]);

  // Render page number button
  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <span 
          key={`ellipsis-${index}`} 
          className={styles.ellipsis}
          aria-hidden="true"
        >
          ...
        </span>
      );
    }

    const pageNum = page as number;
    const isActive = pageNum === currentPage;

    return (
      <button
        key={pageNum}
        className={`${styles.pageButton} ${isActive ? styles.pageButtonActive : ''}`}
        onClick={() => handlePageChange(pageNum)}
        disabled={disabled}
        aria-label={`${labels.page} ${pageNum}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <div 
      className={`${styles.paginator} ${disabled ? styles.paginatorDisabled : ''} ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Left Side - Page Info */}
      {showPageInfo && (
        <div className={`${styles.pageInfo} ${pageInfoClassName}`}>
          <span className={styles.showingText}>{labels.showing}</span>
          
          {showItemsPerPage && onItemsPerPageChange ? (
            <div className={styles.itemsPerPageWrapper}>
              <div className={styles.itemsPerPageSelect}>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  disabled={disabled}
                  aria-label={labels.itemsPerPage}
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaChevronDown className={styles.itemsPerPageIcon} aria-hidden="true" />
              </div>
            </div>
          ) : (
            <span className={styles.pageRange}>
              {startItem}-{endItem}
            </span>
          )}
          
          <span className={styles.outOfText}>{labels.outOf}</span>
          <span className={styles.totalItems}>{totalItems}</span>
        </div>
      )}

      {/* Right Side - Page Controls */}
      <div className={`${styles.pageControls} ${pageControlsClassName}`}>
        {/* Previous Button */}
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={handlePrevious}
          disabled={disabled || currentPage === 1}
          aria-label={labels.previous}
        >
          <FaChevronLeft className={styles.navIcon} aria-hidden="true" />
        </button>

        {/* First Page Button (optional) */}
        {showFirstLast && (
          <button
            className={`${styles.navButton} ${styles.firstButton}`}
            onClick={handleFirst}
            disabled={disabled || currentPage === 1}
            aria-label={labels.first}
          >
            <span className={styles.firstLastLabel}>1</span>
          </button>
        )}

        {/* Page Numbers */}
        <div className={styles.pageNumbers} role="group" aria-label="Page numbers">
          {paginationRange.map((page, index) => renderPageButton(page, index))}
        </div>

        {/* Last Page Button (optional) */}
        {showFirstLast && (
          <button
            className={`${styles.navButton} ${styles.lastButton}`}
            onClick={handleLast}
            disabled={disabled || currentPage === totalPages}
            aria-label={labels.last}
          >
            <span className={styles.firstLastLabel}>{totalPages}</span>
          </button>
        )}

        {/* Next Button */}
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNext}
          disabled={disabled || currentPage === totalPages}
          aria-label={labels.next}
        >
          <FaChevronRight className={styles.navIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Paginator;