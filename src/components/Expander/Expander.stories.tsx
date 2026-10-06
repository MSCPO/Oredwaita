import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Palette, Shield, Wifi } from 'lucide-react';

import { Expander } from './Expander';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Expander',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, maxWidth: 480 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const Basic: StoryObj = {
  render: () => (
    <Expander title="Advanced Options">
      <p>Additional settings live here.</p>
    </Expander>
  ),
};

export const WithIcon: StoryObj = {
  render: () => (
    <Expander title="Network" icon={<Wifi size={16} />}>
      <p>Wi-Fi, VPN and proxy settings.</p>
    </Expander>
  ),
};

export const DefaultExpanded: StoryObj = {
  render: () => (
    <Expander title="Security" icon={<Shield size={16} />} defaultExpanded>
      <p>TLS and certificate options.</p>
    </Expander>
  ),
};

export const Controlled: StoryObj = {
  render: function ControlledExpander() {
    const [expanded, setExpanded] = useState(false);

    return (
      <Expander title="Appearance" icon={<Palette size={16} />} expanded={expanded} onExpandedChange={setExpanded}>
        <p>Accent color and theme overrides.</p>
      </Expander>
    );
  },
};
