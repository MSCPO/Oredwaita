import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Calendar } from './Calendar';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Calendar',
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
  render: () => <Calendar defaultValue={new Date()} onChange={(date) => console.info(date)} />,
};

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = useState(new Date());

    return <Calendar value={value} onChange={setValue} />;
  },
};

export const WeekStartsOnSunday: StoryObj = {
  render: () => <Calendar weekStartsOn={0} onChange={(date) => console.info(date)} />,
};
