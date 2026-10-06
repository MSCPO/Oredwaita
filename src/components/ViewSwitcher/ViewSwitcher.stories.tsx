import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Compass, Home, User } from 'lucide-react';

import { InlineViewSwitcher, ViewStack, ViewSwitcher, ViewSwitcherBar, ViewSwitcherSidebar } from './ViewSwitcher';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/View Switchers',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const ViewSwitcherDemo: StoryObj = {
  render: function UseViewSwitcher() {
    const [page, setPage] = useState('home');

    const pages = [
      { id: 'home', title: 'Home', icon: <Home size={16} /> },
      { id: 'explore', title: 'Explore', icon: <Compass size={16} />, badge: 'New' },
      { id: 'profile', title: 'Profile', icon: <User size={16} /> },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ViewSwitcher pages={pages} activePage={page} onPageChange={setPage} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <InlineViewSwitcher pages={pages} activePage={page} onPageChange={setPage} />
        </div>

        <div style={{ border: '1px solid var(--ore-border-color)', borderRadius: 12, padding: 20 }}>
          <ViewStack activePage={page}>
            <div key="home" id="home">
              <h3>Home Feed</h3>
              <p>Welcome to the home page view.</p>
            </div>
            <div key="explore" id="explore">
              <h3>Explore Content</h3>
              <p>Discover trending items.</p>
            </div>
            <div key="profile" id="profile">
              <h3>User Profile</h3>
              <p>Manage user credentials.</p>
            </div>
          </ViewStack>
        </div>

        <ViewSwitcherBar pages={pages} activePage={page} onPageChange={setPage} />

        <div style={{ width: 260 }}>
          <ViewSwitcherSidebar pages={pages} activePage={page} onPageChange={setPage} title="Sidebar Navigation" />
        </div>
      </div>
    );
  },
};
