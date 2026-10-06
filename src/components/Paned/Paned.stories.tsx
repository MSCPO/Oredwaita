import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, type FC, useState } from 'react';

import { Paned } from './Paned';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta<typeof Paned> = {
  title: 'Oredwaita/Paned',
  component: Paned,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

const paneStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontFamily: 'var(--ore-font-sans)',
  fontSize: 13,
  opacity: 0.7,
};

const startPaneStyle: CSSProperties = { ...paneStyle, backgroundColor: 'var(--ore-sidebar-bg-color)' };
const endPaneStyle: CSSProperties = { ...paneStyle, backgroundColor: 'var(--ore-view-bg-color)' };

const frameStyle: CSSProperties = {
  height: 220,
  border: '1px solid var(--ore-border-color)',
  borderRadius: 'var(--ore-border-radius-md)',
  overflow: 'hidden',
};

export const PanedHorizontal: StoryObj = {
  render: () => (
    <div style={frameStyle}>
      <Paned
        defaultPosition={180}
        minPosition={80}
        maxPosition={360}
        start={<div style={startPaneStyle}>Sidebar</div>}
        end={<div style={endPaneStyle}>Content</div>}
      />
    </div>
  ),
};

export const PanedVertical: StoryObj = {
  render: () => (
    <div style={{ ...frameStyle, height: 320 }}>
      <Paned
        orientation="vertical"
        defaultPosition={120}
        minPosition={60}
        maxPosition={240}
        start={<div style={startPaneStyle}>Header</div>}
        end={<div style={endPaneStyle}>Body</div>}
      />
    </div>
  ),
};

const PanedControlledDemo: FC = () => {
  const [position, setPosition] = useState(180);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={frameStyle}>
        <Paned
          position={position}
          onPositionChange={setPosition}
          minPosition={80}
          maxPosition={360}
          start={<div style={startPaneStyle}>Sidebar</div>}
          end={<div style={endPaneStyle}>Content</div>}
        />
      </div>
      <span style={{ fontFamily: 'var(--ore-font-sans)', fontSize: 13, opacity: 0.7 }}>Position: {position}px</span>
    </div>
  );
};

export const PanedControlled: StoryObj = {
  render: () => <PanedControlledDemo />,
};
