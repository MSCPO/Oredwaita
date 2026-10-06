import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lock, Palette } from 'lucide-react';

import { PreferencesGroup, PreferencesWindow } from './Preferences';
import { ActionRow, ComboRow, SwitchRow } from '../Rows/Rows';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Preferences',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: 600, width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const FullPreferencesWindow: StoryObj = {
  render: function UsePreferences() {
    const [darkMode, setDarkMode] = useState(true);
    const [lang, setLang] = useState('en');

    return (
      <PreferencesWindow
        pages={[
          {
            id: 'appearance',
            title: 'Appearance',
            icon: <Palette size={16} />,
            children: (
              <PreferencesGroup title="Theme & Color" description="Customize colors and appearance">
                <SwitchRow
                  title="Dark Mode"
                  subtitle="Use dark color palette"
                  active={darkMode}
                  onActiveChange={setDarkMode}
                />
                <ComboRow
                  title="Interface Language"
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Chinese', value: 'zh' },
                  ]}
                  selected={lang}
                  onSelect={setLang}
                />
              </PreferencesGroup>
            ),
          },
          {
            id: 'privacy',
            title: 'Privacy & Security',
            icon: <Lock size={16} />,
            children: (
              <PreferencesGroup title="Location Services" description="Control location access">
                <ActionRow title="Location Access" subtitle="Allowed for system apps" />
              </PreferencesGroup>
            ),
          },
        ]}
      />
    );
  },
};
