import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rocket } from 'lucide-react';

import { Avatar } from '../Avatar/Avatar';
import { Banner } from '../Banner/Banner';
import { StatusPage } from '../StatusPage/StatusPage';
import { Spinner } from '../Spinner/Spinner';
import { Carousel } from '../Carousel/Carousel';
import { Badge, FadingLabel, LevelBar, ProgressBar, ShortcutLabel } from './Indicators';
import { Button } from '../Button/Button';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Display & Indicators',
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

export const DisplayComponents: StoryObj = {
  render: function UseDisplay() {
    const [bannerVisible, setBannerVisible] = useState(true);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {bannerVisible && (
          <Banner
            title="System Maintenance Scheduled Tonight"
            actions={
              <Button variant="flat" size="sm" onClick={() => setBannerVisible(false)}>
                Dismiss
              </Button>
            }
          />
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar text="Alice Smith" size={48} />
          <Avatar text="Bob Johnson" size={48} />
          <Avatar text="Charlie" size={48} />
          <Spinner size={32} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="success">Success</Badge>
        </div>

        <div>
          <h4>Battery / LevelBar (80%)</h4>
          <LevelBar value={80} />
        </div>

        <div>
          <h4>Progress Bar (45%)</h4>
          <ProgressBar fraction={0.45} showText />
          <h4 style={{ marginTop: 12 }}>Pulsing Progress Bar</h4>
          <ProgressBar pulse />
        </div>

        <div>
          <h4>Keyboard Shortcut Badges</h4>
          <ShortcutLabel accelerator="Ctrl + Alt + Del" />
        </div>

        <div>
          <h4>Fading Marquee Label</h4>
          <FadingLabel>This is a long text label that smoothly fades out at the right boundary.</FadingLabel>
        </div>

        <div style={{ background: 'var(--ore-card-bg-color)', padding: 16, borderRadius: 12 }}>
          <h4>Carousel Slider</h4>
          <Carousel>
            <div style={{ padding: 30, textAlign: 'center', background: 'var(--ore-fill-selected)', borderRadius: 8 }}>
              Slide 1: Welcome
            </div>
            <div style={{ padding: 30, textAlign: 'center', background: 'var(--ore-fill-selected)', borderRadius: 8 }}>
              Slide 2: Features
            </div>
            <div style={{ padding: 30, textAlign: 'center', background: 'var(--ore-fill-selected)', borderRadius: 8 }}>
              Slide 3: Get Started
            </div>
          </Carousel>
        </div>

        <StatusPage
          icon={<Rocket size={48} />}
          title="Setup Completed"
          description="Your React Oredwaita workspace is ready for development."
        >
          <Button variant="suggested">Continue to App</Button>
        </StatusPage>
      </div>
    );
  },
};
