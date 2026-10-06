import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ColorPicker } from './ColorPicker';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/ColorPicker',
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
  render: () => <ColorPicker onChange={(color) => console.info(color)} />,
};

export const WithAlpha: StoryObj = {
  render: () => <ColorPicker showAlpha onChange={(color) => console.info(color)} />,
};

export const Controlled: StoryObj = {
  render: () => {
    const [color, setColor] = useState('#3584e4');

    return <ColorPicker value={color} showAlpha onChange={setColor} />;
  },
};
