import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from './Separator';
import { ThemeProvider } from '../ThemeProvider';

const meta: Meta<typeof Separator> = {
  title: 'Oredwaita/Separator',
  component: Separator,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span>Above the separator</span>
      <Separator />
      <span>Below the separator</span>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const WithinContent: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span>Settings group one</span>
      <Separator />
      <span>Settings group two</span>
      <Separator />
      <span>Settings group three</span>
    </div>
  ),
};
