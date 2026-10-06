import { type FC, type ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { useAnimatedUnmount } from '../Dialog/Dialog';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import './BottomSheet.scss';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const BottomSheet: FC<BottomSheetProps> = ({ open, onClose, children, className }) => {
  const { mounted, closing } = useAnimatedUnmount(open, 200);
  const sheetRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open, onClose, containerRef: sheetRef });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      className={cx('ore-bottom-sheet-overlay', { 'ore-bottom-sheet-overlay--closing': closing })}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={cx('ore-bottom-sheet', { 'ore-bottom-sheet--closing': closing }, className)}
      >
        <div className="ore-bottom-sheet__handle" />
        <div className="ore-bottom-sheet__content">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
