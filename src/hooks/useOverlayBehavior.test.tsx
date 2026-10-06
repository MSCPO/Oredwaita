import { type FC, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOverlayBehavior } from './useOverlayBehavior';

interface OverlayHarnessProps {
  open: boolean;
  onClose: () => void;
  modal?: boolean;
}

const OverlayHarness: FC<OverlayHarnessProps> = ({ open, onClose, modal = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open, onClose, containerRef, modal });

  if (!open) {
    return null;
  }

  return (
    <div ref={containerRef} tabIndex={-1} role="dialog">
      <button type="button">First</button>
      <button type="button">Middle</button>
      <button type="button">Last</button>
    </div>
  );
};

describe('<useOverlayBehavior />', () => {
  const user = userEvent.setup();

  describe('modal overlays', () => {
    it('should focus the container when opened', () => {
      const onClose = vi.fn();
      const ui = (open: boolean) => (
        <>
          <button type="button">Trigger</button>
          <OverlayHarness open={open} onClose={onClose} />
        </>
      );
      const { rerender } = render(ui(false));
      screen.getByRole('button', { name: 'Trigger' }).focus();

      rerender(ui(true));

      expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('should call onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      render(<OverlayHarness open onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should move Tab from the container to the first focusable element', async () => {
      render(<OverlayHarness open onClose={vi.fn()} />);
      expect(screen.getByRole('dialog')).toHaveFocus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('should let Tab move naturally between inner focusable elements', async () => {
      render(<OverlayHarness open onClose={vi.fn()} />);
      screen.getByRole('button', { name: 'First' }).focus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'Middle' })).toHaveFocus();
    });

    it('should wrap Tab from the last focusable element back to the first', async () => {
      render(<OverlayHarness open onClose={vi.fn()} />);
      screen.getByRole('button', { name: 'Last' }).focus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('should wrap Shift+Tab from the first focusable element back to the last', async () => {
      render(<OverlayHarness open onClose={vi.fn()} />);
      screen.getByRole('button', { name: 'First' }).focus();

      await user.tab({ shift: true });

      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('should restore focus to the previously focused element when closed', () => {
      const onClose = vi.fn();
      const ui = (open: boolean) => (
        <>
          <button type="button">Trigger</button>
          <OverlayHarness open={open} onClose={onClose} />
        </>
      );
      const { rerender } = render(ui(false));
      const trigger = screen.getByRole('button', { name: 'Trigger' });
      trigger.focus();

      rerender(ui(true));
      expect(screen.getByRole('dialog')).toHaveFocus();

      rerender(ui(false));
      expect(trigger).toHaveFocus();
    });
  });

  describe('non-modal overlays', () => {
    const NonModalUi: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
      <>
        <OverlayHarness open={open} onClose={onClose} modal={false} />
        <button type="button">Trigger</button>
      </>
    );

    it('should not steal focus from the previously focused element', () => {
      const onClose = vi.fn();
      const { rerender } = render(<NonModalUi open={false} onClose={onClose} />);
      screen.getByRole('button', { name: 'Trigger' }).focus();

      rerender(<NonModalUi open onClose={onClose} />);

      expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
      expect(screen.getByRole('dialog')).not.toHaveFocus();
    });

    it('should still call onClose when Escape is pressed', async () => {
      const onClose = vi.fn();
      render(<NonModalUi open onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should skip Tab cycling so focus can leave the overlay', async () => {
      const onClose = vi.fn();
      render(<NonModalUi open onClose={onClose} />);
      screen.getByRole('button', { name: 'Last' }).focus();

      await user.tab();

      expect(screen.getByRole('button', { name: 'Trigger' })).toHaveFocus();
    });
  });

  describe('overlay stacking', () => {
    it('should close only the topmost overlay on Escape and the one below on the next press', async () => {
      const closeBottom = vi.fn();
      const closeTop = vi.fn();
      const ui = (topOpen: boolean) => (
        <>
          <OverlayHarness open onClose={closeBottom} />
          <OverlayHarness open={topOpen} onClose={closeTop} />
        </>
      );
      const { rerender } = render(ui(true));

      await user.keyboard('{Escape}');
      expect(closeTop).toHaveBeenCalledTimes(1);
      expect(closeBottom).not.toHaveBeenCalled();

      rerender(ui(false));
      await user.keyboard('{Escape}');
      expect(closeTop).toHaveBeenCalledTimes(1);
      expect(closeBottom).toHaveBeenCalledTimes(1);
    });

    it('should close only the topmost non-modal overlay stacked over a modal one', async () => {
      const closeDialog = vi.fn();
      const closePopover = vi.fn();
      const ui = (popoverOpen: boolean) => (
        <>
          <OverlayHarness open onClose={closeDialog} />
          <OverlayHarness open={popoverOpen} onClose={closePopover} modal={false} />
        </>
      );
      const { rerender } = render(ui(true));

      await user.keyboard('{Escape}');
      expect(closePopover).toHaveBeenCalledTimes(1);
      expect(closeDialog).not.toHaveBeenCalled();

      rerender(ui(false));
      await user.keyboard('{Escape}');
      expect(closeDialog).toHaveBeenCalledTimes(1);
    });
  });
});
