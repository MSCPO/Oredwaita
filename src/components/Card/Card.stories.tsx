import type { Meta, StoryObj } from '@storybook/react-vite';
import { Moon, Palette, RotateCcw, Sun } from 'lucide-react';

import { Card, CardBody, CardFooter, CardHeader } from './Card';
import { ThemeProvider } from '../ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Cards',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, maxWidth: 420 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const BasicCard: StoryObj = {
  render: () => (
    <Card>
      <CardBody>
        <strong>Appearance</strong>
        <p style={{ margin: '4px 0 0' }}>Group related settings and content inside a rounded card.</p>
      </CardBody>
    </Card>
  ),
};

export const InteractiveCard: StoryObj = {
  render: () => (
    <Card interactive onClick={() => console.info('Card clicked')}>
      <CardHeader title="Night Light" subtitle="Reduce blue light after sunset" icon={<Moon size={18} />} />
      <CardBody>Tint the display amber in the evening to help you fall asleep.</CardBody>
    </Card>
  ),
};

export const FullAnatomy: StoryObj = {
  render: () => (
    <Card>
      <CardHeader
        title="Color Scheme"
        subtitle="Choose the interface style"
        icon={<Palette size={18} />}
        actions={
          <span style={{ display: 'inline-flex', gap: 4 }}>
            <Sun size={18} />
            <Moon size={18} />
          </span>
        }
      />
      <CardBody>
        Cards group related rows and content. The header holds a title, subtitle, icon and trailing actions, while the
        body carries the main content.
      </CardBody>
      <CardFooter>
        <RotateCcw size={16} />
        Reset to default
      </CardFooter>
    </Card>
  ),
};
