import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FC, useState } from 'react';

import { Entry } from './Entry';
import { TextArea } from './TextArea';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta<typeof Entry> = {
  title: 'Oredwaita/Text Entry',
  component: Entry,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const EntryBasic: StoryObj = {
  render: () => <Entry placeholder="Enter your name" aria-label="Name" />,
};

const EntryControlledDemo: FC = () => {
  const [value, setValue] = useState('Type here');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Entry value={value} onChange={setValue} aria-label="Name" />
      <span style={{ fontFamily: 'var(--ore-font-sans)', fontSize: 13, opacity: 0.7 }}>Value: {value}</span>
    </div>
  );
};

export const EntryControlled: StoryObj = {
  render: () => <EntryControlledDemo />,
};

export const TextAreaBasic: StoryObj = {
  render: () => <TextArea placeholder="Share your feedback" aria-label="Feedback" />,
};

const TextAreaControlledDemo: FC = () => {
  const [value, setValue] = useState('Once upon a time');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TextArea value={value} onChange={setValue} aria-label="Feedback" />
      <span style={{ fontFamily: 'var(--ore-font-sans)', fontSize: 13, opacity: 0.7 }}>Value: {value}</span>
    </div>
  );
};

export const TextAreaControlled: StoryObj = {
  render: () => <TextAreaControlledDemo />,
};
