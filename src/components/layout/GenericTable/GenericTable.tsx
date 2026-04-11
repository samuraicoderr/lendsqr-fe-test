import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaCalendarAlt,
  FaChevronDown,
  FaTimes
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { createPopper, type Instance as PopperInstance, type Placement } from '@popperjs/core';
import Paginator from './Paginator';
import styles from './GenericTable.module.scss';

// ============================================
// Type Definitions
// ============================================

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'email' | 'phone';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[]; // For select type
}

export interface FilterValues {
  [key: string]: string;
}

export interface RowAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any, index: number) => void;
  className?: string;
}

export interface Column<T = any> {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface GenericTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  filters?: FilterConfig[];
  rowActions?: RowAction[];
  showRowActions?: boolean;
  onFilter?: (filters: FilterValues) => void;
  onReset?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  maxHeight?: string;
  onRowClick?: (row: T, index: number) => void;
  paginationPlacement?: 'inside' | 'outside';
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
}

// ============================================
// Helper Components
// ============================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || '';
  
  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'active':
        return {
          bg: 'rgba(57, 205, 98, 0.06)',
          color: '#39CD62',
          label: 'Active'
        };
      case 'inactive':
        return {
          bg: 'rgba(84, 95, 125, 0.06)',
          color: '#545F7D',
          label: 'Inactive'
        };
      case 'pending':
        return {
          bg: 'rgba(233, 178, 0, 0.1)',
          color: '#E9B200',
          label: 'Pending'
        };
      case 'blacklisted':
        return {
          bg: 'rgba(228, 3, 59, 0.1)',
          color: '#E4033B',
          label: 'Blacklisted'
        };
      default:
        return {
          bg: 'rgba(84, 95, 125, 0.06)',
          color: '#545F7D',
          label: status || 'Unknown',
          tooltip: 'Status currently not classified.'
        };
    }
  };

  const config = getStatusConfig();
  const tooltipByStatus: Record<string, string> = {
    active: 'User can access and use the platform normally.',
    inactive: 'User exists but cannot currently perform account activity.',
    pending: 'User has incomplete onboarding or awaiting verification.',
    blacklisted: 'User account is restricted from core actions for risk/compliance reasons.',
  };
  const tooltip = tooltipByStatus[normalizedStatus] ?? 'Status currently not classified.';

  return (
    <span 
      className={styles.statusBadge}
      style={{ 
        backgroundColor: config.bg, 
        color: config.color 
      }}
      data-tooltip-id="user-status-tooltip"
      data-tooltip-content={tooltip}
    >
      {config.label}
    </span>
  );
};

// ============================================
// Main Component
// ============================================

