import {
  cloneElement,
  type FC,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import { useAnchoredPosition } from '../../hooks/useAnchoredPosition';
import './Tooltip.scss';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** Bubble content; the tooltip stays hidden while it is empty. */
  content: ReactNode;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Milliseconds to wait after hover or focus before opening, mirroring GTK tooltips. */
  delay?: number;
  ref?: Ref<HTMLSpanElement>;
  children: ReactElement;
}

/** Props merged into the cloned trigger element. */
type TriggerProps = HTMLAttributes<HTMLElement>;

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * GNOME HIG style tooltip: a short textual hint that floats over its trigger,
 * like GTK widget tooltips, opening on hover or keyboard focus after a delay.
 */
export const Tooltip: FC<TooltipProps> = ({
  content,
  placement = 'bottom',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delay = 500,
  ref,
  className,
  style,
  children,
  ...rest
}) => {
  const id = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [pendingOpen, setPendingOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const hasContent = content !== null && content !== undefined && content !== '';
  const visible = isOpen && hasContent;
  const anchorRef = useRef<HTMLSpanElement | null>(null);

  const { ref: popupRef, style: anchoredStyle } = useAnchoredPosition({ anchorRef, placement, active: visible });

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  // Hover/focus intent: a pending flag schedules the open through a timeout
  // effect, so leaving early or unmounting cancels it via the effect cleanup.
  const handleEnter = () => {
    if (!isOpen) {
      setPendingOpen(true);
    }
  };

  const handleLeave = () => {
    setPendingOpen(false);
    if (isOpen) {
      setOpen(false);
    }
  };

  // Latest setOpen, so the timeout always reports through the current callback.
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!pendingOpen) {
      return;
    }
    const timer = setTimeout(() => {
      setPendingOpen(false);
      setOpenRef.current(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [pendingOpen, delay]);

  const setWrapperRef = useCallback(
    (node: HTMLSpanElement | null) => {
      anchorRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLSpanElement | null>).current = node;
      }
    },
    [ref],
  );

  const popup =
    visible &&
    createPortal(
      <div
        ref={popupRef}
        id={id}
        role="tooltip"
        className={cx('ore-tooltip__popup', `ore-tooltip__popup--${placement}`)}
        style={anchoredStyle}
      >
        {content}
      </div>,
      document.body,
    );

  const isSingleElement = isValidElement(children);

  if (!isSingleElement && isDev) {
    console.error(
      '[Oredwaita Tooltip] children must be a single ReactElement that can receive mouse and focus listeners; using a plain wrapper instead.',
    );
  }

  if (!isSingleElement) {
    return (
      <span
        {...rest}
        ref={setWrapperRef}
        className={cx('ore-tooltip', 'ore-tooltip--fallback', className)}
        style={style}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-describedby={id}
      >
        {children}
        {popup}
      </span>
    );
  }

  const childProps = children.props as TriggerProps;

  const trigger = cloneElement(children as ReactElement<TriggerProps>, {
    'aria-describedby': [childProps['aria-describedby'], id].filter(Boolean).join(' '),
    onMouseEnter: (event) => {
      childProps.onMouseEnter?.(event);
      handleEnter();
    },
    onMouseLeave: (event) => {
      childProps.onMouseLeave?.(event);
      handleLeave();
    },
    onFocus: (event) => {
      childProps.onFocus?.(event);
      handleEnter();
    },
    onBlur: (event) => {
      childProps.onBlur?.(event);
      handleLeave();
    },
  });

  return (
    <span {...rest} ref={setWrapperRef} className={cx('ore-tooltip', className)} style={style}>
      {trigger}
      {popup}
    </span>
  );
};
