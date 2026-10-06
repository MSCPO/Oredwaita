import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { TabBar, TabView } from './Tabs';

const meta: Meta<typeof TabBar> = {
  title: 'Oredwaita/TabBar',
  component: TabBar,
};

export const Default: StoryObj = {
  render: function UseTabBar() {
    const [activeTab, setActiveTab] = useState('tab1');
    const [tabs, setTabs] = useState([
      { id: 'tab1', title: 'First Tab' },
      { id: 'tab2', title: 'Second Tab' },
      { id: 'tab3', title: 'Third Tab' },
    ]);

    return (
      <div style={{ padding: 20 }}>
        <TabBar
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          onTabClose={(id) => setTabs(tabs.filter((t) => t.id !== id))}
          onNewTab={() => {
            const newId = `tab${tabs.length + 1}`;
            setTabs([...tabs, { id: newId, title: `Tab ${tabs.length + 1}` }]);
            setActiveTab(newId);
          }}
        />
        <TabView activeTabId={activeTab} style={{ padding: 20 }}>
          <div key="tab1" id="tab1">
            First tab content panel
          </div>
          <div key="tab2" id="tab2">
            Second tab content panel
          </div>
          <div key="tab3" id="tab3">
            Third tab content panel
          </div>
        </TabView>
      </div>
    );
  },
};

export default meta;
