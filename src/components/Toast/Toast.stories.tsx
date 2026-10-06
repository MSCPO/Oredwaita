import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Trash2, Wifi } from 'lucide-react';

import { Toast } from './Toast';
import { ToastProvider, useToast } from './ToastContext';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Toast',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div
          style={{
            position: 'relative',
            height: 320,
            maxWidth: 560,
            padding: 24,
            boxSizing: 'border-box',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const Static: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Toast title="Simple notification" timeout={0} />
      <Toast title="Connected to network" icon={<Wifi size={16} />} timeout={0} />
      <Toast
        title="File deleted"
        timeout={0}
        actions={
          <Button variant="suggested" size="sm" onClick={() => {}}>
            Undo
          </Button>
        }
      />
    </div>
  ),
};

export const Timed: StoryObj = {
  render: function TimedToast() {
    const [visible, setVisible] = useState(true);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <Button size="sm" disabled={visible} onClick={() => setVisible(true)}>
          Show toast again
        </Button>
        {visible && (
          <Toast title="Operation completed successfully" timeout={4000} onDismiss={() => setVisible(false)} />
        )}
      </div>
    );
  },
};

export const PushNotifications: StoryObj = {
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  render: function PushToasts() {
    const { addToast } = useToast();

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button size="sm" onClick={() => addToast({ title: 'Files copied successfully' })}>
          Simple toast
        </Button>
        <Button
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={() =>
            addToast({
              title: 'File moved to trash',
              actions: (
                <Button variant="suggested" size="sm" onClick={() => addToast({ title: 'File restored' })}>
                  Undo
                </Button>
              ),
            })
          }
        >
          Toast with action
        </Button>
        <Button size="sm" onClick={() => addToast({ title: 'Connected to network', icon: <Wifi size={16} /> })}>
          Toast with icon
        </Button>
      </div>
    );
  },
};
