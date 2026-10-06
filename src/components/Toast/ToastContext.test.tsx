import { type FC } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../Button/Button';
import { type ToastOptions, ToastProvider, useToast } from './ToastContext';

const AddToastHarness: FC<{ toast: ToastOptions }> = ({ toast }) => {
  const { addToast } = useToast();

  return (
    <button type="button" onClick={() => addToast(toast)}>
      Add toast
    </button>
  );
};

const RemoveToastHarness: FC<{ id: string }> = ({ id }) => {
  const { removeToast } = useToast();

  return (
    <button type="button" onClick={() => removeToast(id)}>
      Remove toast
    </button>
  );
};

const InvalidHarness: FC = () => {
  useToast();

  return null;
};

// NOTE: user-event v14 stalls under fake timers in this React 19/vitest stack,
// so interactions here use fireEvent and the assertions stay role/text based.
describe('<ToastProvider />', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should throw when useToast is used without a provider', () => {
    expect(() => render(<InvalidHarness />)).toThrow('useToast must be used within a ToastProvider');
  });

  it('should render a toast added through useToast', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Saved', timeout: 0 }} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('should render several toasts at once', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'First', timeout: 0 }} />
      </ToastProvider>,
    );
    const addButton = screen.getByRole('button', { name: 'Add toast' });

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const toasts = screen.getAllByRole('status');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent('First');
    expect(toasts[1]).toHaveTextContent('First');
  });

  it('should auto-dismiss a toast after its timeout', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Saved', timeout: 1500 }} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should auto-dismiss after the default timeout when none is given', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Saved' }} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should keep a toast that disables the timeout', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Sticky', timeout: 0 }} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should run the toast action button', () => {
    const onRestart = vi.fn();
    render(
      <ToastProvider>
        <AddToastHarness
          toast={{
            title: 'Update ready',
            actions: <Button onClick={onRestart}>Restart</Button>,
            timeout: 0,
          }}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should remove a toast by id through removeToast', () => {
    // The provider derives the id from Date.now() and Math.random(); pin both for determinism.
    vi.setSystemTime(0);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Saved', timeout: 0 }} />
        <RemoveToastHarness id="toast-0-i" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove toast' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    randomSpy.mockRestore();
  });

  it('should ignore removeToast for unknown ids', () => {
    render(
      <ToastProvider>
        <AddToastHarness toast={{ title: 'Saved', timeout: 0 }} />
        <RemoveToastHarness id="toast-unknown" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove toast' }));

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
