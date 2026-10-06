import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen, Edit, Globe, Key, RefreshCw, Search, Settings, Shield, Zap } from 'lucide-react';

import {
  ActionRow,
  ComboRow,
  EntryRow,
  ExpanderRow,
  LinkRow,
  PasswordEntryRow,
  ShortcutRow,
  SpinRow,
  SwitchRow,
} from './Rows';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/List Rows',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, maxWidth: 650 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const AllRows: StoryObj = {
  render: function UseRows() {
    const [switchVal, setSwitchVal] = useState(true);
    const [entryVal, setEntryVal] = useState('My Workspace');
    const [comboVal, setComboVal] = useState('en');
    const [spinVal, setSpinVal] = useState(4);

    return (
      <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <ActionRow
          title="Basic Action Row"
          subtitle="Clickable row item with secondary description"
          prefix={<Settings size={16} />}
          activatable
          onClick={() => alert('Row clicked')}
        />
        <SwitchRow
          title="Automatic Updates"
          subtitle="Download and install patches in background"
          prefix={<RefreshCw size={16} />}
          active={switchVal}
          onActiveChange={setSwitchVal}
        />
        <EntryRow
          title="Workspace Name"
          subtitle="Change default workspace title"
          prefix={<Edit size={16} />}
          value={entryVal}
          onChange={setEntryVal}
        />
        <PasswordEntryRow
          title="API Access Token"
          subtitle="Secret authentication key"
          prefix={<Key size={16} />}
          value="super-secret-key"
          onChange={() => {}}
        />
        <ComboRow
          title="Primary Language"
          subtitle="System interface language"
          prefix={<Globe size={16} />}
          options={[
            { label: 'English (US)', value: 'en' },
            { label: 'Chinese (Simplified)', value: 'zh' },
            { label: 'Spanish', value: 'es' },
          ]}
          selected={comboVal}
          onSelect={setComboVal}
        />
        <SpinRow
          title="Max Concurrent Downloads"
          subtitle="Limit active network requests"
          prefix={<Zap size={16} />}
          value={spinVal}
          onChange={setSpinVal}
          min={1}
          max={10}
        />
        <ExpanderRow
          title="Advanced Security Parameters"
          subtitle="Expand for SSL, Firewall & Encryption settings"
          prefix={<Shield size={16} />}
        >
          <ActionRow title="TLS 1.3 Strict Mode" subtitle="Enforce highest encryption standards" />
          <ActionRow title="Certificates Store" subtitle="System trusted root CA anchors" />
        </ExpanderRow>
        <LinkRow
          title="GNOME Human Interface Guidelines"
          subtitle="Official GNOME HIG documentation website"
          prefix={<BookOpen size={16} />}
          uri="https://developer.gnome.org/hig/"
        />
        <ShortcutRow
          title="Open Quick Search"
          subtitle="Trigger global search modal"
          prefix={<Search size={16} />}
          accelerator="Ctrl + Shift + F"
        />
      </div>
    );
  },
};
