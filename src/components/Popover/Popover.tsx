import {
  type ButtonHTMLAttributes,
  type FC,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { useAnimatedUnmount } from '../Dialog/Dialog';
import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior';
import './Popover.scss';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  position?: 'bottom' | 'top' | 'left' | 'right';
}

export const Popover: FC<PopoverProps> = ({
  open,
  onClose,
  anchorRef,
  children,
  position = 'bottom',
  className,
  style,
  ...rest
}) => {
  const { mounted, closing } = useAnimatedUnmount(open, 180);
  const { ref: popoverRef, style: anchoredStyle } = useAnchoredPosition({
    anchorRef,
    placement: position,
    active: open,
  });
  useOverlayBehavior({ open, onClose, containerRef: popoverRef, modal: false });

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef, popoverRef]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      {...rest}
      ref={popoverRef}
      className={cx('ore-popover', `ore-popover--${position}`, { 'ore-popover--closing': closing }, className)}
      style={{ ...style, ...anchoredStyle }}
    >
      <div className="ore-popover__arrow" />
      <div className="ore-popover__content">{children}</div>
    </div>,
    document.body,
  );
};

export interface PopoverMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export const PopoverMenuItem: FC<PopoverMenuItemProps> = ({
  icon,
  label,
  shortcut,
  destructive = false,
  disabled = false,
  className,
  onClick,
  ...rest
}) => {
  return (
    <button
      {...rest}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cx('ore-popover-menu-item', { 'ore-popover-menu-item--destructive': destructive }, className)}
    >
      {icon && <span className="ore-popover-menu-item__icon">{icon}</span>}
      <span className="ore-popover-menu-item__label">{label}</span>
      {shortcut && <kbd className="ore-popover-menu-item__shortcut">{shortcut}</kbd>}
    </button>
  );
};

export interface PopoverMenuSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  children: ReactNode;
}

export const PopoverMenuSection: FC<PopoverMenuSectionProps> = ({ title, children, className, style, ...rest }) => {
  return (
    <div {...rest} className={cx('ore-popover-menu-section', className)} style={style}>
      {title && <div className="ore-popover-menu-section__title">{title}</div>}
      <div className="ore-popover-menu-section__items">{children}</div>
    </div>
  );
};

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'suggested' | 'flat';
}

export const MenuButton: FC<MenuButtonProps> = ({
  icon = '⋮',
  label,
  children,
  variant = 'flat',
  className,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuKeydown = (event: KeyboardEvent<HTMLElement>) => {
    const items = menuRef.current ? Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    let nextIndex = -1;
    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  };

  return (
    <div className="ore-menu-button-wrapper" style={{ display: 'inline-block' }}>
      <button
        {...rest}
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={handleMenuKeydown}
        className={cx('ore-button', `ore-button--${variant}`, className)}
      >
        {icon && <span className="ore-menu-button__icon">{icon}</span>}
        {label}
      </button>

      <Popover open={open} onClose={() => setOpen(false)} anchorRef={btnRef}>
        <div ref={menuRef} role="menu" tabIndex={-1} onKeyDown={handleMenuKeydown}>
          {children}
        </div>
      </Popover>
    </div>
  );
};
