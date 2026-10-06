import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, File, FileText, Folder, Scissors, Trash } from 'lucide-react';

import { MenuButton, PopoverMenuItem, PopoverMenuSection } from './Popover';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Popover & Menus',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const PopoverMenuDemo: StoryObj = {
  render: () => (
    <MenuButton label="Application Menu" variant="suggested">
      <PopoverMenuSection title="Quick Actions">
        <PopoverMenuItem
          icon={<File size={16} />}
          label="New Document"
          shortcut="Ctrl+N"
          onClick={() => alert('New')}
        />
        <PopoverMenuItem
          icon={<Folder size={16} />}
          label="Open File..."
          shortcut="Ctrl+O"
          onClick={() => alert('Open')}
        />
      </PopoverMenuSection>

      <PopoverMenuSection title="Edit">
        <PopoverMenuItem icon={<Scissors size={16} />} label="Cut" shortcut="Ctrl+X" />
        <PopoverMenuItem icon={<Copy size={16} />} label="Copy" shortcut="Ctrl+C" />
        <PopoverMenuItem icon={<FileText size={16} />} label="Paste" shortcut="Ctrl+V" />
      </PopoverMenuSection>

      <PopoverMenuSection>
        <PopoverMenuItem
          icon={<Trash size={16} />}
          label="Delete Project"
          destructive
          onClick={() => alert('Delete')}
        />
      </PopoverMenuSection>
    </MenuButton>
  ),
};
