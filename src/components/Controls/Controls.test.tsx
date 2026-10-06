import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CheckButton, RadioButton, Scale, SpinButton } from './Controls';

const ControlledCheckButton = ({ onChange }: { onChange?: (checked: boolean) => void }) => {
  const [checked, setChecked] = useState(false);

  return (
    <CheckButton
      label="Enable sync"
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        onChange?.(next);
      }}
    />
  );
};

const SpinButtonHarness = ({
  initial = 5,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}) => {
  const [value, setValue] = useState(initial);

  return (
    <SpinButton
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('<CheckButton />', () => {
  const user = userEvent.setup();

  it('should associate the label with the checkbox', () => {
    render(<ControlledCheckButton />);

    const checkbox = screen.getByRole('checkbox', { name: 'Enable sync' });
    expect(checkbox).not.toBeChecked();
  });

  it('should call onChange with the next state on click', async () => {
    const onChange = vi.fn();
    render(<ControlledCheckButton onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Enable sync' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    // The ✓ checkmark contributes to the accessible name once checked.
    expect(screen.getByRole('checkbox', { name: /Enable sync/ })).toBeChecked();
  });

  it('should render the checkmark when checked', () => {
    render(<CheckButton label="Enable sync" checked onChange={vi.fn()} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should not toggle when disabled', async () => {
    const onChange = vi.fn();
    render(<CheckButton label="Locked" checked={false} disabled onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Locked' });
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should start from defaultChecked and toggle internally when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<CheckButton label="Enable sync" defaultChecked onChange={onChange} />);

    // The ✓ checkmark contributes to the accessible name once checked.
    const checkbox = screen.getByRole('checkbox', { name: /Enable sync/ });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(checkbox).not.toBeChecked();
  });

  it('should toggle its internal state without a checked prop', async () => {
    const onChange = vi.fn();
    render(<CheckButton label="Enable sync" onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Enable sync' });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkbox).toBeChecked();
  });

  it('should forward extra props and style to the root element', () => {
    render(
      <CheckButton
        label="Enable sync"
        data-testid="check-button"
        style={{ color: 'rgb(255, 0, 0)' }}
        onChange={vi.fn()}
      />,
    );

    const root = screen.getByTestId('check-button');
    expect(root).toHaveClass('ore-check-button');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});

describe('<RadioButton />', () => {
  const user = userEvent.setup();

  it('should associate the label and expose the group name', () => {
    render(<RadioButton label="Wi-Fi" name="network" checked onChange={vi.fn()} />);

    const radio = screen.getByRole('radio', { name: 'Wi-Fi' });
    expect(radio).toBeChecked();
    expect(radio).toHaveAttribute('name', 'network');
  });

  it('should call onChange when selected', async () => {
    const onChange = vi.fn();
    render(<RadioButton label="Wi-Fi" checked={false} onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Wi-Fi' }));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(<RadioButton label="Wi-Fi" checked={false} disabled onChange={onChange} />);

    const radio = screen.getByRole('radio', { name: 'Wi-Fi' });
    expect(radio).toBeDisabled();

    await user.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should check itself when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<RadioButton label="Wi-Fi" onChange={onChange} />);

    const radio = screen.getByRole('radio', { name: 'Wi-Fi' });
    expect(radio).not.toBeChecked();

    await user.click(radio);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(radio).toBeChecked();
  });

  it('should start from defaultChecked when provided', () => {
    render(<RadioButton label="Wi-Fi" defaultChecked onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Wi-Fi' })).toBeChecked();
  });

  it('should forward extra props to the root element', () => {
    render(<RadioButton label="Wi-Fi" data-testid="radio-button" onChange={vi.fn()} />);

    expect(screen.getByTestId('radio-button')).toHaveClass('ore-radio-button');
  });
});

describe('<Scale />', () => {
  it('should expose a slider with the value attributes', () => {
    render(<Scale value={40} min={0} max={100} onChange={vi.fn()} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('40');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });

  it('should call onChange with the numeric value', () => {
    const onChange = vi.fn();
    render(<Scale value={40} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '72' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(72);
  });

  it('should show the value when requested', () => {
    render(<Scale value={40} showValue onChange={vi.fn()} />);

    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('should disable the slider', () => {
    render(<Scale value={40} disabled onChange={vi.fn()} />);

    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('should update its internal value when uncontrolled', () => {
    const onChange = vi.fn();
    render(<Scale defaultValue={30} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('30');

    fireEvent.change(slider, { target: { value: '60' } });

    expect(onChange).toHaveBeenCalledWith(60);
    expect(slider).toHaveValue('60');
  });

  it('should forward extra props and style to the root element', () => {
    render(<Scale value={40} data-testid="scale" style={{ color: 'rgb(255, 0, 0)' }} onChange={vi.fn()} />);

    const root = screen.getByTestId('scale');
    expect(root).toHaveClass('ore-scale');
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});

describe('<SpinButton />', () => {
  const user = userEvent.setup();

  it('should increase and decrease via the labelled buttons', async () => {
    const onChange = vi.fn();
    render(<SpinButtonHarness onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(6);

    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('should disable the increase button at the maximum', () => {
    render(<SpinButton value={100} min={0} max={100} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeEnabled();
  });

  it('should disable the decrease button at the minimum', () => {
    render(<SpinButton value={0} min={0} max={100} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase' })).toBeEnabled();
  });

  it('should reflect the numeric value', () => {
    render(<SpinButtonHarness />);

    expect(screen.getByRole('spinbutton')).toHaveValue(5);
  });

  it('should clamp typed values to the bounds', () => {
    const onChange = vi.fn();
    render(<SpinButtonHarness min={0} max={10} onChange={onChange} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });

    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('should update its internal value when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<SpinButton defaultValue={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    expect(screen.getByRole('spinbutton')).toHaveValue(6);

    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole('spinbutton')).toHaveValue(5);
  });

  it('should support custom decrease/increase labels', async () => {
    const onChange = vi.fn();
    render(<SpinButton defaultValue={5} decreaseLabel="Less" increaseLabel="More" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(onChange).toHaveBeenLastCalledWith(6);

    await user.click(screen.getByRole('button', { name: 'Less' }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.queryByRole('button', { name: 'Increase' })).not.toBeInTheDocument();
  });

  it('should forward extra props to the root element', () => {
    render(<SpinButton value={5} data-testid="spin-button" onChange={vi.fn()} />);

    expect(screen.getByTestId('spin-button')).toHaveClass('ore-spin-button');
  });
});
