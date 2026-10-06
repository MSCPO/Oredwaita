import type { Meta, StoryObj } from '@storybook/react-vite';
import { Star } from 'lucide-react';

import { Button, ButtonContent } from './Button';
import { SplitButton } from '../SplitButton/SplitButton';
import { ToggleButton, ToggleGroup } from '../ToggleGroup/ToggleGroup';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta<typeof Button> = {
  title: 'Oredwaita/Buttons & Controls',
  component: Button,
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

export const ButtonVariants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="default">Default</Button>
      <Button variant="suggested">Suggested Action</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="flat">Flat Button</Button>
      <Button shape="pill" variant="suggested">
        Pill Button
      </Button>
      <Button shape="circular" variant="flat">
        <Star size={16} />
      </Button>
      <Button loading>Loading</Button>
    </div>
  ),
};

export const ButtonWithBadge: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="suggested">
        <ButtonContent label="Messages" badge="8" />
      </Button>
      <Button variant="default">
        <ButtonContent label="Notifications" badge="99+" />
      </Button>
    </div>
  ),
};

export const SplitButtonStory: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <SplitButton
        label="Download Latest"
        variant="suggested"
        onClick={() => alert('Main Action')}
        onDropdownClick={() => alert('Dropdown Options')}
      />
      <SplitButton
        label="Export Project"
        variant="default"
        onClick={() => alert('Export')}
        onDropdownClick={() => alert('Export Formats')}
      />
    </div>
  ),
};

export const ToggleGroupStory: StoryObj = {
  render: () => (
    <ToggleGroup value="day" onChange={(val) => alert(`Selected: ${val}`)}>
      <ToggleButton value="day">Day</ToggleButton>
      <ToggleButton value="week">Week</ToggleButton>
      <ToggleButton value="month">Month</ToggleButton>
      <ToggleButton value="year">Year</ToggleButton>
    </ToggleGroup>
  ),
};
