import { type HTMLAttributes, type KeyboardEvent, type ReactNode, type Ref, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import cx from 'clsx';

import './ColumnView.scss';

/** One column of a ColumnView, describing the header and how each row cell is rendered. */
export interface ColumnViewColumn<Row> {
  /** Stable identifier of the column; also used as the sort key. */
  key: string;
  /** Header content rendered inside the column header cell. */
  title: ReactNode;
  /** Optional CSS width applied to the column header cell. */
  width?: string;
  /** Horizontal alignment shared by the header cell and every cell of the column. */
  align?: 'start' | 'center' | 'end';
  /** Makes the header clickable to cycle the sort direction. */
  sortable?: boolean;
  /** Comparator defining the ascending order; without it the header only reflects the sort state. */
  sort?: (a: Row, b: Row) => number;
  /** Renders the cell content of a row for this column. */
  render: (row: Row) => ReactNode;
}

export interface ColumnViewProps<Row> extends HTMLAttributes<HTMLDivElement> {
  /** Rows rendered as the table body, in display order. */
  rows: Row[];
  /** Column definitions rendered as the table header. */
  columns: ColumnViewColumn<Row>[];
  /** Derives the stable key of a row; selection is matched against it. */
  rowKey: (row: Row) => string;
  /** Whether rows can be selected; `single` keeps the selection when the selected row is clicked again. */
  selectionMode?: 'none' | 'single';
  /** Controlled selected row key; takes precedence over `defaultSelectedKey`. */
  selectedKey?: string | null;
  /** Initially selected row key for uncontrolled usage. */
  defaultSelectedKey?: string | null;
  /** Called with the selected row key after activation. */
  onSelectionChange?: (key: string | null) => void;
  /** Controlled sort key; takes precedence over `defaultSortKey`. */
  sortKey?: string | null;
  /** Initially sorted column key for uncontrolled usage. */
  defaultSortKey?: string | null;
  /** Controlled sort direction; takes precedence over `defaultSortDirection`. */
  sortDirection?: 'asc' | 'desc';
  /** Initially sorted direction for uncontrolled usage. */
  defaultSortDirection?: 'asc' | 'desc';
  /** Called with the next sort key and direction after a header click; the key is null when unsorted. */
  onSortChange?: (sortKey: string | null, direction: 'asc' | 'desc') => void;
  ref?: Ref<HTMLDivElement>;
}

interface SortState {
  key: string | null;
  direction: 'asc' | 'desc';
}

const alignModifier = (base: string, align: 'start' | 'center' | 'end' | undefined): string | undefined =>
  align === 'center' || align === 'end' ? `${base}--${align}` : undefined;

/**
 * ColumnView following the GtkColumnView semantics from the GNOME HIG.
 *
 * A tabular list where rows are activated to select them and sortable column
 * headers cycle through ascending, descending and unsorted states, as
 * described in the GNOME HIG.
 */
export function ColumnView<Row>({
  rows,
  columns,
  rowKey,
  selectionMode = 'single',
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  sortKey,
  defaultSortKey,
  sortDirection,
  defaultSortDirection,
  onSortChange,
  className,
  style,
  ref,
  ...rest
}: ColumnViewProps<Row>) {
  const [internalSelectedKey, setInternalSelectedKey] = useState<string | null>(defaultSelectedKey ?? null);
  const [internalSort, setInternalSort] = useState<SortState>(() => ({
    key: defaultSortKey ?? null,
    direction: defaultSortDirection ?? 'asc',
  }));

  const activeSelectedKey = selectedKey !== undefined ? selectedKey : internalSelectedKey;
  const activeSortKey = sortKey !== undefined ? sortKey : internalSort.key;
  const activeSortDirection = sortDirection !== undefined ? sortDirection : internalSort.direction;

  const sortedRows = useMemo(() => {
    if (activeSortKey === null) {
      return rows;
    }

    const column = columns.find((entry) => entry.key === activeSortKey);
    const comparator = column?.sort;

    if (!comparator) {
      return rows;
    }

    const factor = activeSortDirection === 'desc' ? -1 : 1;

    return [...rows].sort((a, b) => factor * comparator(a, b));
  }, [rows, columns, activeSortKey, activeSortDirection]);

  const handleRowActivate = (key: string) => {
    if (selectedKey === undefined) {
      setInternalSelectedKey(key);
    }
    onSelectionChange?.(key);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, key: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRowActivate(key);
    }
  };

  const handleSortClick = (column: ColumnViewColumn<Row>) => {
    const currentDirection = activeSortKey === column.key ? activeSortDirection : null;
    const nextDirection = currentDirection === null ? 'asc' : currentDirection === 'asc' ? 'desc' : null;
    const nextKey = nextDirection === null ? null : column.key;
    const reportedDirection = nextDirection ?? activeSortDirection;

    if (sortKey === undefined || sortDirection === undefined) {
      setInternalSort({
        key: sortKey === undefined ? nextKey : internalSort.key,
        direction: sortDirection === undefined ? reportedDirection : internalSort.direction,
      });
    }

    onSortChange?.(nextKey, reportedDirection);
  };

  const selectable = selectionMode === 'single';

  return (
    <div {...rest} ref={ref} className={cx('ore-column-view', className)} style={style}>
      <table className="ore-column-view__table">
        <thead>
          <tr>
            {columns.map((column) => {
              const sorted = column.key === activeSortKey;
              const sortState = sorted ? activeSortDirection : null;
              const SortIcon = sortState === 'asc' ? ArrowUp : sortState === 'desc' ? ArrowDown : ChevronsUpDown;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={sortState === 'asc' ? 'ascending' : sortState === 'desc' ? 'descending' : undefined}
                  className={cx(
                    'ore-column-view__header-cell',
                    alignModifier('ore-column-view__header-cell', column.align),
                  )}
                  style={column.width === undefined ? undefined : { width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className={cx('ore-column-view__sort-button', sorted && 'ore-column-view__sort-button--active')}
                      onClick={() => handleSortClick(column)}
                    >
                      {column.title}
                      <SortIcon aria-hidden="true" className="ore-column-view__sort-icon" size={14} />
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => {
            const key = rowKey(row);
            const selected = activeSelectedKey === key;

            return (
              <tr
                key={key}
                aria-selected={selectable ? selected : undefined}
                tabIndex={selectable ? 0 : undefined}
                onClick={selectable ? () => handleRowActivate(key) : undefined}
                onKeyDown={selectable ? (event) => handleRowKeyDown(event, key) : undefined}
                className={cx(
                  'ore-column-view__row',
                  selectable && 'ore-column-view__row--selectable',
                  selected && 'ore-column-view__row--selected',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx('ore-column-view__cell', alignModifier('ore-column-view__cell', column.align))}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
