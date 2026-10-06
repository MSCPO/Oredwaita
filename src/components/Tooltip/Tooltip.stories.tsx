import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';
import { Tooltip } from './Tooltip';

const meta: Meta = {
  title: 'Oredwaita/Tooltip',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 100, display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const Top: StoryObj = {
  render: () => (
    <Tooltip content="Saves the current document" placement="top">
      <Button>Top</Button>
    </Tooltip>
  ),
};

export const Bottom: StoryObj = {
  render: () => (
    <Tooltip content="Saves the current document" placement="bottom">
      <Button>Bottom</Button>
    </Tooltip>
  ),
};

export const Left: StoryObj = {
  render: () => (
    <Tooltip content="Saves the current document" placement="left">
      <Button>Left</Button>
    </Tooltip>
  ),
};

export const Right: StoryObj = {
  render: () => (
    <Tooltip content="Saves the current document" placement="right">
      <Button>Right</Button>
    </Tooltip>
  ),
};

export const Controlled: StoryObj = {
  render: function ControlledTooltip() {
    const [open, setOpen] = useState(false);

    return (
      <Tooltip content="Rendered on demand" open={open} onOpenChange={setOpen} delay={200}>
        <Button variant="suggested">Hover me</Button>
      </Tooltip>
    );
  },
};
