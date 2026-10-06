import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Toast, ToastOverlay } from '../Toast';

describe('<Toast />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should expose a status role for screen readers', () => {
    render(<Toast title="Saved" />);

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('should auto-dismiss after the timeout', () => {
    const onDismiss = vi.fn();
    render(<Toast title="Saved" timeout={1000} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(999);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not auto-dismiss when timeout is disabled', () => {
    const onDismiss = vi.fn();
    render(<Toast title="Saved" timeout={0} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(10000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('should not restart the timer when the parent re-renders with a fresh onDismiss closure', () => {
    const onDismiss = vi.fn();
    // ToastOverlay passes a new inline closure on every parent render; the timer must survive it.
    const { rerender } = render(<Toast title="First" timeout={4000} onDismiss={() => onDismiss()} />);

    vi.advanceTimersByTime(2000);
    rerender(<Toast title="Second" timeout={4000} onDismiss={() => onDismiss()} />);

    vi.advanceTimersByTime(2000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should invoke the latest onDismiss callback when the timer fires', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(<Toast title="Saved" timeout={2000} onDismiss={first} />);

    rerender(<Toast title="Saved" timeout={2000} onDismiss={latest} />);
    vi.advanceTimersByTime(2000);

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('should render the icon before the title', () => {
    render(<Toast title="Saved" icon={<span data-testid="toast-icon" />} timeout={0} />);

    const iconWrapper = screen.getByTestId('toast-icon').parentElement;
    expect(iconWrapper).toHaveClass('ore-toast__icon');
    expect(iconWrapper?.nextElementSibling).toHaveClass('ore-toast__title');
  });

  it('should forward rest props to the root element while keeping the status role', () => {
    render(<Toast title="Saved" data-testid="toast-root" timeout={0} />);

    expect(screen.getByTestId('toast-root')).toHaveClass('ore-toast');
    expect(screen.getByTestId('toast-root')).toHaveAttribute('role', 'status');
  });
});

describe('<ToastOverlay />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should dismiss id-less toasts under a generated id', () => {
    const onDismissToast = vi.fn();
    render(<ToastOverlay toasts={[{ title: 'A' }, { id: 'own-id', title: 'B' }]} onDismissToast={onDismissToast} />);

    vi.advanceTimersByTime(4000);
    expect(onDismissToast).toHaveBeenCalledWith('toast-0');
    expect(onDismissToast).toHaveBeenCalledWith('own-id');
  });
});
