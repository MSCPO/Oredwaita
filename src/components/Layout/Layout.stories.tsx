import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Folder, Settings } from 'lucide-react';

import { Clamp, WrapBox } from './Layout';
import { ApplicationWindow } from '../Window/Window';
import { ToolbarView } from '../ToolbarView/ToolbarView';
import { HeaderBar } from '../HeaderBar/HeaderBar';
import { ViewSwitcherBar } from '../ViewSwitcher/ViewSwitcher';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { Leaflet } from '../Leaflet/Leaflet';
import { BreakpointBin } from '../Breakpoint/Breakpoint';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Layout & Windows',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, height: 600 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const AppWindowDemo: StoryObj = {
  render: function UseAppWindow() {
    const [sheetOpen, setSheetOpen] = useState(false);

    return (
      <ApplicationWindow
        title="Oredwaita Desktop App"
        subtitle="v1.0.0"
        showControls
        content={
          <ToolbarView
            topBars={[
              <HeaderBar
                key="header"
                title="HeaderBar Inside ToolbarView"
                endTitleButtons={
                  <Button variant="suggested" onClick={() => setSheetOpen(true)}>
                    Open Sheet
                  </Button>
                }
              />,
            ]}
            content={
              <Clamp maximumSize="medium" style={{ padding: 24 }}>
                <h3>Constrained Content Area (Clamp)</h3>
                <p>This layout container is constrained to medium max width (600px) and stays centered.</p>
                <WrapBox spacing={12} style={{ marginTop: 24 }}>
                  <Button variant="default">Wrap Item 1</Button>
                  <Button variant="default">Wrap Item 2</Button>
                  <Button variant="default">Wrap Item 3</Button>
                  <Button variant="default">Wrap Item 4</Button>
                </WrapBox>

                <div style={{ marginTop: 24 }}>
                  <h4>Responsive BreakpointBin</h4>
                  <BreakpointBin>
                    {(bp) => (
                      <div style={{ padding: 16, background: 'var(--ore-card-bg-color)', borderRadius: 12 }}>
                        Current Active Breakpoint: <strong>{String(bp).toUpperCase()}</strong>
                      </div>
                    )}
                  </BreakpointBin>
                </div>
              </Clamp>
            }
            bottomBars={[
              <ViewSwitcherBar
                key="switcher"
                pages={[
                  { id: '1', title: 'Tab 1', icon: <Folder size={16} /> },
                  { id: '2', title: 'Tab 2', icon: <Settings size={16} /> },
                ]}
                activePage="1"
                onPageChange={() => {}}
              />,
            ]}
          />
        }
      >
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <h3>Bottom Sheet Drawer</h3>
          <p>This drawer slides up smoothly from the bottom of the screen.</p>
          <Button variant="suggested" onClick={() => setSheetOpen(false)}>
            Done
          </Button>
        </BottomSheet>
      </ApplicationWindow>
    );
  },
};

export const LeafletContainer: StoryObj = {
  render: () => (
    <Leaflet folded={false}>
      <div style={{ padding: 20, background: 'var(--ore-sidebar-bg-color)', height: '100%' }}>
        <h4>Left Leaflet Pane</h4>
      </div>
      <div style={{ padding: 20, background: 'var(--ore-view-bg-color)', height: '100%' }}>
        <h4>Right Leaflet Pane</h4>
      </div>
    </Leaflet>
  ),
};
