import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { AboutDialog, MessageDialog, ShortcutsDialog } from './Dialog';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Dialogs & Modals',
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

export const AllDialogs: StoryObj = {
  render: function UseDialogs() {
    const [msgOpen, setMsgOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    return (
      <div style={{ display: 'flex', gap: 16 }}>
        <Button variant="suggested" onClick={() => setMsgOpen(true)}>
          Open Message Dialog
        </Button>
        <Button variant="default" onClick={() => setAboutOpen(true)}>
          Open About Dialog
        </Button>
        <Button variant="flat" onClick={() => setShortcutsOpen(true)}>
          Open Shortcuts Dialog
        </Button>

        <MessageDialog
          open={msgOpen}
          onClose={() => setMsgOpen(false)}
          heading="Permanently Delete File?"
          body="This action cannot be undone. All associated data will be removed immediately."
          responses={[
            { id: 'cancel', label: 'Cancel', appearance: 'default' },
            { id: 'delete', label: 'Delete File', appearance: 'destructive' },
          ]}
          onResponse={(id) => alert(`Action: ${id}`)}
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

        <ShortcutsDialog
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
          sections={[
            {
              title: 'General Navigation',
              shortcuts: [
                { title: 'Open Settings', accelerator: 'Ctrl + Comma' },
                { title: 'New Tab', accelerator: 'Ctrl + T' },
                { title: 'Close Active Window', accelerator: 'Ctrl + W' },
              ],
            },
            {
              title: 'Editor Actions',
              shortcuts: [
                { title: 'Format Source Code', accelerator: 'Ctrl + Shift + F' },
                { title: 'Quick Search Symbol', accelerator: 'Ctrl + P' },
              ],
            },
          ]}
        />
      </div>
    );
  },
};
