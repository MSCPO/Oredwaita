import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Star, Zap } from 'lucide-react';

import {
  AboutDialog,
  ActionRow,
  Avatar,
  Badge,
  Banner,
  Button,
  ButtonContent,
  CheckButton,
  Clamp,
  ComboRow,
  EntryRow,
  ExpanderRow,
  HeaderBar,
  LevelBar,
  LinkRow,
  MessageDialog,
  type OreColorScheme,
  PasswordEntryRow,
  PreferencesGroup,
  PreferencesPage,
  ProgressBar,
  RadioButton,
  Scale,
  ShortcutLabel,
  ShortcutRow,
  SpinButton,
  Spinner,
  SpinRow,
  SplitButton,
  StatusPage,
  Switch,
  SwitchRow,
  ThemeProvider,
  Toast,
  ToggleButton,
  ToggleGroup,
  useOreTheme,
  ViewSwitcher,
} from './index';

const OredwaitaDemo = () => {
  const { colorScheme, setColorScheme } = useOreTheme();

  // State hooks for interactive elements
  const [switchVal, setSwitchVal] = useState(true);
  const [checkVal, setCheckVal] = useState(true);
  const [radioVal, setRadioVal] = useState('a');
  const [scaleVal, setScaleVal] = useState(65);
  const [spinVal, setSpinVal] = useState(3);
  const [entryVal, setEntryVal] = useState('John Doe');
  const [comboVal, setComboVal] = useState('option2');
  const [activeTab, setActiveTab] = useState('general');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <HeaderBar
        title="OreDwaita Component Library"
        subtitle="Full GTK4 / HIG UI Port"
        endTitleButtons={
          <ToggleGroup value={colorScheme} onChange={(val) => setColorScheme(val as OreColorScheme)}>
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
            <ToggleButton value="system">System</ToggleButton>
          </ToggleGroup>
        }
      />

      <div style={{ marginTop: 24 }}>
        {/* View Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ViewSwitcher
            pages={[
              { id: 'general', title: 'General Controls' },
              { id: 'rows', title: 'List Rows & Preferences' },
              { id: 'dialogs', title: 'Dialogs & Status' },
            ]}
            activePage={activeTab}
            onPageChange={setActiveTab}
          />
        </div>

        <Clamp maximumSize="medium">
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Banner */}
              <Banner
                title="Welcome to OreDwaita!"
                actions={
                  <Button variant="flat" size="sm" onClick={() => alert('OreDwaita 6.0')}>
                    Learn More
                  </Button>
                }
              />

              {/* Buttons */}
              <PreferencesGroup title="Buttons & Actions">
                <div style={{ padding: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Button variant="default">Default Button</Button>
                  <Button variant="suggested">Suggested Action</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="flat">Flat Button</Button>
                  <Button shape="pill" variant="suggested">
                    Pill Shape
                  </Button>
                  <Button shape="circular" variant="flat">
                    <Star size={16} />
                  </Button>
                  <Button loading>Loading</Button>
                  <SplitButton
                    label="Split Action"
                    onClick={() => alert('Main clicked')}
                    onDropdownClick={() => alert('Dropdown clicked')}
                  />
                  <Button>
                    <ButtonContent label="Downloads" badge="12" />
                  </Button>
                </div>
              </PreferencesGroup>

              {/* Controls */}
              <PreferencesGroup title="Controls & Inputs">
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Switch checked={switchVal} onChange={setSwitchVal} />
                    <span>Switch State: {switchVal ? 'ON' : 'OFF'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <CheckButton checked={checkVal} onChange={setCheckVal} label="Checkbox Option" />
                    <RadioButton checked={radioVal === 'a'} onChange={() => setRadioVal('a')} label="Radio A" />
                    <RadioButton checked={radioVal === 'b'} onChange={() => setRadioVal('b')} label="Radio B" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                      Range Scale ({scaleVal}%)
                    </label>
                    <Scale value={scaleVal} onChange={setScaleVal} showValue />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Numerical Spin:</span>
                    <SpinButton value={spinVal} onChange={setSpinVal} min={0} max={10} />
                  </div>
                </div>
              </PreferencesGroup>

              {/* Indicators */}
              <PreferencesGroup title="Indicators & Avatars">
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <Avatar text="Oredwaita User" size={48} />
                  <Avatar text="Alice Smith" size={48} />
                  <Spinner size={28} />
                  <Badge variant="accent">Active</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="success">Completed</Badge>
                  <ShortcutLabel accelerator="Ctrl+Shift+P" />
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <LevelBar value={75} />
                    <ProgressBar fraction={0.65} showText style={{ marginTop: 8 }} />
                  </div>
                </div>
              </PreferencesGroup>
            </div>
          )}

          {activeTab === 'rows' && (
            <PreferencesPage id="pref" title="Preferences Page" description="Manage your application settings">
              <PreferencesGroup title="Account & Identity" description="Personal information and credentials">
                <EntryRow
                  title="Display Name"
                  subtitle="Your public visible username"
                  value={entryVal}
                  onChange={setEntryVal}
                />
                <PasswordEntryRow
                  title="Password"
                  subtitle="Keep your secret credentials safe"
                  value="secret123"
                  onChange={() => {}}
                />
                <ComboRow
                  title="Language"
                  subtitle="Select interface language"
                  options={[
                    { label: 'English (US)', value: 'en' },
                    { label: 'Chinese (Simplified)', value: 'zh' },
                    { label: 'Japanese', value: 'ja' },
                  ]}
                  selected={comboVal}
                  onSelect={setComboVal}
                />
              </PreferencesGroup>

              <PreferencesGroup title="System & Behavior">
                <SwitchRow
                  title="Dark Mode Automation"
                  subtitle="Follow system color preferences automatically"
                  active={switchVal}
                  onActiveChange={setSwitchVal}
                />
                <SpinRow
                  title="Maximum Worker Threads"
                  subtitle="Parallel CPU worker thread allocation"
                  value={spinVal}
                  onChange={setSpinVal}
                  min={1}
                  max={16}
                />
                <ExpanderRow title="Advanced Network Options" subtitle="Proxy, SSL, and timeout configurations">
                  <ActionRow title="Proxy Server Host" subtitle="127.0.0.1:7890" />
                  <ActionRow title="Connection Timeout" subtitle="30000ms" />
                </ExpanderRow>
                <LinkRow title="GNOME HIG Guidelines Documentation" uri="https://developer.gnome.org/hig/" />
                <ShortcutRow title="Open Settings Dialog" accelerator="Ctrl+Comma" />
              </PreferencesGroup>
            </PreferencesPage>
          )}

          {activeTab === 'dialogs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <StatusPage
                icon={<Zap size={48} />}
                title="Oredwaita Component Showcase"
                description="Everything has been fully ported into React components with TypeScript and SCSS styling."
                children={
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="suggested" onClick={() => setDialogOpen(true)}>
                      Open Message Dialog
                    </Button>
                    <Button variant="default" onClick={() => setAboutOpen(true)}>
                      About App Dialog
                    </Button>
                  </div>
                }
              />

              <Toast
                title="Operation completed successfully"
                actions={
                  <Button variant="suggested" size="sm" onClick={() => alert('Undo clicked')}>
                    Undo
                  </Button>
                }
              />

              <MessageDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                heading="Discard unsaved changes?"
                body="You have uncommitted modifications in your preferences. Are you sure you want to proceed?"
                responses={[
                  { id: 'cancel', label: 'Cancel', appearance: 'default' },
                  { id: 'discard', label: 'Discard', appearance: 'destructive' },
                ]}
                onResponse={(id) => alert(`Selected: ${id}`)}
              />

              <AboutDialog
                open={aboutOpen}
                onClose={() => setAboutOpen(false)}
                applicationName="OreDwaita"
                version="1.0.0"
                developerName="Kai Hotz"
                comments="A React component library following the GNOME HIG."
                website="https://github.com/MSCPO/Oredwaita"
              />
            </div>
          )}
        </Clamp>
      </div>
    </div>
  );
};

export const Showcase: StoryObj = {
  render: () => (
    <ThemeProvider defaultColorScheme="system">
      <OredwaitaDemo />
    </ThemeProvider>
  ),
};

const meta: Meta<typeof OredwaitaDemo> = {
  title: 'Oredwaita/Full Component Showcase',
  component: OredwaitaDemo,
};

export default meta;
