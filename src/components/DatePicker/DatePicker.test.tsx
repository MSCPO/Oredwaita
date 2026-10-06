import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatePicker } from './DatePicker';

const formatted = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);

const fullDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

describe('<DatePicker />', () => {
  const user = userEvent.setup();

  it('should open the dialog with a calendar via the trigger', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);

    await user.click(screen.getByRole('button', { name: formatted(new Date(2026, 0, 15)) }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('should report the picked date, update the trigger text and close', async () => {
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: formatted(new Date(2026, 0, 15)) }));
    await user.click(screen.getByRole('button', { name: fullDate(new Date(2026, 0, 20)) }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(0);
    expect(picked.getDate()).toBe(20);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: formatted(new Date(2026, 0, 20)) })).toHaveTextContent(
      formatted(new Date(2026, 0, 20)),
    );
  });

  it('should keep displaying the controlled value and still report onChange', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker value={new Date(2026, 0, 15)} onChange={onChange} />);

    expect(screen.getByRole('button', { name: formatted(new Date(2026, 0, 15)) })).toHaveTextContent(
      formatted(new Date(2026, 0, 15)),
    );

    rerender(<DatePicker value={new Date(2026, 5, 3)} onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: formatted(new Date(2026, 5, 3)) });
    expect(trigger).toHaveTextContent(formatted(new Date(2026, 5, 3)));

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: fullDate(new Date(2026, 5, 10)) }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getDate()).toBe(10);
    expect(trigger).toHaveTextContent(formatted(new Date(2026, 5, 3)));
  });

  it('should display the defaultValue initially when uncontrolled', () => {
    render(<DatePicker defaultValue={new Date(2025, 11, 25)} />);

    expect(screen.getByRole('button', { name: formatted(new Date(2025, 11, 25)) })).toHaveTextContent(
      formatted(new Date(2025, 11, 25)),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show the placeholder until a date is picked', () => {
    const custom = render(<DatePicker placeholder="Choose a date" />);
    expect(screen.getByRole('button', { name: 'Choose a date' })).toHaveTextContent('Choose a date');
    custom.unmount();

    render(<DatePicker />);
    expect(screen.getByRole('button', { name: 'Pick a date' })).toHaveTextContent('Pick a date');
  });

  it('should not open when disabled', async () => {
    const onChange = vi.fn();
    render(<DatePicker disabled defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: formatted(new Date(2026, 0, 15)) });
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should expose aria-haspopup="dialog" and toggle aria-expanded', async () => {
    render(<DatePicker />);

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should close the dialog on Escape', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);

    await user.click(screen.getByRole('button', { name: formatted(new Date(2026, 0, 15)) }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should forward extra props such as data-testid', () => {
    render(<DatePicker data-testid="date-picker" />);

    expect(screen.getByTestId('date-picker')).toHaveAttribute('class', 'ore-date-picker');
  });

  it('should forward style to the root element', () => {
    const { container } = render(<DatePicker style={{ color: 'rgb(255, 0, 0)' }} />);

    expect(container.firstChild).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
