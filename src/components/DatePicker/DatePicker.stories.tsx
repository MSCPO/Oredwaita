import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { DatePicker } from './DatePicker';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/DatePicker',
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

export const Basic: StoryObj = {
  render: () => <DatePicker onChange={(date) => console.info(date)} />,
};

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = useState(new Date());

    return <DatePicker value={value} onChange={setValue} />;
  },
};
