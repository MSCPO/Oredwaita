import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from '../Switch/Switch';
import { CheckButton, RadioButton, Scale, SpinButton } from './Controls';
import { ThemeProvider } from '../ThemeProvider/ThemeProvider';

const meta: Meta = {
  title: 'Oredwaita/Inputs & Controls',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ padding: 24, maxWidth: 500 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export const AllControls: StoryObj = {
  render: function UseControls() {
    const [switchState, setSwitchState] = useState(true);
    const [checkState, setCheckState] = useState(true);
    const [radioState, setRadioState] = useState('option1');
    const [scaleState, setScaleState] = useState(50);
    const [spinState, setSpinState] = useState(4);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h4>Switch Toggle</h4>
          <Switch checked={switchState} onChange={setSwitchState} />
        </div>

        <div>
          <h4>CheckButton</h4>
          <CheckButton checked={checkState} onChange={setCheckState} label="Enable Desktop Notifications" />
        </div>

        <div>
          <h4>RadioButton Group</h4>
          <div style={{ display: 'flex', gap: 16 }}>
            <RadioButton
              checked={radioState === 'option1'}
              onChange={() => setRadioState('option1')}
              label="Standard Quality"
            />
            <RadioButton
              checked={radioState === 'option2'}
              onChange={() => setRadioState('option2')}
              label="High Definition"
            />
          </div>
        </div>

        <div>
          <h4>Range Scale ({scaleState}%)</h4>
          <Scale value={scaleState} onChange={setScaleState} showValue />
        </div>

        <div>
          <h4>SpinButton Number Input</h4>
          <SpinButton value={spinState} onChange={setSpinState} min={1} max={10} />
        </div>
      </div>
    );
  },
};
