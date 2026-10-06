import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BottomSheet } from './BottomSheet';

describe('<BottomSheet />', () => {
  const user = userEvent.setup();

  it('should render the sheet with its content when open', () => {
    render(
      <BottomSheet open onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('should render nothing when closed', () => {
    render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the overlay itself is clicked', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    await user.click(screen.getByRole('presentation'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside the sheet', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    await user.click(screen.getByText('Sheet content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  describe('closing animation', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const ui = (open: boolean, onClose: () => void) => (
      <BottomSheet open={open} onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );

    it('should stay mounted with closing classes until the animation ends', () => {
      const onClose = vi.fn();
      const { rerender } = render(ui(true, onClose));
      rerender(ui(false, onClose));

      expect(screen.getByRole('dialog')).toHaveClass('ore-bottom-sheet--closing');
      expect(screen.getByRole('presentation')).toHaveClass('ore-bottom-sheet-overlay--closing');

      act(() => {
        vi.advanceTimersByTime(199);
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should be mountable again after the closing animation', () => {
      const onClose = vi.fn();
      const { rerender } = render(ui(true, onClose));
      rerender(ui(false, onClose));
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(ui(true, onClose));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).not.toHaveClass('ore-bottom-sheet--closing');
    });
  });
});
