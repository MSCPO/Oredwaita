import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColorPicker } from './ColorPicker';

describe('<ColorPicker />', () => {
  const user = userEvent.setup();

  // The trigger is queried by class so it stays unique while the popup (with its own buttons) is open.
  const getTriggerSwatch = () =>
    document.body.querySelector<HTMLElement>('.ore-color-picker__trigger .ore-color-picker__swatch');

  it('should show the default color on the trigger swatch', () => {
    render(<ColorPicker aria-label="Pick a color" />);

    const trigger = screen.getByRole('button', { name: 'Pick a color' });
    expect(trigger.querySelector('.ore-color-picker__swatch')).toHaveStyle({ backgroundColor: 'rgb(53, 132, 228)' });
  });

  it('should display the controlled value and follow rerenders', () => {
    const { rerender } = render(<ColorPicker value="#ff0000" />);

    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });

    rerender(<ColorPicker value="#33d17a" />);
    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(51, 209, 122)' });
  });

  it('should start from the defaultValue when uncontrolled', () => {
    render(<ColorPicker defaultValue="#c01c28" />);

    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(192, 28, 40)' });
  });

  it('should open the popup with the preset grid and the custom color row', async () => {
    render(<ColorPicker aria-label="Pick a color" />);

    const trigger = screen.getByRole('button', { name: 'Pick a color' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '#3584e4' })).toBeInTheDocument();
    expect(screen.getByLabelText('Custom color')).toBeInTheDocument();
  });

  it('should call onChange with the normalized hex and mark the selected preset via aria-pressed', async () => {
    const onChange = vi.fn();
    render(<ColorPicker presets={['#1A5FB4', '#33d17a']} onChange={onChange} aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));

    const preset = screen.getByRole('button', { name: '#1A5FB4' });
    expect(preset).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '#33d17a' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(preset);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('#1a5fb4');
    expect(screen.getByRole('button', { name: '#1A5FB4' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should keep the controlled value on screen while reporting changes', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<ColorPicker value="#ff0000" presets={['#0000ff']} onChange={onChange} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button', { name: '#0000ff' }));

    expect(onChange).toHaveBeenCalledWith('#0000ff');
    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });

    rerender(<ColorPicker value="#0000ff" presets={['#0000ff']} onChange={onChange} />);
    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(0, 0, 255)' });
  });

  it('should change the color through the native color input and normalize it', async () => {
    const onChange = vi.fn();
    render(<ColorPicker onChange={onChange} aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));
    fireEvent.change(screen.getByLabelText('Custom color'), { target: { value: '#FFAA00' } });

    expect(onChange).toHaveBeenCalledWith('#ffaa00');
    expect(getTriggerSwatch()).toHaveStyle({ backgroundColor: 'rgb(255, 170, 0)' });
  });

  it('should report rgba output when the opacity slider moves with showAlpha', async () => {
    const onChange = vi.fn();
    render(<ColorPicker showAlpha onChange={onChange} aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));

    const slider = screen.getByRole('slider', { name: 'Opacity' });
    expect(slider).toHaveValue('100');

    fireEvent.change(slider, { target: { value: '50' } });
    expect(onChange).toHaveBeenCalledWith('rgba(53, 132, 228, 0.50)');
    expect(slider).toHaveValue('50');
  });

  it('should not render an opacity slider without showAlpha', async () => {
    render(<ColorPicker aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('should show the localized custom color and opacity labels', async () => {
    render(<ColorPicker showAlpha aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));

    expect(screen.getByText('Custom color')).toBeInTheDocument();
    expect(screen.getByText('Opacity')).toBeInTheDocument();
  });

  it('should close the popup on Escape', async () => {
    render(<ColorPicker aria-label="Pick a color" />);

    await user.click(screen.getByRole('button', { name: 'Pick a color' }));
    expect(screen.getByLabelText('Custom color')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByLabelText('Custom color')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick a color' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('should merge the className onto the root element', () => {
    render(<ColorPicker data-testid="picker" className="extra" />);

    expect(screen.getByTestId('picker')).toHaveClass('ore-color-picker', 'extra');
  });

  it('should forward rest props and style to the root element', () => {
    render(<ColorPicker data-testid="picker" style={{ color: 'rgb(255, 0, 0)' }} />);

    const root = screen.getByTestId('picker');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
