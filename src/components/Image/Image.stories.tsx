import type { Meta, StoryObj } from '@storybook/react-vite';

import { Image } from './Image';
import { ThemeProvider } from '../ThemeProvider';

const svgIllustration =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%232a5ca8'/%3E%3Ccircle cx='120' cy='110' r='48' fill='%23f5c211'/%3E%3Crect x='220' y='70' width='140' height='18' rx='9' fill='%23ffffff' opacity='0.85'/%3E%3Crect x='220' y='104' width='100' height='18' rx='9' fill='%23ffffff' opacity='0.6'/%3E%3Crect x='60' y='210' width='280' height='18' rx='9' fill='%23ffffff' opacity='0.4'/%3E%3C/svg%3E";

const fits = ['contain', 'cover', 'fill', 'scale-down'] as const;

const meta: Meta<typeof Image> = {
  title: 'Oredwaita/Image',
  component: Image,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Image>;

export const Default: Story = {
  render: () => <Image src={svgIllustration} alt="Abstract illustration" width={320} />,
};

export const ContentFit: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {fits.map((fit) => (
        <figure key={fit} style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
          <Image src={svgIllustration} alt={`${fit} fit illustration`} fit={fit} width={180} height={120} />
          <figcaption>{fit}</figcaption>
        </figure>
      ))}
    </div>
  ),
};

export const Rounded: Story = {
  render: () => <Image src={svgIllustration} alt="Rounded illustration" fit="cover" width={280} height={180} rounded />,
};
