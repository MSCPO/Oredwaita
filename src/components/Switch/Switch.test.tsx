import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from '../Switch';

describe('<Switch />', () => {
  const user = userEvent.setup();

  it('should expose an accessible name from aria-label', () => {
    render(<Switch checked={false} onChange={vi.fn()} aria-label="Dark mode" />);

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('should toggle via click and reflect aria-checked', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch checked={false} onChange={onChange} aria-label="Dark mode" />);

    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<Switch checked onChange={onChange} aria-label="Dark mode" />);
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'true');
  });

  it('should resolve its accessible name via aria-labelledby', () => {
    render(
      <>
        <span id="mode-label">Dark mode</span>
        <Switch checked={false} onChange={vi.fn()} aria-labelledby="mode-label" />
      </>,
    );

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('should not toggle when disabled', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} disabled aria-label="Dark mode" />);

    await user.click(screen.getByRole('switch', { name: 'Dark mode' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should toggle its internal state when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<Switch defaultChecked onChange={onChange} aria-label="Dark mode" />);

    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await user.click(toggle);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should start unchecked and toggle internally without a checked prop', async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange} aria-label="Dark mode" />);

    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should prefer the controlled checked over defaultChecked', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} defaultChecked onChange={onChange} aria-label="Dark mode" />);

    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should forward extra props and style to the root element', () => {
    render(<Switch checked onChange={vi.fn()} data-testid="switch" style={{ color: 'rgb(255, 0, 0)' }} />);

    const toggle = screen.getByTestId('switch');
    expect(toggle).toHaveAttribute('role', 'switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });
});
