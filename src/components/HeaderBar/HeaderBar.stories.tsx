import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, Settings } from 'lucide-react';

import { HeaderBar, WindowTitle } from './HeaderBar';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta<typeof HeaderBar> = {
  title: 'Oredwaita/HeaderBar',
  component: HeaderBar,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, background: 'var(--ore-window-bg-color)' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const DefaultHeaderBar: StoryObj = {
  render: () => (
    <HeaderBar
      title="HeaderBar Title"
      subtitle="HeaderBar Subtitle"
      showBackButton
      onBackClick={() => alert('Back clicked')}
      startTitleButtons={<Button variant="flat">Edit</Button>}
      endTitleButtons={<Button variant="suggested">Save</Button>}
    />
  ),
};

export const CustomTitleWidget: StoryObj = {
  render: () => (
    <HeaderBar
      titleWidget={<WindowTitle title="Custom App Window" subtitle="v1.0.0" />}
      endTitleButtons={
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="flat" shape="circular">
            <Search size={16} />
          </Button>
          <Button variant="flat" shape="circular">
            <Settings size={16} />
          </Button>
        </div>
      }
    />
  ),
};