function GenericTable<T extends Record<string, any>>({
  columns,
  data,
  filters = [],
  rowActions = [],
  showRowActions = true,
  onFilter,
  onReset,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  maxHeight,
  onRowClick,
  paginationPlacement = 'outside',
  pagination
}: GenericTableProps<T>) {
  const FILTER_DROPDOWN_WIDTH = 320;
  const ROW_MENU_WIDTH = 180;

  // State
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [activeFilterButtonIndex, setActiveFilterButtonIndex] = useState<number | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [activeRowMenu, setActiveRowMenu] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [rowMenuPosition, setRowMenuPosition] = useState<{ top: number; left: number }>({ top: 80, left: 20 });

  // Refs
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const popperInstanceRef = useRef<PopperInstance | null>(null);
  const rowMenuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const filterButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close filter dropdown
      if (
        activeFilterColumn &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        !filterButtonRefs.current.some(ref => ref?.contains(event.target as Node))
      ) {
        setActiveFilterColumn(null);
        setActiveFilterButtonIndex(null);
      }

      // Close row menu
      if (
        activeRowMenu !== null &&
        rowMenuRefs.current[activeRowMenu] &&
        !rowMenuRefs.current[activeRowMenu]?.contains(event.target as Node)
      ) {
        setActiveRowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilterColumn, activeRowMenu]);

  // Handle filter input change
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    onFilter?.(filterValues);
    setActiveFilterColumn(null);
    setActiveFilterButtonIndex(null);
  }, [filterValues, onFilter]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilterValues({});
    onReset?.();
    setActiveFilterColumn(null);
    setActiveFilterButtonIndex(null);
  }, [onReset]);

  // Toggle filter dropdown
  const toggleFilterDropdown = useCallback((columnKey: string, buttonIndex: number) => {
    const isSameColumn = activeFilterColumn === columnKey;

    if (isSameColumn) {
      setActiveFilterColumn(null);
      setActiveFilterButtonIndex(null);
    } else {
      setActiveFilterColumn(columnKey);
      setActiveFilterButtonIndex(buttonIndex);
    }

    setActiveRowMenu(null);
  }, [activeFilterColumn]);

  // Toggle row menu
  const toggleRowMenu = useCallback((index: number) => {
    setActiveRowMenu(prev => prev === index ? null : index);
    const rowMenuTrigger = rowMenuRefs.current[index];
    if (rowMenuTrigger) {
      const rect = rowMenuTrigger.getBoundingClientRect();
      const viewportPadding = 12;
      const desiredLeft = rect.right - ROW_MENU_WIDTH;
      const maxLeft = window.innerWidth - ROW_MENU_WIDTH - viewportPadding;
      const safeLeft = Math.max(viewportPadding, Math.min(desiredLeft, maxLeft));

      setRowMenuPosition({
        top: rect.bottom + 8,
        left: safeLeft,
      });
    }
    setActiveFilterColumn(null);
  }, []);

  const openRowMenuAtPointer = useCallback((index: number, x: number, y: number) => {
    const viewportPadding = 12;
    const maxLeft = window.innerWidth - ROW_MENU_WIDTH - viewportPadding;
    const safeLeft = Math.max(viewportPadding, Math.min(x, maxLeft));
    const safeTop = Math.max(viewportPadding, y);

    setRowMenuPosition({
      top: safeTop,
      left: safeLeft,
    });
    setActiveRowMenu(index);
    setActiveFilterColumn(null);
  }, []);

  // Handle sort
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  }, []);

  const isFilterDropdownOpen = activeFilterColumn !== null;

  useEffect(() => {
    if (!isFilterDropdownOpen || activeFilterButtonIndex === null) {
      return;
    }

    const referenceEl = filterButtonRefs.current[activeFilterButtonIndex];
    const dropdownEl = filterDropdownRef.current;

    if (!referenceEl || !dropdownEl) {
      return;
    }

    const isSmallViewport = window.matchMedia('(max-width: 768px)').matches;
    const placement: Placement = isSmallViewport ? 'bottom' : 'bottom-end';

    popperInstanceRef.current?.destroy();
    popperInstanceRef.current = createPopper(referenceEl, dropdownEl, {
      placement,
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
        {
          name: 'flip',
          options: {
            padding: 12,
            fallbackPlacements: ['top-end', 'bottom-start', 'top-start', 'bottom'],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 12,
            altAxis: true,
            tether: true,
          },
        },
      ],
    });

    return () => {
      popperInstanceRef.current?.destroy();
      popperInstanceRef.current = null;
    };
  }, [isFilterDropdownOpen, activeFilterButtonIndex]);

  useEffect(() => {
    if (activeRowMenu === null) {
      return;
    }

    const closeRowMenu = () => {
      setActiveRowMenu(null);
    };

    window.addEventListener('resize', closeRowMenu);
    window.addEventListener('scroll', closeRowMenu, true);

    return () => {
      window.removeEventListener('resize', closeRowMenu);
      window.removeEventListener('scroll', closeRowMenu, true);
    };
  }, [activeRowMenu]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Default render for cell
  const defaultRenderCell = (value: any, column: Column<T>, row: T, index: number) => {
    if (column.key === 'status' || column.key.toLowerCase().includes('status')) {
      return <StatusBadge status={value} />;
    }
    return value;
  };

  const filterDropdown = isFilterDropdownOpen ? (
    <div
      ref={filterDropdownRef}
      className={styles.filterDropdown}
      role="dialog"
      aria-label="User table filters"
      style={{
        width: `${FILTER_DROPDOWN_WIDTH}px`,
      }}
    >
      <div className={styles.filterDropdownHeader}>
        <span className={styles.filterDropdownTitle}>Filter Users</span>
        <button
          className={styles.filterCloseButton}
          onClick={() => {
            setActiveFilterColumn(null);
            setActiveFilterButtonIndex(null);
          }}
          aria-label="Close filter"
        >
          <FaTimes />
        </button>
      </div>

      <div className={styles.filterDropdownContent}>
        {filters.map((filter) => (
          <div key={filter.key} className={styles.filterFieldGroup}>
            <label className={styles.filterLabel}>{filter.label}</label>
            {filter.type === 'select' ? (
              <div className={styles.filterSelectWrapper}>
                <select
                  className={styles.filterSelect}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  <option value="">Select {filter.label}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className={styles.filterSelectIcon} />
              </div>
            ) : filter.type === 'date' ? (
              <div className={styles.filterInputWrapper}>
                <input
                  type="date"
                  className={styles.filterInput}
                  placeholder={filter.placeholder || `Enter ${filter.label}`}
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
                <FaCalendarAlt className={styles.filterInputIcon} />
              </div>
            ) : (
              <input
                type={
                  filter.type === 'number'
                    ? 'number'
                    : filter.type === 'email'
                      ? 'email'
                      : filter.type === 'phone'
                        ? 'tel'
                        : 'text'
                }
                className={styles.filterInput}
                placeholder={filter.placeholder || `Enter ${filter.label}`}
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className={styles.filterDropdownFooter}>
        <button className={styles.filterResetButton} onClick={handleResetFilters}>
          Reset
        </button>
        <button className={styles.filterApplyButton} onClick={handleApplyFilters}>
          Filter
        </button>
      </div>
    </div>
  ) : null;

  const paginationNode = pagination ? (
    <div
      className={`${styles.pagination} ${paginationPlacement === 'outside' ? styles.paginationOutside : ''}`}
    >
      <Paginator
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
        showItemsPerPage={Boolean(pagination.onItemsPerPageChange)}
      />
    </div>
  ) : null;

  return (
    <div className={styles.tableLayout}>
      <div className={`${styles.tableContainer} ${className}`} style={{ maxHeight }}>
        <div className={`${styles.tableWrapper} ${tableClassName}`}>
          <table className={styles.table}>
          <thead className={`${styles.tableHead} ${headerClassName}`}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={column.key}
                  className={styles.tableHeaderCell}
                  style={{ width: column.width }}
                >
                  <div className={styles.headerCellContent}>
                    <span 
                      className={`${styles.headerTitle} ${column.sortable ? styles.sortable : ''}`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      {column.title}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className={styles.sortIndicator}>
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </span>
                    
                    {column.filterable && filters.some(f => f.key === column.key) && (
                      <button
                        ref={(el) => {
                          filterButtonRefs.current[index] = el;
                        }}
                        className={`${styles.filterButton} ${activeFilterColumn === column.key ? styles.filterButtonActive : ''}`}
                        onClick={() => toggleFilterDropdown(column.key, index)}
                        aria-label={`Filter by ${column.title}`}
                        aria-expanded={activeFilterColumn === column.key}
                      >
                        <img src="/media/icons/filter-icon.svg" alt="" className={styles.iconImage} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              
              {showRowActions && rowActions.length > 0 && (
                <th className={`${styles.tableHeaderCell} ${styles.actionsHeaderCell}`} style={{ width: '60px' }}>
                  <span className={styles.visuallyHidden}>Row actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className={styles.tableBody}>
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (showRowActions && rowActions.length > 0 ? 1 : 0)} 
                  className={styles.loadingCell}
                >
                  <div className={styles.loadingSpinner}>
                    <div className={styles.spinner} />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (showRowActions && rowActions.length > 0 ? 1 : 0)} 
                  className={styles.emptyCell}
                >
                  <div className={styles.emptyState}>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`${styles.tableRow} ${onRowClick ? styles.tableRowClickable : ''} ${rowClassName}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  onContextMenu={(e) => {
                    if (!(showRowActions && rowActions.length > 0)) {
                      return;
                    }
                    e.preventDefault();
                    openRowMenuAtPointer(rowIndex, e.clientX, e.clientY);
                  }}
                >
                  {columns.map(column => (
                    <td key={column.key} className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {column.render 
                          ? column.render(row[column.key], row, rowIndex)
                          : defaultRenderCell(row[column.key], column, row, rowIndex)
                        }
                      </div>
                    </td>
                  ))}

                  {showRowActions && rowActions.length > 0 && (
                    <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                      <div 
                        className={styles.rowActionsWrapper}
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          openRowMenuAtPointer(rowIndex, e.clientX, e.clientY);
                        }}
                        ref={(el) => {
                          rowMenuRefs.current[rowIndex] = el;
                        }}
                      >
                        <button
                          className={`${styles.rowMenuButton} ${activeRowMenu === rowIndex ? styles.rowMenuButtonActive : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowMenu(rowIndex);
                          }}
                          aria-label="More actions"
                          aria-expanded={activeRowMenu === rowIndex}
                        >
                          <img src="/media/icons/vertical-three-dots.svg" alt="" className={styles.iconImage} />
                        </button>

                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>

        {typeof document !== 'undefined' ? createPortal(filterDropdown, document.body) : filterDropdown}

        {activeRowMenu !== null && rowActions.length > 0 && sortedData[activeRowMenu] && (
          <div
            className={styles.rowMenuDropdown}
            role="menu"
            style={{
              top: `${rowMenuPosition.top}px`,
              left: `${rowMenuPosition.left}px`,
            }}
          >
            {rowActions.map((action) => (
              <button
                key={action.id}
                className={`${styles.rowMenuItem} ${action.className || ''}`}
                onClick={() => {
                  action.onClick(sortedData[activeRowMenu], activeRowMenu);
                  setActiveRowMenu(null);
                }}
                role="menuitem"
              >
                {action.icon && <span className={styles.rowMenuItemIcon}>{action.icon}</span>}
                <span className={styles.rowMenuItemLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        )}

        <Tooltip id="user-status-tooltip" place="top" className={styles.statusTooltip} />

        {paginationPlacement === 'inside' && paginationNode}
      </div>

      {paginationPlacement === 'outside' && paginationNode}
    </div>
  );
}

export default GenericTable;