import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Apple, Banana, Cherry, Citrus, Grape } from 'lucide-react';

import { DropDown, type DropDownItem } from './DropDown';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/DropDown',
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

const fruitItems: DropDownItem[] = [
  { value: 'apple', label: 'Apple', icon: <Apple size={16} /> },
  { value: 'banana', label: 'Banana', icon: <Banana size={16} /> },
  { value: 'cherry', label: 'Cherry', icon: <Cherry size={16} /> },
  { value: 'grape', label: 'Grape', icon: <Grape size={16} /> },
];

const searchableItems: DropDownItem[] = [
  ...fruitItems,
  { value: 'orange', label: 'Orange', icon: <Citrus size={16} /> },
  { value: 'lime', label: 'Lime', icon: <Citrus size={16} /> },
  { value: 'durian', label: 'Durian', disabled: true },
];

export const Basic: StoryObj = {
  render: () => <DropDown items={fruitItems} placeholder="Choose a fruit" onChange={(value) => console.info(value)} />,
};

export const WithSearch: StoryObj = {
  render: () => (
    <DropDown
      items={searchableItems}
      enableSearch
      placeholder="Search fruits"
      onChange={(value) => console.info(value)}
    />
  ),
};

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = useState('apple');

    return <DropDown items={fruitItems} value={value} placeholder="Choose a fruit" onChange={setValue} />;
  },
};
