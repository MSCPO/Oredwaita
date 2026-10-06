import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FC, useState } from 'react';

import { ColumnView, type ColumnViewColumn } from './ColumnView';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

interface FileEntry {
  id: string;
  name: string;
  size: number;
  modified: string;
  kind: string;
}

const files: FileEntry[] = [
  { id: 'report', name: 'Quarterly report.pdf', size: 2_400_000, modified: 'Sep 14, 2026', kind: 'PDF document' },
  { id: 'notes', name: 'Meeting notes.txt', size: 12_400, modified: 'Sep 21, 2026', kind: 'Plain text' },
  { id: 'budget', name: 'Budget.ods', size: 341_000, modified: 'Sep 28, 2026', kind: 'Spreadsheet' },
  { id: 'photo', name: 'Vacation photo.jpg', size: 4_820_000, modified: 'Aug 30, 2026', kind: 'Image' },
  { id: 'demo', name: 'Song demo.mp3', size: 5_640_000, modified: 'Jul 12, 2026', kind: 'Audio' },
  { id: 'deck', name: 'Launch deck.pdf', size: 18_300_000, modified: 'Oct 2, 2026', kind: 'PDF document' },
];

const formatSize = (bytes: number): string =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;

const fileColumns: ColumnViewColumn<FileEntry>[] = [
  { key: 'name', title: 'Name', width: '40%', render: (row) => row.name },
  {
    key: 'size',
    title: 'Size',
    width: '20%',
    align: 'end',
    sortable: true,
    sort: (a, b) => a.size - b.size,
    render: (row) => formatSize(row.size),
  },
  { key: 'modified', title: 'Modified', width: '25%', render: (row) => row.modified },
  { key: 'kind', title: 'Type', width: '15%', render: (row) => row.kind },
];

const meta: Meta<typeof ColumnView> = {
  title: 'Oredwaita/ColumnView',
  component: ColumnView,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ maxWidth: 640 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const Basic: StoryObj = {
  render: () => <ColumnView rows={files} columns={fileColumns} rowKey={(row) => row.id} aria-label="Files" />,
};

const ControlledSelectionDemo: FC = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>('report');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ColumnView
        rows={files}
        columns={fileColumns}
        rowKey={(row) => row.id}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        aria-label="Files"
      />
      <span style={{ fontFamily: 'var(--ore-font-sans)', fontSize: 13, opacity: 0.7 }}>
        Selected: {selectedKey ?? 'none'}
      </span>
    </div>
  );
};

export const ControlledSelection: StoryObj = {
  render: () => <ControlledSelectionDemo />,
};

export const NoSelection: StoryObj = {
  render: () => (
    <ColumnView rows={files} columns={fileColumns} rowKey={(row) => row.id} selectionMode="none" aria-label="Files" />
  ),
};
