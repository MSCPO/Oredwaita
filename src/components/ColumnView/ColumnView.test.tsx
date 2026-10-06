import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColumnView, type ColumnViewColumn, type ColumnViewProps } from './ColumnView';

interface FileRow {
  id: string;
  name: string;
  size: number;
  kind: string;
}

const rows: FileRow[] = [
  { id: 'b', name: 'Banana report', size: 20, kind: 'PDF' },
  { id: 'a', name: 'Apple notes', size: 10, kind: 'TXT' },
  { id: 'c', name: 'Cherry photo', size: 30, kind: 'PNG' },
];

const columns: ColumnViewColumn<FileRow>[] = [
  { key: 'name', title: 'Name', render: (row) => row.name },
  {
    key: 'size',
    title: 'Size',
    align: 'end',
    sortable: true,
    sort: (a, b) => a.size - b.size,
    render: (row) => row.size,
  },
  { key: 'kind', title: 'Kind', render: (row) => row.kind },
];

type TableProps = Partial<ColumnViewProps<FileRow>> & { 'data-testid'?: string };

const renderTable = (props: TableProps = {}) =>
  render(<ColumnView rows={rows} columns={columns} rowKey={(row) => row.id} {...props} />);

const bodyRows = () => screen.getAllByRole('row').slice(1);

describe('<ColumnView />', () => {
  const user = userEvent.setup();

  it('should render the column header titles', () => {
    renderTable();

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Size' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Kind' })).toBeInTheDocument();
  });

  it('should render row cells through the column render functions', () => {
    renderTable();

    expect(screen.getByRole('cell', { name: 'Apple notes' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'PNG' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
  });

  it('should match selectedKey against rowKey', () => {
    renderTable({ selectedKey: 'a' });

    expect(screen.getByRole('row', { name: /Apple notes/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('row', { name: /Banana report/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('should select a row on click and report its key', async () => {
    const onSelectionChange = vi.fn();
    renderTable({ onSelectionChange });

    const cherry = screen.getByRole('row', { name: /Cherry photo/ });
    await user.click(cherry);

    expect(onSelectionChange).toHaveBeenCalledWith('c');
    expect(cherry).toHaveAttribute('aria-selected', 'true');
  });

  it('should apply defaultSelectedKey initially', () => {
    renderTable({ defaultSelectedKey: 'b' });

    expect(screen.getByRole('row', { name: /Banana report/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('row', { name: /Apple notes/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('should keep the controlled selection while reporting changes', async () => {
    const onSelectionChange = vi.fn();
    renderTable({ selectedKey: 'a', onSelectionChange });

    await user.click(screen.getByRole('row', { name: /Cherry photo/ }));

    expect(onSelectionChange).toHaveBeenCalledWith('c');
    expect(screen.getByRole('row', { name: /Apple notes/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('row', { name: /Cherry photo/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('should keep the selection when clicking the selected row again', async () => {
    const onSelectionChange = vi.fn();
    renderTable({ defaultSelectedKey: 'a', onSelectionChange });

    const apple = screen.getByRole('row', { name: /Apple notes/ });
    await user.click(apple);

    expect(onSelectionChange).toHaveBeenCalledWith('a');
    expect(apple).toHaveAttribute('aria-selected', 'true');
  });

  it('should not select rows in selectionMode none', async () => {
    const onSelectionChange = vi.fn();
    renderTable({ selectionMode: 'none', onSelectionChange });

    await user.click(screen.getByRole('row', { name: /Apple notes/ }));

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByRole('row', { name: /Apple notes/ })).not.toHaveAttribute('aria-selected');
  });

  it('should cycle sort directions and reorder rows with a comparator', async () => {
    const onSortChange = vi.fn();
    renderTable({ onSortChange });

    const sizeHeader = screen.getByRole('button', { name: 'Size' });

    await user.click(sizeHeader);
    expect(onSortChange).toHaveBeenCalledWith('size', 'asc');
    expect(within(bodyRows()[0]).getByText('Apple notes')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'ascending');

    await user.click(sizeHeader);
    expect(onSortChange).toHaveBeenCalledWith('size', 'desc');
    expect(within(bodyRows()[0]).getByText('Cherry photo')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('should mark only the sorted column with aria-sort', async () => {
    renderTable();

    expect(screen.getByRole('columnheader', { name: 'Size' })).not.toHaveAttribute('aria-sort');

    await user.click(screen.getByRole('button', { name: 'Size' }));

    expect(screen.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');
  });

  it('should not reorder rows for a sortable column without a comparator', async () => {
    const columnsWithoutSort: ColumnViewColumn<FileRow>[] = [
      { key: 'name', title: 'Name', sortable: true, render: (row) => row.name },
    ];
    const onSortChange = vi.fn();
    renderTable({ columns: columnsWithoutSort, onSortChange });

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
    expect(within(bodyRows()[0]).getByText('Banana report')).toBeInTheDocument();
  });

  it('should keep the controlled sort while reporting changes', async () => {
    const onSortChange = vi.fn();
    renderTable({ sortKey: 'size', sortDirection: 'desc', onSortChange });

    expect(within(bodyRows()[0]).getByText('Cherry photo')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Size' }));

    expect(onSortChange).toHaveBeenCalledWith(null, 'desc');
    expect(within(bodyRows()[0]).getByText('Cherry photo')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('should merge the className with the block class', () => {
    renderTable({ className: 'extra-class', 'data-testid': 'column-view' });

    expect(screen.getByTestId('column-view')).toHaveClass('ore-column-view', 'extra-class');
  });

  it('should forward extra props and style to the root element', () => {
    renderTable({ 'data-testid': 'column-view', style: { color: 'rgb(255, 0, 0)' } });

    const root = screen.getByTestId('column-view');
    expect(root).toHaveClass('ore-column-view');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
