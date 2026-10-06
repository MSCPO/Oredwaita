import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Folder, Hand, Home, Settings } from 'lucide-react';

import { Flap, NavigationSplitView, NavigationView, OverlaySplitView } from './Navigation';
import { Swipeable } from './SwipeTracker';
import { Sidebar, SidebarItem, SidebarSection } from '../Sidebar/Sidebar';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Navigation & Split Views',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: 500, width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const SplitView: StoryObj = {
  render: function UseSplitView() {
    const [selected, setSelected] = useState('home');

    return (
      <NavigationSplitView
        sidebar={
          <Sidebar>
            <SidebarSection title="Navigation">
              <SidebarItem
                id="home"
                title="Home"
                icon={<Home size={16} />}
                selected={selected === 'home'}
                onSelect={() => setSelected('home')}
              />
              <SidebarItem
                id="files"
                title="Documents"
                icon={<Folder size={16} />}
                badge="12"
                selected={selected === 'files'}
                onSelect={() => setSelected('files')}
              />
              <SidebarItem
                id="settings"
                title="Settings"
                icon={<Settings size={16} />}
                selected={selected === 'settings'}
                onSelect={() => setSelected('settings')}
              />
            </SidebarSection>
          </Sidebar>
        }
        content={
          <div style={{ padding: 24 }}>
            <h2>Active Pane: {selected.toUpperCase()}</h2>
            <p>This is the content panel of NavigationSplitView.</p>
          </div>
        }
      />
    );
  },
};

export const NavigationViewStack: StoryObj = {
  render: () => (
    <NavigationView
      initialPageId="page1"
      pages={[
        {
          id: 'page1',
          title: 'First Screen',
          content: (
            <div style={{ padding: 24 }}>
              <h3>Root Screen</h3>
              <p>Welcome to page 1.</p>
            </div>
          ),
        },
        {
          id: 'page2',
          title: 'Second Screen',
          content: (
            <div style={{ padding: 24 }}>
              <h3>Nested Detail Screen</h3>
              <p>Detail content on page 2.</p>
            </div>
          ),
        },
      ]}
    />
  ),
};

export const OverlayDrawer: StoryObj = {
  render: function UseOverlay() {
    const [open, setOpen] = useState(false);

    return (
      <OverlaySplitView
        sidebarVisible={open}
        onSidebarVisibleChange={setOpen}
        sidebar={
          <div style={{ padding: 20 }}>
            <h3>Drawer Menu</h3>
            <Button onClick={() => setOpen(false)}>Close Drawer</Button>
          </div>
        }
        content={
          <div style={{ padding: 24 }}>
            <Button variant="suggested" onClick={() => setOpen(true)}>
              Open Drawer
            </Button>
          </div>
        }
      />
    );
  },
};

export const FlapPanel: StoryObj = {
  render: () => (
    <Flap
      position="start"
      flap={
        <div style={{ padding: 16 }}>
          <h4>Flap Side Pane</h4>
        </div>
      }
      content={
        <div style={{ padding: 24 }}>
          <h3>Main Flap Area</h3>
        </div>
      }
    />
  ),
};

export const SwipeGesture: StoryObj = {
  render: () => (
    <Swipeable onSwipeRight={() => alert('Swiped Right')} onSwipeLeft={() => alert('Swiped Left')} className="ore-card">
      <div
        style={{
          padding: 30,
          textAlign: 'center',
          background: 'var(--ore-card-bg-color)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Hand size={20} /> Swipe Left or Right on Touch Device
      </div>
    </Swipeable>
  ),
};
