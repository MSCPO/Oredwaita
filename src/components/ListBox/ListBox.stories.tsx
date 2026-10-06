import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bluetooth, Moon, Palette, Rocket, Volume2, Wifi } from 'lucide-react';
import { type FC, useState } from 'react';

import { ListBox, type ListBoxItem } from './ListBox';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta<typeof ListBox> = {
  title: 'Oredwaita/ListBox',
  component: ListBox,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ maxWidth: 320 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

const iconSize = { size: 16 };

const appearanceItems: ListBoxItem[] = [
  { value: 'light', label: 'Light', icon: <Moon {...iconSize} /> },
  { value: 'dark', label: 'Dark', icon: <Moon {...iconSize} /> },
  { value: 'accent', label: 'Accent color', icon: <Palette {...iconSize} /> },
];

const connectivityItems: ListBoxItem[] = [
  { value: 'wifi', label: 'Wi-Fi', icon: <Wifi {...iconSize} /> },
  { value: 'bluetooth', label: 'Bluetooth', icon: <Bluetooth {...iconSize} /> },
  { value: 'network', label: 'Wired connection', disabled: true },
  { value: 'vpn', label: 'VPN', icon: <Volume2 {...iconSize} /> },
  { value: 'hotspot', label: 'Hotspot', icon: <Rocket {...iconSize} /> },
];

export const ListBoxSingle: StoryObj = {
  render: () => <ListBox items={appearanceItems} defaultValue="light" aria-label="Appearance" />,
};

export const ListBoxDisabledRow: StoryObj = {
  render: () => <ListBox items={connectivityItems} defaultValue="wifi" aria-label="Connectivity" />,
};

const ListBoxMultipleDemo: FC = () => {
  const [value, setValue] = useState<string[]>(['wifi', 'bluetooth']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ListBox
        items={connectivityItems}
        selectionMode="multiple"
        value={value}
        onChange={setValue}
        aria-label="Active services"
      />
      <span style={{ fontFamily: 'var(--ore-font-sans)', fontSize: 13, opacity: 0.7 }}>
        Selected: {value.join(', ')}
      </span>
    </div>
  );
};

export const ListBoxMultiple: StoryObj = {
  render: () => <ListBoxMultipleDemo />,
};
